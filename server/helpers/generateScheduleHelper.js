const ScheduleEntry = require("../models/ScheduleEntry");
const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/isBetween'));

exports.generateSchedule = async() => {
    
    const scheduleEntryModels = await ScheduleEntry.find({});
    var scheduleEntries = scheduleEntryModels.map(function(model) { return model.toObject(); });
    var scheduleData = [];

    dayjs.tz.setDefault("Europe/Berlin");
    // dayjs.tz.setDefault("America/New_York");

    const startDate = dayjs.tz("2024-09-08 00:00:00");

    const numberOfDays = 5;
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (var i=0;i<numberOfDays;i++) { 
        var dayStart = startDate.add(i, 'day');
        var dayEnd = startDate.add(i+1, 'day');
        var weekday = weekdays[dayStart.day()];
        // var timeNow = dayjs.tz();
    
        var columns = [];
    
        scheduleEntries.forEach( (entry) => {
            var entryStartTime = dayjs(entry.startTime);
            var entryEndTime = dayjs(entry.endTime);
            var timeNow = dayjs.tz();    

            //startTime and endTime occur during this day
            if (entryStartTime.isBetween(dayStart, dayEnd) ) {
                var entryString = entryStartTime.format("hh:mm") + " &ndash; " + entryEndTime.format("hh:mm");
                columns.push({content: entryString, scheduleEntry: entry} );
            }
    
            var entryString;
            //startTime occurs during this day
            if (entryStartTime.isBetween(dayStart, dayEnd) ) {
                entryString = entryStartTime.format("hh:mm") + " &ndash; 00:00";
            }
            
            //endTime occurs during this day
            else if (entryEndTime.isBetween(dayStart, dayEnd) ) {
                entryString = "00:00 &ndash; " + entryEndTime.format("hh:mm");
            }
            // start and endtime on either side of this day
            else if (entryStartTime.isBefore(dayStart) && entryEndTime.isAfter(dayEnd) ) {
                entryString = "00:00 &ndash; 00:00";
            }
            if (entryString) {
                if (entry.nowPlaying) {
                    var split = entryString.split("&ndash;")
                    entryString = "LIVE &ndash; "+split[1];
                }
                columns.push({content: entryString, scheduleEntry: entry} );
            }
        });
        columns.sort();
        var scheduleDatum = {title: weekday, columns: columns};
        scheduleData.push(scheduleDatum);
    }
    return scheduleData;
}