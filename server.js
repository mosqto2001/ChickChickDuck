const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;

let players = {};
var star = {
  x: Math.floor(Math.random() * 700) + 50,
  y: Math.floor(Math.random() * 500) + 50,
};
let scores = [];
let playerCount = 0;

app.use(express.static(__dirname + "/public"));
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
  console.log("user connected");

  // create a new player
  players[socket.id] = {
    rotation: 0,
    x: 150,
    y: 150,
    playerId: socket.id,
    playerName: `Player${++playerCount}`,
    score: 0,
  };
  // send the players object to the new player
  socket.emit("currentPlayers", players);
  // update all other players of the new player
  socket.broadcast.emit("newPlayer", players[socket.id], players);
  socket.on("disconnect", function () {
    console.log("user disconnected");

    delete players[socket.id];
    io.emit("playerDisconnect", socket.id);
    // io.emit("resetScorebroad", players);
  });

  // when a player moves, update the player data
  socket.on("playerMovement", function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].animation = movementData.animation;
    players[socket.id].flipX = movementData.flipX;
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });


//   socket.on("chon", function (p,p1) {
//  console.log("p2 " + p)
//  console.log("p1 " + p1)
//   });
  
});

server.listen(port, function () {
  console.log(`Listening on ${server.address().port}`);
});

// socket.emit('message', "this is a test"); //sending to sender-client only
// socket.broadcast.emit('message', "this is a test"); //sending to all clients except sender
// socket.broadcast.to('game').emit('message', 'nice game'); //sending to all clients in 'game' room(channel) except sender
// socket.to('game').emit('message', 'enjoy the game'); //sending to sender client, only if they are in 'game' room(channel)
// socket.broadcast.to(socketid).emit('message', 'for your eyes only'); //sending to individual socketid
// io.emit('message', "this is a test"); //sending to all clients, include sender
// io.in('game').emit('message', 'cool game'); //sending to all clients in 'game' room(channel), include sender
// io.of('myNamespace').emit('message', 'gg'); //sending to all clients in namespace 'myNamespace', include sender
// socket.emit(); //send to all connected clients
// socket.broadcast.emit(); //send to all connected clients except the one that sent the message
// socket.on(); //event listener, can be called on client to execute on server
// io.sockets.socket(); //for emiting to specific clients
// io.sockets.emit(); //send to all connected clients (same as socket.emit)
// io.sockets.on() ; //initial connection from a client.
