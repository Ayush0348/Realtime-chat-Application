const chatform = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');

const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


//Get username and room for url
const {username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true,
})


const socket = io();

//join chat room
socket.emit('joinRoom',{username,room});


// get room and users
socket.on('roomUsers',({room,users}) =>{
    outputRoomName(room);
    outputUsers(users);
});


//Message from server
socket.on('message',message =>{
    // console.log(message);
    outputmessage(message);


    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
    // uper se kha tak scroll karu  - complete height of that component.

})

chatform.addEventListener('submit', (e) =>{
    e.preventDefault();

    //Get message text
    const msg = e.target.elements.msg.value;

    // emit message to server
    socket.emit('chatMessage',msg);


    // clear previous input field
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
    // After clearing the input field, it sets the focus back to the input field, making it ready for the user to type the next message without needing to click on it.
})


// output message for dom.
function outputmessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class = "meta">${message.username}<span>${message.time}</span></p>
    <p class = "text">
    ${message.text}
    </p>`;

    document.querySelector('.chat-messages').appendChild(div);

}



//Add room name to dom
function outputRoomName(room){
    roomName.innerText = room;
}

//Add users to DOM
function outputUsers(users){
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join()}`;
}