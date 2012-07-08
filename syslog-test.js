var dgram = require('dgram');
var date = new Date();
var message = new Buffer("Some Data");
var client = dgram.createSocket("udp4");

function sendMessage(message) {
  buff = new Buffer(message);
  client.send(buff, 0, buff.length, 1234, "localhost");
};

setInterval(sendMessage,1,message);
