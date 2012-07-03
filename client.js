var ioClient = require('socket.io-client');

var client = ioClient.connect('http://localhost:2000');

client.on('connect', function () {
  // socket connected
});

client.on('connect', function () {
  // socket connected
});
client.on('custom event', function () {
  // server emitted a custom event
});
client.on('disconnect', function () {
  // socket disconnected
});

client.send('hello');


//udp listener
var dgram = require("dgram");
var listenPort = 1234;

var server = dgram.createSocket("udp4");

server.on("message", function(msg, rinfo) {
  client.send(msg);
});

server.on("listening", function() {
  var address = server.address();
  console.log("server listening " + address.address + ":" + address.port);
});

server.bind(listenPort);