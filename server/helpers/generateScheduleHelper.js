const ScheduleEntry = require("../models/ScheduleEntry");
const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/isBetween'));

function limitCharacters(text,charlimit) {
    if (text.length > charlimit) {
        return text.substring(0,charlimit)+"...";
    }
    else {return text;}
}

exports.generateSchedule = async(app) => {
    const timezone = app.get("timezone");
    const startDay = app.get("startDay");
    const endDay = app.get("endDay");

    const scheduleEntryModels = await ScheduleEntry.find({});
    var scheduleEntries = scheduleEntryModels.map(function(model) { return model.toObject(); });
    var scheduleData = [];

    dayjs.tz.setDefault(timezone);

    var today = dayjs.tz();
    

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var runningDay = dayjs.tz(startDay+" 00:00:00");
    
    while (true) {
        var dayStart = runningDay;
        var dayEnd = runningDay.add(1, 'day');
        var weekday = weekdays[dayStart.day()];
    
        var columns = [];
        
        scheduleEntries.forEach( (entry) => {
            var entryStartTime = dayjs.tz(entry.startTime);
            var entryEndTime = dayjs.tz(entry.endTime);

            var entryString;

            //startTime and endTime occur during this day
            if (entryStartTime.isBetween(dayStart, dayEnd) && entryEndTime.isBetween(dayStart, dayEnd) ) {
                entryString = entryStartTime.format("HH:mm") + " &ndash; " + entryEndTime.format("HH:mm");
            }
    
            //startTime occurs during this day
            else if (entryStartTime.isBetween(dayStart, dayEnd) && entryEndTime.isAfter(dayEnd)) {
                entryString = entryStartTime.format("HH:mm") + " &ndash; 00:00";
            }
            
            //endTime occurs during this day
            else if (entryStartTime.isBefore(dayStart) && entryEndTime.isBetween(dayStart, dayEnd) ) {
                entryString = "00:00 &ndash; " + entryEndTime.format("HH:mm");
            }
            // start and endtime on either side of this day
            else if (entryStartTime.isBefore(dayStart) && entryEndTime.isAfter(dayEnd) ) {
                entryString = "00:00 &ndash; 00:00";
            }
            if (entryString) {
                var live = false;
                if (entry.nowPlaying && dayStart.format("YYYY-MM-DD") == today.format("YYYY-MM-DD") ) {
                    var split = entryString.split("&ndash;")
                    entryString = "LIVE &ndash; "+split[1];
                    live = true;
                }
                entry.location = limitCharacters(entry.location,50);
                entry.participants = limitCharacters(entry.participants,50);
                entry.description = limitCharacters(entry.description.replaceAll("<br>"," "),100);
                columns.push({content: entryString, scheduleEntry: entry, live: live} );
            }
        });
        columns = columns.sort(function(a, b) {
            var x = a.scheduleEntry.startTime; var y = b.scheduleEntry.startTime;
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
        var scheduleDatum = {title: weekday, columns: columns};
        scheduleData.push(scheduleDatum);

        if (runningDay.format("YYYY-MM-DD") == endDay) {break;}
        runningDay = runningDay.add(1, "d");
    }
    return scheduleData;
}