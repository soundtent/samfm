const dayjs = require('dayjs');

const getProjectDays = function (app) {
    const startDay = app.get("startDay");
    const endDay = app.get("endDay");

    var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    var runningDay = dayjs(startDay+"T00:00:00.000Z");
    var projectDays = [];

    while (true) {
        projectDays.push({
            date: runningDay.format("DD/MM/YYYY"), // in format of js.toLocaleString: dd/mm/yyyy
            label: runningDay.format("ddd, D MMM")
        })
        runningDay = runningDay.add(1, "d");
        if (runningDay.format("YYYY-MM-DD") == endDay) {break;}
    }

    console.log(projectDays);

    return projectDays;
}

module.exports = getProjectDays;