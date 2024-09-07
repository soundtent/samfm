const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { unlink } = require('fs');

ScheduleEntrySchema = new mongoose.Schema({
    location: {
        type: String,
        default: "",
        required: true
    },
    participants: {
        type: String,
        default: "",
        required: true
    },
    description: {
        type: String,
        default: "",
        required: true
    },
    notes: {
        type: String,
        default: ""
    },
    nowPlaying: {
        type: Boolean,
        default: false
    },
    images: [{
        type: String,
        default: ""
    }],
    videos: [{
        type: String,
        default: ""
    }],
    audios: [{
        type: String,
        default: ""
    }],
    startTime: {
        type: Date,
        default: Date.now,
        required: true
    },
    endTime: {
        type: Date,
        default: dayjs().toDate(),
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});

ScheduleEntrySchema.statics.setNowPlaying = async (id=null) => {
    console.log(`ScheduleEntry.setNowPlaying(${id})`);
    const themodel = mongoose.model("ScheduleEntry");

    await themodel.updateMany({}, {nowPlaying: false});
    if (id) {
        await themodel.updateOne({_id: id}, {nowPlaying: true});
    }
};

ScheduleEntrySchema.statics.getNowPlaying = async() => {
    console.log(`ScheduleEntry.getNowPlaying()`);
    const themodel = mongoose.model("ScheduleEntry");
    const nowPlayingEntry = await themodel.findOne({nowPlaying: true});
    return nowPlayingEntry;
};

ScheduleEntrySchema.statics.deleteFilesAndLinks = async(id, fieldName, urlsToExclude=[]) => { 
    console.log(`ScheduleEntry.deleteFiles(${id})`);
    const themodel = mongoose.model("ScheduleEntry");
    const scheduleEntry = await themodel.findOne({_id: id});

    var urlsToDelete = scheduleEntry[fieldName];
    urlsToDelete = urlsToDelete.filter( function( el ) {
        return !urlsToExclude.includes( el );
    } );

    for (var i=0;i<urlsToDelete.length;i++) {
        unlink(urlsToDelete[i], (err) => { if (err) throw err; });
    }
    await themodel.updateOne({_id: id},{
        $pull: {
            [fieldName]: {$in: urlsToDelete},
        }
    });
};

ScheduleEntrySchema.statics.addFile = async(id, fieldName, filepath) => { 
    console.log(`ScheduleEntry.addFile(${id}, ${filepath}, ${fieldName})`);
    const themodel = mongoose.model("ScheduleEntry");
    var fieldName = fieldName+"s";
    await themodel.updateOne({_id: id}, { $push: { [fieldName]: filepath} } );
};

module.exports = mongoose.model('ScheduleEntry', ScheduleEntrySchema);