const { body, check, validationResult } = require('express-validator');
const { unlink } = require("fs");

const scheduleEntriesController = require('../controllers/scheduleEntriesController.js');

const uploadValidation = (value, {req}) => {
  try {
    const imgMimetypes = ["image/jpeg", "image/png", "image/gif"];
    const vidMimetypes = ["video/mp4", "video/mpeg", "video/webm"];
    const audioMimetypes = ["audio/mpeg", "audio/webm"];

    for (var i=0;i<req.files.length;i++) {
      if (imgMimetypes.includes(req.files[i].mimetype) ) {
          req.files[i].validatedFileType = "image";
      }
      else if (vidMimetypes.includes(req.files[i].mimetype) ) {
          req.files[i].validatedFileType = "video";
      }
      else if (audioMimetypes.includes(req.files[i].mimetype) ) {
          req.files[i].validatedFileType = "audio";
      }
      else {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.log(error);
  }
}

module.exports.formValidation = function() {
  return [
    body('location')
      .exists({ checkFalsy: true })
      .withMessage('Location cannot be empty'),
    body('participants')
      .exists({ checkFalsy: true })
      .withMessage('Participants cannot be empty'),
    body('description')
      .exists({ checkFalsy: true })
      .withMessage('Description cannot be empty'),
    body('startTime')
      .isISO8601().toDate()
      .withMessage('Start time must be DATETIME'),
    body('endTime')
      .isISO8601().toDate()
      .withMessage('End time must be DATETIME'),
    check('endTime')
      .isISO8601().toDate()
      .withMessage('End time must be DATETIME'),
    check('upload')
      .custom(uploadValidation)
      .withMessage('Cannot upload file(s) due to unrecognised format.'),
    body('notes')
      .optional()
      .custom((value, {req}) => {
        return req.user.admin;
      })
      .withMessage('You must be an admin to edit notes'),
      
  ];
}

module.exports.updateHandler = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    for (var k=0;k<req.files.length;k++) {
      unlink(req.files[k].path, (err) => { if (err) throw err; });
    }
    
    req.session.messages = result.array();
    req.session.body = req.body;
    return res.redirect(`/schedule-entries/${req.params.id}/edit`);
  }
  next();
};

module.exports.createHandler = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    for (var k=0;k<req.files.length;k++) {
      unlink(req.files[k].path, (err) => { if (err) throw err; });
    }
    
    req.session.messages = result.array();
    req.session.body = req.body;
    return res.redirect(`/schedule-entries/new`);
  }
  next();
};


module.exports.loginValidation = function() {
  return [
    body('username')
      .exists({ checkFalsy: true })
      .withMessage('Email cannot be empty')
      .custom(value => !/\s/.test(value))
      .withMessage('Email cannot have spaces')
      .isEmail()
      .withMessage('Email must be a valid email'),
    body('password')
      .exists({ checkFalsy: true })
      .withMessage('Password cannot be empty')
      .custom(value => !/\s/.test(value))
      .withMessage('Password cannot have spaces')
  ];
}

module.exports.loginHandler = (req, res, next) => {
  const result = validationResult(req);
  req.session.savedUsername = req.body.username;
  if (!result.isEmpty()) {
    req.session.messages = result.array();
    return res.redirect(`/login`);
  }
  next();
};

module.exports.registerValidation = function() {
  return [
    body('username')
      .exists({ checkFalsy: true })
      .withMessage('Email cannot be empty')
      .isEmail()
      .withMessage('Email must be a valid email'),
    body('password')
      .exists({ checkFalsy: true })
      .withMessage('Password cannot be empty'),
  ];
}

module.exports.registerHandler = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    req.session.messages = result.array();
    return res.redirect(`/register`);
  }
  next();
};