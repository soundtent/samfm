const ScheduleEntry = require("../models/ScheduleEntry");
const {generateSchedule} = require('../helpers/generateScheduleHelper.js');

exports.schedule = async(req, res) => {
    const scheduleData = await generateSchedule();
    const loggedIn = req.isAuthenticated();

    res.render('schedule', {scheduleData, loggedIn});
};

exports.nowPlaying = async(req, res) => {
    const loggedIn = req.isAuthenticated();
    const webSocketUrl = "ws://"+req.headers.host;

    const nowPlayingEntry = await ScheduleEntry.getNowPlaying();

    res.render('now-playing', {loggedIn, webSocketUrl,nowPlayingEntry});
};


exports.getInvolved = async(req, res) => {
    const loggedIn = req.isAuthenticated();
    res.render('get-involved', {loggedIn});
};

exports.about = async(req, res) => {
    const loggedIn = req.isAuthenticated();
    res.render('about', {loggedIn});
};