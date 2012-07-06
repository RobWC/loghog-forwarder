var dgram = require('dgram');
var date = new Date();
var message = new Buffer("Some Data");
  var client = dgram.createSocket("udp4");
  
client.send(message, 0, message.length, 1234, "localhost", function(err, bytes) {
  client.close();
});
