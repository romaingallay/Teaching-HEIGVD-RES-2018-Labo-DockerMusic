var protocol = require('./protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams 
 */
var s = dgram.createSocket('udp4');

/*
 * A package to generate the uuid 
 */
var uuid = require('uuid');
/*
 * A map containing the instruments with their sound 
 */
var instruments = new Map([
	["piano", "ti-ta-ti"],
	["trumpet", "pouet"],
	["flute", "trulu"],
	["violin", "gzi-gzi"],
	["drum", "boum-boum"]
]);


function Musician(instrument) {

	this.instrument = instrument;
    this.uuid = uuid.v4()

    Musician.prototype.update = function () {

		var musician = {
			uuid: this.uuid,
			sound: instruments.get(instrument)
		};
		var payload = JSON.stringify(musician);

		/*		
		 * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
	     * the multicast address. All subscribers to this address will receive the message.
	     */
		message = new Buffer(payload);
		s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function (err, bytes) {
			console.log("Sending payload: " + payload + " via port " + s.address().port);
        });
    }
    /*
	 * Let's take and send a measure every 1000 ms
	 */
    setInterval(this.update.bind(this), 1000);
}

var instrument = process.argv[2];

var musicien = new Musician(instrument);