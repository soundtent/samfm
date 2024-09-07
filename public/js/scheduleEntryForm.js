
function deleteImageOrVideoUpload(delButton) {
    $(delButton).parent().remove();
    $(".imageOrVideoUpload__input").removeClass("hidden");
}

function deleteAudioUpload(delButton) {
    $(delButton).parent().remove();
}

function addAudioUpload(addButton) {
    var newAudio = $.parseHTML("<div><input type='file' name='upload' accept='audio/*' /><a onclick='this.parentElement.remove()'>[del]</a></div>");
    $(addButton).before(newAudio);
}