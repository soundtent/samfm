
function deleteImageOrVideoUpload(delButton) {
    $(delButton).parent().remove();
    $(".imageOrVideoUpload__input").removeClass("hidden");
}

function deleteAudioUpload(delButton) {
    $(delButton).parent().remove();
}

function addAudioUpload(addButton) {
    var newAudio = $.parseHTML("<div><input type='file' name='upload' accept='audio/*' />&nbsp;<a onclick='this.parentElement.remove()'>delete</a></div>");
    $(addButton).before(newAudio);
}