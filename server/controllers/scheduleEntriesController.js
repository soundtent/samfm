const ScheduleEntry = require("../models/ScheduleEntry");
const User = require("../models/User");
const { schedule, nowPlaying } = require("./appController");
const { unlink } = require('fs');
const getProjectDays = require('../helpers/getProjectDaysHelper');
const {generateDashboardEntries} = require('../helpers/generateDashboardHelper');
const { pathToFileURL } = require("url");

exports.index = async (req,res) => {
    try {
        const loggedIn = req.isAuthenticated();
        const admin = req.user.admin;
        const currentRoute = "/dashboard";
        const sortBy = req.query['sort-by'] || "start-time";

        var sortByField = "startTime";
        if (sortBy == "date-created") {
            sortByField = "createdAt";
        }

        if (admin) {
            var scheduleEntries = await User.getScheduleEntriesWithUsers(sortByField, reverseSort=false);
        }
        else {
            var scheduleEntries = await User.getScheduleEntriesWithUsers(sortByField, reverseSort=false, user_ids=[req.user._id]);
        }
        const dashboardEntries = await generateDashboardEntries(scheduleEntries,req.app);
        
        res.render("scheduleEntries/dashboard", {dashboardEntries, loggedIn, currentRoute,sortBy, admin});
    } catch (error) {
        console.log(error);
    }
};

exports.show = async (req,res) => {
    try {
        const id = req.params.id;
        const scheduleEntry = await ScheduleEntry.findOne({_id: id});
        const loggedIn = req.isAuthenticated();

        res.render("scheduleEntries/show", {scheduleEntry, loggedIn});
    } catch (error) {
        console.log(error);
    }
};
exports.new = async (req,res) => {
    try {
        const loggedIn = req.isAuthenticated();
        const admin = req.user.admin;
        const unsavedFormData = req.session.body || [];
        const messages = req.session.messages || [];
        const timezone = req.app.get("timezone");
        const projectDays = getProjectDays(req.app);

        req.session.messages = [];
        req.session.body = [];
        console.log(projectDays);
        
        const scheduleEntry = await new ScheduleEntry(unsavedFormData); // only for view, never saved

        res.render("scheduleEntries/new", {loggedIn, scheduleEntry, admin, messages,timezone,projectDays});
    } catch (error) {
        console.log(error);
    }
};

exports.edit = async (req,res) => {

    try {
        const id = req.params.id;
        const loggedIn = req.isAuthenticated();
        const admin = req.user.admin;
        const messages = req.session.messages || [];
        const unsavedFormData = req.session.body || [];
        const timezone = req.app.get("timezone");
        const projectDays = getProjectDays(req.app);
        var scheduleEntry = await ScheduleEntry.findOne({_id: id});

        if (messages.length > 0 ) {
            for(var key in unsavedFormData) { // never saved
                scheduleEntry[key] = unsavedFormData[key];
            }
        }
        req.session.messages = [];
        req.session.body = [];
        
        res.render("scheduleEntries/edit", {scheduleEntry, loggedIn, admin, messages, timezone,projectDays});
    } catch (error) {
        console.log(error);
    }
};

exports.create = async (req,res) => {
    
    try {
        var data = req.body;
        const scheduleEntry = await new ScheduleEntry(data);

        await scheduleEntry.save();

        for (var i=0;i<req.files.length;i++) {
            await ScheduleEntry.addFile(scheduleEntry._id, req.files[i].validatedFileType, req.files[i].path);
        }

        await User.updateOne({_id: req.user.id}, {"$push": {scheduleEntries: scheduleEntry.id}});

        const webSocketServer = req.app.get('webSocketServer');
        webSocketServer.clients.forEach(function each(client) {
            client.send(JSON.stringify({id: scheduleEntry.id, nowPlaying: scheduleEntry.nowPlaying}));
        });
        res.redirect(`/sam_fm/sam_fm/schedule-entries/${scheduleEntry._id}`);
    } catch (error) {
        console.log(error);

        for (var i=0;i<req.files.length;i++) {
            unlink(req.files[i].path, (err) => { if (err) console.log(err); });
        }
        res.redirect('/sam_fm/schedule-entries/new');
    }
};

