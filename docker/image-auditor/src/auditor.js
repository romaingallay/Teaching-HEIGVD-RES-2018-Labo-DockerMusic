var protocol = require('./protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * We use a standard Node.js module to work with TCP
 */
var net = require('net');

var musicians = new Array();

var sounds = new Map([
    ["trulu", "flute"],
    ["ti-ta-ti", "piano"],
    ["pouet", "trumpet"],
    ["gzi-gzi", "violin"],
    ["boum-boum", "drum"]
]);

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by musicians
 */
var s = dgram.createSocket('udp4');
s.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

/* 
 * This call back is invoked when a new datagram has arrived.
 */
s.on('message', function(msg, source) {
    console.log("Data has arrived: " + msg + ". Source port: " + source.port);
    var soundReceived = JSON.parse(msg);

    var musician = {
		uuid: soundReceived.uuid,
		instrument: sounds.get(soundReceived.sound),
		activeSince: Date.now()
    };
    addOrUpdateMusician(musician);
});

var serverTCP = net.createServer((socket) => {
    console.log("TCP request received, sending active musicians...");

    musiciansControl();
    socket.write(JSON.stringify(musicians));
    socket.pipe(socket);
    socket.end(); // replace by socket.end(jsonshit) ? instead of write, pipe, end

}).listen(2205, '0.0.0.0'); // try without 0.0.0.0

console.log('Server TCP listening on port 2205');

function musiciansControl(){
    var now = Date.now();
    for(var i = 0;  i < musicians.length; ++i){
        if(now - musicians[i].activeSince > 5000){
            musicians.splice(i,1);
        }
    }
}

function addOrUpdateMusician(musician){

    var newMusician = true;

    for(var i = 0; i < musicians.length; ++i){
        if(musician.uuid === musicians[i].uuid){
            musicians[i].activeSince = musician.activeSince;
            newMusician = false;
        }
    }

    if(newMusician){
        musicians.push(musician);
    }
}