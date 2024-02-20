// const { Socket } = require('dgram');
const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const formatMessage = require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getroomUsers} = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = "ChatCord Bot";

//run when client connects
io.on('connection', socket => {
    socket.on('joinRoom',({username , room})=>{
        const user = userJoin(socket.id,username,room);
        socket.join(user.room);
        
        // welcome current user.
        socket.emit('message',formatMessage(botName,'Welcome to Chatcord!'));  // to specififc user

        //broadcast to everyone except user
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));



        // Send users and room info
         io.to(user.room).emit('roomUsers',{
            room : user.room,
            users : getroomUsers(user.room)
         });

    })   


    //Listen for chat Message
    socket.on('chatMessage', msg =>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(`${user.username}`,msg));
    })

     
    // clients disconnects.
    socket.on('disconnect',() =>{ 
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));

        }

         // Send users and room info
         io.to(user.room).emit('roomUsers',{
            room : user.room,
            users : getroomUsers(user.room)
         });

    }); 

});

const PORT = 3000 || process.env.PORT; // use 3000 if not any specified.


server.listen(PORT,() =>{
    console.log(`listening on port ${PORT}`);
})
