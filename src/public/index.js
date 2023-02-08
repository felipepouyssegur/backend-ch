const socketClient = io();
const input = document.getElementById("input");
const form = document.getElementById("form");
const output = document.getElementById("output");

form.onsubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
    socketClient.emit("sendValue", {
        value: input.value

    });
};

socketClient.on("sendValue", (data) => {
    console.log('HOLAAA', data)
    output.innerHTML = `<p>Value: ${data.value}</p>`;
});

