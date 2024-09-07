const fs = require('fs');
const ScheduleEntry = require("../models/ScheduleEntry");
const User = require("../models/User");

const checkConsistency = async(req, res) => {
    // FILE - SCHEDULEENTRY LINKS

    const uploadFolder = `public/${process.env.USER_UPLOAD_DIRECTORY}`;
    const uploadedFiles = fs.readdirSync(uploadFolder);
    
    const scheduleEntries = await ScheduleEntry.find({}, {images: 1, videos: 1, audios: 1})

    var allUrls = [];
    for (var i=0;i<scheduleEntries.length;i++) {
        allUrls = allUrls.concat(scheduleEntries[i].images).concat(scheduleEntries[i].videos).concat(scheduleEntries[i].audios);
    }
    for (var i=0;i<allUrls.length;i++) {
        var split = allUrls[i].split("/");
        allUrls[i] = split[split.length-1];
    }

    const differenceBetweenFilesAndLinks = differenceHelper(allUrls, uploadedFiles);


    // SCHEDULE ENTRY - USER LINKS
    const scheduleEntryIdsFromUser = await User.find({}, {_id: 0, scheduleEntries: 1})

    var flattenedFromUser = [];
    for (var i=0;i<scheduleEntryIdsFromUser.length;i++) {
        flattenedFromUser = flattenedFromUser.concat(scheduleEntryIdsFromUser[i].scheduleEntries);
    }

    const scheduleEntryIds = await ScheduleEntry.find({}, {_id: 1});

    var convertedFromScheduleEntry = [];
    for (var i=0;i<scheduleEntryIds.length;i++) {
        convertedFromScheduleEntry = convertedFromScheduleEntry.concat(scheduleEntryIds[i]._id );
    }

    const differenceBetweenScheduleEntriesAndLinks = differenceHelper(flattenedFromUser, convertedFromScheduleEntry);

    res.send({differenceBetweenFilesAndLinks, differenceBetweenScheduleEntriesAndLinks} );
};


function differenceHelper(...arrays) {
    let items = {}

    for (let [n, a] of arrays.entries())
        for (let x of a) {
            items[x] = (items[x] ?? 0) | (1 << n)
        }

    return Object.keys(items).filter(x => 
        Number.isInteger(Math.log2(items[x])))
}

module.exports = checkConsistency;