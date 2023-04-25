const socketClient = io();

let usuario = prompt('Por favor, ingrese su correo electronico.');
console.log(usuario);

const formulario = document.getElementById('formulario');
const input = document.getElementById('mensaje');
const messages = document.getElementById('messages');

socketClient.on('connect', (req, res) => {
    formulario.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (input.value) {
            socketClient.emit('chatmessage', { user: usuario, message: input.value });
            input.value = '';
        }
    });

});

// Handle incoming messages
socketClient.on('chat', (message) => {
    render(message);
});

socketClient.on('allMessages', (messages) => {
    messages.forEach((message) => {
        render(message);
    });
});

const render = (e) => {
    if (renderedMessages.has(e._id)) { // Verifica si el mensaje ya se ha renderizado
        return;
    }
    let div = document.createElement("div");
    div.innerHTML = `
    <p>${e.user}:</p>
    <p>${e.message}</p>
  `;
    div.setAttribute("data-id", e._id); // Agrega el atributo data-id
    chat.appendChild(div);
    renderedMessages.add(e._id); // Agrega el ID del mensaje a la lista de mensajes renderizados
};

let renderedMessages = new Set();

const showAllMessages = async () => {
    const response = await fetch("/api/messages");
    const messages = await response.json();
    messages.forEach(render);
    messages.forEach((message) => renderedMessages.add(message._id));
};





