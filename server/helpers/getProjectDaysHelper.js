const dayjs = require('dayjs');

const getProjectDays = function (app) {
    const startDay = app.get("startDay");
    const endDay = app.get("endDay");

    var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    var runningDay = dayjs(startDay+"T00:00:00.000Z");
    var projectDays = [];

    while (true) {
        projectDays.push({
            date: runningDay.format("YYYY-MM-DD"), // format must match with the js.getLocalString in scheduleEntryForm.ejs
            label: runningDay.format("ddd, D MMM")
        })
        if (runningDay.format("YYYY-MM-DD") == endDay) {break;}
        runningDay = runningDay.add(1, "d");
    }

    return projectDays;
}

module.exports = getProjectDays;