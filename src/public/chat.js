const socketClient = io();

let usuario = prompt('Por favor, ingrese su correo electronico.');
console.log(usuario);

const formulario = document.getElementById('formulario');
const input = document.getElementById('mensaje');
const messages = document.getElementById('messages');

formulario.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (input.value) {
        socketClient.emit('chatmessage', { user: usuario, message: input.value });
        input.value = '';
    }
});


// Handle incoming messages

socketClient.on("chat", (e) => {

    render(e)

})



const render = (e) => {

    let div = document.createElement("div");

    div.innerHTML = `

      <p>${e.user}:</p>

      <p>${e.message}</p>

      `;

    chat.appendChild(div);

};


