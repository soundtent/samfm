//Create websocket connection
const socket = new WebSocket(webSocketUrl);

//Connection opened
socket.addEventListener('open', function (event) {
    // socket.send('Hello Server!');
})

//Listen for messages
socket.addEventListener('message', function (event) {
    if (event.data == "refresh") {
        location.reload();
    }
})