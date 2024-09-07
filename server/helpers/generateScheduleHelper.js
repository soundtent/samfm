const ScheduleEntry = require("../models/ScheduleEntry");
const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/isBetween'));

exports.generateSchedule = async() => {
    
    const scheduleEntryModels = await ScheduleEntry.find({});
    var scheduleEntries = scheduleEntryModels.map(function(model) { return model.toObject(); });
    var scheduleData = [];

    dayjs.tz.setDefault("Europe/Berlin")

    const startDate = dayjs.tz("2024-09-10 00:00:00");

    const numberOfDays = 14;
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (var i=0;i<numberOfDays;i++) { 
        var dayStart = startDate.add(i, 'day');
        var dayEnd = startDate.add(i+1, 'day');
        var weekday = weekdays[dayStart.day()];
    
        var columns = [];
    
        scheduleEntries.forEach( (entry) => {
            var entryStartTime = dayjs(entry.startTime);
            var entryEndTime = dayjs(entry.endTime);
    
            //startTime and endTime occur during this day
            if (entryStartTime.isBetween(dayStart, dayEnd) ) {
                var entryString = entryStartTime.format("hh:mm") + " - " + entryEndTime.format("hh:mm");
                columns.push({content: entryString, scheduleEntry: entry} );
            }
    
            //startTime occurs during this day
            if (entryStartTime.isBetween(dayStart, dayEnd) ) {
                var entryString = entryStartTime.format("hh:mm") + " - 00:00";
                columns.push({content: entryString, scheduleEntry: entry} );
            }
            
            //endTime occurs during this day
            else if (entryEndTime.isBetween(dayStart, dayEnd) ) {
                var entryString = "00:00 - " + entryEndTime.format("hh:mm");
                columns.push({content: entryString, scheduleEntry: entry} );
            }
            // start and endtime on either side of this day
            else if (entryStartTime.isBefore(dayStart) && entryEndTime.isAfter(dayEnd) ) {
                var entryString = "00:00 - 00:00";
                columns.push({content: entryString, scheduleEntry: entry} );
            }
        });
        columns.sort();
        var scheduleDatum = {title: weekday, columns: columns};
        scheduleData.push(scheduleDatum);
    }
    return scheduleData;
}