exports.update = async (req,res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        
        const scheduleEntry = await ScheduleEntry.findOneAndUpdate({_id: id}, data); 

        await ScheduleEntry.deleteFilesAndLinks(id,"images",data.existingImages);
        await ScheduleEntry.deleteFilesAndLinks(id,"videos",data.existingVideos);
        await ScheduleEntry.deleteFilesAndLinks(id,"audios",data.existingAudios);


        for (var i=0;i<req.files.length;i++) {
            await ScheduleEntry.addFile(scheduleEntry._id, req.files[i].validatedFileType, req.files[i].path);
        }

        const webSocketServer = req.app.get('webSocketServer');
        webSocketServer.clients.forEach(function each(client) {
            client.send(JSON.stringify({id: req.params.id, nowPlaying: scheduleEntry.nowPlaying}));
        });

        res.redirect(`/sam_fm/schedule-entries/${scheduleEntry._id}`);
    } catch (error) {
        console.log(error);

        for (var i=0;i<req.files.length;i++) {
            unlink(req.files[i].path, (err) => { if (err) console.log(err); });
        }
        res.redirect(`/sam_fm/schedule-entries/${req.params.id}/edit`);
    }
};

exports.delete = async (req,res) => {
    try {
        const id = req.params.id;
        await ScheduleEntry.deleteFilesAndLinks(id, "images");
        await ScheduleEntry.deleteFilesAndLinks(id, "videos");
        await ScheduleEntry.deleteFilesAndLinks(id, "audios");
        await ScheduleEntry.deleteOne({_id: id});
        
        await User.updateOne({_id: req.user.id}, {"$pull": {scheduleEntries: id}});
        
        const webSocketServer = req.app.get('webSocketServer');
        webSocketServer.clients.forEach(function each(client) {
            client.send(JSON.stringify({id: req.params.id, nowPlaying: false}));
        });
        res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
    }
};

exports.setNowPlaying = async (req,res) => {
    try {
        var nowPlaying = false;
        if (req.body['now-playing'] == 'on') {
            nowPlaying = true;
            await ScheduleEntry.setNowPlaying(req.body.id);
        }
        else {
            await ScheduleEntry.setNowPlaying();
        }

        const webSocketServer = req.app.get('webSocketServer');
        webSocketServer.clients.forEach(function each(client) {
            client.send(JSON.stringify({id: req.body.id, nowPlaying: nowPlaying}));
        });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
};

exports.getNowPlaying = async (req,res) => {
    try {
        const nowPlayingEntry = await ScheduleEntry.getNowPlaying();

        if (nowPlayingEntry && nowPlayingEntry.description.length > 200) {
            const readmore = `<a href='schedule-entries/${nowPlayingEntry._id}'>read more</a>`;
            nowPlayingEntry.description = nowPlayingEntry.description.substring(0,188)+"... "+readmore;
        }
        
        var generatedImageUrls = [];
        var generatedVideoUrls = [];
        if (nowPlayingEntry.images.length > 0) {
            for (var i=0;i<nowPlayingEntry.images.length;i++) {
                generatedImageUrls.push(req.app.locals.pathToUrl(nowPlayingEntry.images[i]));
            }
        }
        else if (nowPlayingEntry.videos.length > 0) {
            for (var i=0;i<nowPlayingEntry.videos.length;i++) {
                generatedVideoUrls.push(req.app.locals.pathToUrl(nowPlayingEntry.videos[i]));
            }
        }
        
        res.status(200).send( {scheduleEntry: nowPlayingEntry, generatedUrls: {images: generatedImageUrls, videos: generatedVideoUrls} } );
    } catch (error) {
        console.log(error);
    }
};