const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
  },
});
const port = process.env.PORT||4000;

let waitingPlayer = null; // Store a socket for the first player waiting for a match

const handle=(socket,waitingPlayer)=>{
  const roomName = `room_${socket.id}_${waitingPlayer.id}`; // Create a unique room name
  console.log(`Creating room: ${roomName}`);
  socket.join(roomName);
  waitingPlayer.join(roomName);
  io.to(roomName).emit('roomCreated', roomName);


  //colors
  io.to(socket.id).emit('color','w'); //giving white color
  io.to(waitingPlayer.id).emit('color','b'); //giving black color


 //after player move it emits the msg to other player
  waitingPlayer.on("move",(payload)=>{
    //sending only to the other socket
    io.to(socket.id).emit("movedone",waitingPlayer.id,payload);
  })

  socket.on("move",(payload)=>{
   io.to(waitingPlayer.id).emit("movedone",socket.id,payload);
  })
  
  socket.on('message', (message) => {
    io.to(roomName).emit('messageReceived', socket.id, message); // Broadcast to all clients in the room
  });
}

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

   // you can give ant name that string 
   socket.on("chat",(payload)=>{
    console.log("payload :",payload);
    io.emit("chat",payload);
   });
   // ############################
   

  // Create a room on request
  socket.on("createroom", () => {
    if (waitingPlayer) {
      
     handle(socket,waitingPlayer);
   
      //this creates a prooblem
      waitingPlayer = null; 
    } else {
      waitingPlayer = socket;
      console.log(`Player ${socket.id} waiting for a match...`);
    }
  });

  // ... other event handlers (chat, move, etc.)
});

server.listen(port, () => {
  console.log(`Server is listening on ${port}...`);
});

