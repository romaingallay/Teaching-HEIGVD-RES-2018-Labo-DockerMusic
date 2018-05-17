FROM node:4.3.1
MAINTAINER Romain Gallay <romain.gallay@heig-vd.ch>

COPY src /opt/app/

WORKDIR /opt/app/
RUN npm install

ENTRYPOINT ["node", "/opt/app/auditor.js"]