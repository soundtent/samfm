function connect() {
    //Create websocket connection
    const socket = new WebSocket(webSocketUrl);
    //Connection opened
    socket.addEventListener('open', function (event) {
        console.log('Socket is open');
    })
    //Listen for messages
    socket.addEventListener('message', function (event) {
        var message = JSON.parse(event.data);
        if (message.nowPlaying) {
            loadNowPlayingEntry();
        }
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

    loadNowPlayingEntry();
}


function loadNowPlayingEntry() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/sam_fm/api/schedule-entries/now-playing", true);
    xhr.onreadystatechange = function () {
        console.log("Received nowPlayingEntry");
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            var scheduleEntry = data.scheduleEntry;
            console.log(scheduleEntry);
            $(".now-playing__location").html(scheduleEntry.location);
            $(".now-playing__location").attr("href",`/schedule-entries/sam_fm/${scheduleEntry._id}`);
            $(".now-playing__participants").html(scheduleEntry.participants);
            $(".now-playing__description").html(scheduleEntry.description);
            var imageString = "";
            if (data.generatedUrls.images.length > 0 ) {
                imageString = "<img class='now-playing__image' src='"+data.generatedUrls.images[0]+"'>";
            }
            $(".now-playing__images").html(imageString);

            var vidString = "";
            if (data.generatedUrls.videos.length > 0) {
                vidString = "<video class='now-playing__video' controls><source src='"+data.generatedUrls.videos[0]+"'></video>";
            }
            $(".now-playing__videos").html(vidString);
        }
    };
    xhr.send();
}

connect();