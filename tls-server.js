var tls = require('tls');
var fs = require('fs');
var dgram = require('dgram');
var udpClient = dgram.createSocket("udp4");

var options = {
  key: fs.readFileSync('./keys/server-np.key'),
  cert: fs.readFileSync('./keys/server.crt'),

  // This is necessary only if using the client certificate authentication.
  requestCert: false,

  // This is necessary only if the client uses the self-signed certificate.
  ca: [ fs.readFileSync('./keys/ca.crt') ]
};

function sendMessage(message) {
  buff = new Buffer(message);
  udpClient.send(buff, 0, buff.length, 1234, "localhost");
};

var server = tls.createServer(options, function(cleartextStream) {
  console.log('server connected',
              cleartextStream.authorized ? 'authorized' : 'unauthorized');
  cleartextStream.write("welcome!\n");
  cleartextStream.setEncoding('utf8');
  
  cleartextStream.on('data',function(data) {
    console.log(data.length);
    //decompress message
    if (data.split('::::').length > 1) {
      var array = data.split('::::');
      for (var i in array) {
        if (array[i].length > 1) {
          try {
            var value = JSON.parse(array[i]);
            sendMessage(value.message);
          } catch (err) {
            
          }
        }
      }
    } else {
      //do nothing as data isnt complete 
    };

  });
});

server.listen(8000, function() {
  console.log('server bound');
});