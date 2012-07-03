var io = require('socket.io').listen(2000);

// socket.io

//configure authorization
io.configure('production',function (){
  io.set('authorization', function (handshakeData, callback) {
    callback(null, true); // error first callback style 
  });
});

io.sockets.on('connection', function(client){
    // new client is here!
    console.log('client has connected');
    client.on('message', function(data){
      console.log(data);  
    })
});