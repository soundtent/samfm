const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));

function limitCharacters(text,charlimit) {
    if (text.length > charlimit) {
        return text.substring(0,charlimit)+"...";
    }
    else {return text;}
}

exports.generateDashboardEntries = async(scheduleEntries, app) => {
    const timezone = app.get("timezone");
    dayjs.tz.setDefault(timezone);

    for (var i=0;i<scheduleEntries.length;i++) {
        scheduleEntries[i].timeString = dayjs.tz(scheduleEntries[i].startTime).format("DD MMM YYYY HH:mm") + " &ndash;<br>" + dayjs.tz(scheduleEntries[i].endTime).format("DD MMM YYYY HH:mm");
        delete scheduleEntries.startTime;
        delete scheduleEntries.endTime;
        scheduleEntries[i].location = limitCharacters(scheduleEntries[i].location,50);
        scheduleEntries[i].participants = limitCharacters(scheduleEntries[i].participants,50);
        scheduleEntries[i].description = limitCharacters(scheduleEntries[i].participants,50);
        scheduleEntries[i].notes = limitCharacters(scheduleEntries[i].notes,50);
    }
    
    return scheduleEntries;
}