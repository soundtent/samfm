const ScheduleEntry = require("../models/ScheduleEntry");
const User = require("../models/User");
const { schedule } = require("./appController");
const { unlink } = require('fs');

exports.index = async (req,res) => {
    try {
        const loggedIn = req.isAuthenticated();
        const admin = req.user.admin;

        if (admin) {
            var scheduleEntries = await User.getScheduleEntriesWithUsers();
        }
        else {
            var scheduleEntries = await User.getScheduleEntriesWithUsers([req.user._id]);
        }
        res.render("scheduleEntries/dashboard", {scheduleEntries, loggedIn});
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

        req.session.messages = [];
        req.session.body = [];
        
        const scheduleEntry = await new ScheduleEntry(unsavedFormData); // only for view, never saved

        res.render("scheduleEntries/new", {loggedIn, scheduleEntry, admin, messages});
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
        var scheduleEntry = await ScheduleEntry.findOne({_id: id});

        if (messages.length > 0 ) {
            for(var key in unsavedFormData) { // never saved
                scheduleEntry[key] = unsavedFormData[key];
            }
        }
        req.session.messages = [];
        req.session.body = [];
        
        res.render("scheduleEntries/edit", {scheduleEntry, loggedIn, admin, messages });
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
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);

        for (var i=0;i<req.files.length;i++) {
            unlink(req.files[i].path, (err) => { if (err) console.log(err); });
        }
        res.redirect('/schedule-entries/new');
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

        if (scheduleEntry.nowPlaying) {
            const webSocketServer = req.app.get('webSocketServer');
            webSocketServer.clients.forEach(function each(client) {
                client.send('refresh');
            });
        }

        res.redirect(`/dashboard`);
    } catch (error) {
        console.log(error);

        for (var i=0;i<req.files.length;i++) {
            unlink(req.files[i].path, (err) => { if (err) console.log(err); });
        }
        res.redirect(`/schedule-entries/${req.params.id}/edit`);
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
        res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
    }
};

exports.setNowPlaying = async (req,res) => {
    try {
        if (req.body['now-playing'] == 'on') {
            await ScheduleEntry.setNowPlaying(req.body['id']);
        }
        else {
            await ScheduleEntry.setNowPlaying();
        }

        const webSocketServer = req.app.get('webSocketServer');
        webSocketServer.clients.forEach(function each(client) {
            client.send('refresh');
        });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
};