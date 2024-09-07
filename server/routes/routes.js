const express = require('express');
const router = express.Router();

const appController = require('../controllers/appController.js');
const scheduleEntriesController = require('../controllers/scheduleEntriesController.js');
const authController = require('../controllers/authController.js');
const checkAuthenticated = authController.checkAuthenticated;
const uploadMiddleware = require("../helpers/uploadHelper.js");
const validate = require("../helpers/validateHelper.js");
const checkConsistency = require("../helpers/checkConsistencyHelper.js");

router.get('/', appController.nowPlaying);
router.get('/schedule', appController.schedule);
router.get('/get-involved', appController.getInvolved);

router.get('/helpers/check-consistency', checkConsistency);

router.get('/dashboard', checkAuthenticated, scheduleEntriesController.index);
router.get('/schedule-entries/new', checkAuthenticated, scheduleEntriesController.new);
router.get('/schedule-entries/:id', checkAuthenticated, scheduleEntriesController.show);
router.get('/schedule-entries/:id/edit', checkAuthenticated, scheduleEntriesController.edit);
router.post('/schedule-entries', checkAuthenticated, uploadMiddleware, validate.formValidation(), validate.createHandler, scheduleEntriesController.create);
router.put('/schedule-entries/:id/', checkAuthenticated, uploadMiddleware, validate.formValidation(), validate.updateHandler, scheduleEntriesController.update);
router.delete('/schedule-entries/:id', checkAuthenticated, scheduleEntriesController.delete);
router.post('/schedule-entries/now-playing', checkAuthenticated, scheduleEntriesController.setNowPlaying);

module.exports = router;