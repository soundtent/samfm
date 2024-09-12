const express = require('express');
const router = express.Router();

const appController = require('../controllers/appController.js');
const scheduleEntriesController = require('../controllers/scheduleEntriesController.js');
const authController = require('../controllers/authController.js');
const checkAuthenticated = authController.checkAuthenticated;
const uploadMiddleware = require("../helpers/uploadHelper.js");
const validate = require("../helpers/validateHelper.js");
const checkConsistency = require("../helpers/checkConsistencyHelper.js");
const convertStartEndTimes = require("../helpers/convertStartEndTimes.js");


const ScheduleEntry = require("../models/ScheduleEntry");
router.get('/api/sortingtest', async (req,res,next) => {
    var aggregation = [
        { 
            $project: { "startTime": 1, "location": 1 } 
        },
        { 
            $sort: { "startTime": 1 } 
        },
    ];
    
    const result = await ScheduleEntry.aggregate(aggregation);
    res.status(200).send(result);
});

router.get('/', appController.nowPlaying);
router.get('/schedule', appController.schedule);
router.get('/get-involved', appController.getInvolved);

router.get('/api/check-consistency', checkConsistency);
router.get('/api/schedule-entries/now-playing', scheduleEntriesController.getNowPlaying);

router.get('/dashboard', checkAuthenticated, scheduleEntriesController.index);
router.get('/schedule-entries/new', checkAuthenticated, scheduleEntriesController.new);
router.get('/schedule-entries/:id', scheduleEntriesController.show);
router.get('/schedule-entries/:id/edit', checkAuthenticated, scheduleEntriesController.edit);
router.post('/schedule-entries', checkAuthenticated, uploadMiddleware, convertStartEndTimes, validate.formValidation(), validate.createHandler, scheduleEntriesController.create);
router.put('/schedule-entries/:id/', checkAuthenticated, uploadMiddleware, convertStartEndTimes, validate.formValidation(), validate.updateHandler, scheduleEntriesController.update);
router.delete('/schedule-entries/:id', checkAuthenticated, scheduleEntriesController.delete);
router.post('/schedule-entries/now-playing', checkAuthenticated, scheduleEntriesController.setNowPlaying);

module.exports = router;