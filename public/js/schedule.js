//Create websocket connection
const socket = new WebSocket(webSocketUrl);

//Connection opened
socket.addEventListener('open', function (event) {
    // socket.send('Hello Server!');
})

//Listen for messages
socket.addEventListener('message', function (event) {
    location.reload();
})

socket.onclose = function(e) {
    console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
    setTimeout(function() {
        connect();
    }, 1000);
};

socket.onerror = function(err) {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
socket.close();
};
