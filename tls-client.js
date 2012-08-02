var tls = require('tls');
var fs = require('fs');
var zlib = require('zlib');

var listeners = new Object();
var retryCount = 10;
var retryInterval = 15000;
var retryIntervalCounterErr = null;
var retryIntervalCounterClose = null;
var tlsClient;

var options = {
  // These are necessary only if using the client certificate authentication
  key: fs.readFileSync('./keys/client-np.key'),
  cert: fs.readFileSync('./keys/client.crt'),

  // This is necessary only if the server uses the self-signed certificate
  ca: [fs.readFileSync('./keys/ca.crt')]
};

var connect = function() {
  var recieverCfgBuff = fs.readFileSync('./tls-client.cfg');
  recCfg = JSON.parse(recieverCfgBuff.toString());
  
  tlsClient = tls.connect(8000, recCfg.stcServer, options, function() {
    if ( !! retryIntervalCounterClose) {
      clearInterval(retryIntervalCounterClose);
      retryIntervalCounterClose = null;
    }
    if (!!retryIntervalCounterErr) {
      clearInterval(retryIntervalCounterErr);
      retryIntervalCounterErr = null;
    }
    tlsClient.setEncoding('utf8');
    startListener(recCfg, tlsClient);
  });

  tlsClient.on('error', function(data) {
    console.log('Connection error. Restarting...');
    retryIntervalCounterErr = setInterval(connect, retryInterval);
  });

  tlsClient.on('data', function(data) {
    //do nothing for now
  });

  tlsClient.on('end', function() {
    //lost connections come here
    console.log('Connection ended. Restarting...');
    retryIntervalCounterClose = setInterval(connect, retryInterval);
  });

}

//start listening
var startListener = function(config, clearTxtStream) {
  //check config
  if ( !! config && !! config.type && !! config.port && !! config.key) {
    if (config.type == 'tcp') {
      //TBD
    } else if (config.type == 'udp4') {
      if (config.port > 1024) {
        var dgram = require("dgram");
        var server = dgram.createSocket("udp4");

        server.on('message', function(data) {
          
          message = {
            'clientID': config.key,
            'message': data.toString()
          };        
          
          if (config.compress == true) {
            if (clearTxtStream.writable == true) {
              clearTxtStream.write(JSON.stringify(message) + '::::', 'utf8');
            }
          } else {            
            zlib.gzip(new Buffer(JSON.stringify(message)+ '::::'), function(data,buffer) {
              if (clearTxtStream.writable == true) {
                clearTxtStream.write(buffer);
              };
            });
          };

        });

        server.on('listening', function(data) {
          console.log('Syslog Listening on ' + config.type + ':' + config.port);
        });

        if ( !! listeners[config.type + ':' + config.port]) {
          listeners[config.type + ':' + config.port].close();
        }

        server.bind(config.port);

        listeners[config.type + ':' + config.port] = server;

      } else {
        //throw error
      };
    }
  } else {
    //config is poor throw error
  }
};


connect();