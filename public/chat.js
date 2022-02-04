const socket = io();

//DOM elements
let username = document.getElementById('username');
let message = document.getElementById('message');
let btn = document.getElementById('send');
let output = document.getElementById('output');
let actions = document.getElementById('actions');

btn.addEventListener('click', function () {
    socket.emit('chat:message', {
        username: username.value,
        message: message.value
    })

    console.log({
        username: username.value,
        message: message.value
    })
})

message.addEventListener('keypress', function () {
    socket.emit('chat:write', username.value)
});

socket.on('chat:data', function (data) {
    output.innerHTML += `<p>
        <strong>${data.username}</strong>: ${data.message}        
    </p>`
});

socket.on('chat:userWrite', function (data) {
    actions.innerHTML = `<p><em>${data}</em>: esta escribiendo...</p>`
});