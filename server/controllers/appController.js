const ScheduleEntry = require("../models/ScheduleEntry");
const {generateSchedule} = require('../helpers/generateScheduleHelper.js');

exports.schedule = async(req, res) => {
    const scheduleData = await generateSchedule(req.app);
    const loggedIn = req.isAuthenticated();
    var webSocketUrl = "ws://"+req.headers.host;
    if (req.protocol == "https") {webSocketUrl = "wss://"+req.headers.host; }
    var admin = false;
    if (loggedIn && req.user.admin) {
        admin = true;
    }
    const currentRoute = "/schedule";

    res.render('schedule', {scheduleData, loggedIn, currentRoute, admin, webSocketUrl});
};

exports.nowPlaying = async(req, res) => {
    const loggedIn = req.isAuthenticated();
    const currentRoute = "/";
    var webSocketUrl = "ws://"+req.headers.host;
    if (req.protocol == "https") {webSocketUrl = "wss://"+req.headers.host; }

    const nowPlayingEntry = await ScheduleEntry.getNowPlaying();

    if (nowPlayingEntry && nowPlayingEntry.description.length > 200) {
        const readmore = `<a href='schedule-entries/${nowPlayingEntry._id}'>read more</a>`;
        nowPlayingEntry.description = nowPlayingEntry.description.substring(0,188)+"... "+readmore;
    }

    res.render('now-playing', {loggedIn, webSocketUrl,nowPlayingEntry, currentRoute});
};


exports.getInvolved = async(req, res) => {
    const loggedIn = req.isAuthenticated();
    const currentRoute = "/get-involved";
    res.render('get-involved', {loggedIn, currentRoute});
};