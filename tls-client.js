var tls = require('tls');
var fs = require('fs');

var listeners = new Object();
var retryCount = 10;
var retryInterval = 15000;
var retryIntervalCounter = null;
var tlsClient;

var options = {
  // These are necessary only if using the client certificate authentication
  key: fs.readFileSync('./keys/client-np.key'),
  cert: fs.readFileSync('./keys/client.crt'),

  // This is necessary only if the server uses the self-signed certificate
  ca: [ fs.readFileSync('./keys/ca.crt') ]
};

var connect = function() {
  tlsClient = tls.connect(8000, options, function() {
    console.log('client connected', tlsClient.authorized ? 'authorized' : 'unauthorized');
    if (!!retryIntervalCounter) {
      clearInterval(retryIntervalCounter);
      retryIntervalCounter = null;
    }
    tlsClient.setEncoding('utf8');
    var recieverCfgBuff = fs.readFileSync('./tls-client.cfg');
    recCfg = JSON.parse(recieverCfgBuff.toString());
    startListener(recCfg,tlsClient);
  });

tlsClient.on('error', function(data){
  console.log('Connection error. Restarting...');
  //setInterval(connect,retryInterval);
});

tlsClient.on('data', function(data) {
  console.log(data);
});

tlsClient.on('end', function() {
  //lost connections come here
  console.log('Connection ended. Restarting...');
  retryIntervalCounter = setInterval(connect,retryInterval);
});

}

//start listening

var startListener = function(config,clearTxtStream) {
  //check config
  if (!!config && !!config.type && !!config.port && !!config.key) {
    if (config.type == 'tcp') {
      //TBD
    } else if (config.type == 'udp4') {
      
      //check port is > 1024
      if (config.port > 1024) {
        var dgram = require("dgram");
        var server = dgram.createSocket("udp4");
        
        server.on('message', function(data){
          message = {
            'clientID': config.key,
            'message': data.toString()
          };
          
          var strMessage = JSON.stringify(message)
          if (clearTxtStream.writable == true) {
            console.log(strMessage);
            clearTxtStream.write(strMessage + '::::','utf8');  
          }
          
        });
        
        server.on('listening',function(data){
          console.log('Syslog Listening on ' + config.type + ':' + config.port);
        });
        
        if (!!listeners[config.type + ':' + config.port]) {
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