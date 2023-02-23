const socketClient = io();


let usuario = prompt('Por favor, ingrese su correo electronico.');
console.log(usuario);

const formulario = document.getElementById('formulario');
const input = document.getElementById('mensaje');
const messages = document.getElementById('messages');

formulario.addEventListener('submit', (event) => {
    event.preventDefault();
    if (input.value) {
        socketClient.emit('chat message', { user: usuario, message: input.value });
        input.value = '';
    }
});

// Handle incoming messages
socketClient.on('chat message', (msg) => {
    console.log(`Message received: ${msg.user}: ${msg.message}`);
    socketClient.emit('chat message', msg);
});