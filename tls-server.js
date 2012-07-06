var tls = require('tls');
var fs = require('fs');

var options = {
  key: fs.readFileSync('./keys/server-np.key'),
  cert: fs.readFileSync('./keys/server.crt'),

  // This is necessary only if using the client certificate authentication.
  requestCert: false,

  // This is necessary only if the client uses the self-signed certificate.
  ca: [ fs.readFileSync('./keys/ca.crt') ]
};

var server = tls.createServer(options, function(cleartextStream) {
  console.log('server connected',
              cleartextStream.authorized ? 'authorized' : 'unauthorized');
  cleartextStream.write("welcome!\n");
  cleartextStream.setEncoding('utf8');
  
  cleartextStream.on('data',function(data) {
    console.log(data.length)
    console.log(data);
  });
});

server.listen(8000, function() {
  console.log('server bound');
});