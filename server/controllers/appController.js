const ScheduleEntry = require("../models/ScheduleEntry");
const {generateSchedule} = require('../helpers/generateScheduleHelper.js');

exports.schedule = async(req, res) => {
    const scheduleData = await generateSchedule(req.app);
    const loggedIn = req.isAuthenticated();
    var webSocketUrl = "wss://soundcamp.radio/sam_fm/"; // trailing slash is needed
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
    var webSocketUrl = "wss://soundcamp.radio/sam_fm/"; // trailing slash is needed

    res.render('now-playing', {loggedIn, webSocketUrl, currentRoute});
};


exports.getInvolved = async(req, res) => {
    const loggedIn = req.isAuthenticated();
    const currentRoute = "/get-involved";
    res.render('get-involved', {loggedIn, currentRoute});
};