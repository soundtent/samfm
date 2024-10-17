const express = require('express');
const crypto = require('crypto');
const sendEmail = require("../helpers/emailHelper.js");
const router = express.Router();

const validate = require("../helpers/validateHelper.js");

const passport = require('passport');
const User = require('../models/User');


router.get('/login', async (req,res) => {
    const loggedIn = req.isAuthenticated();
    const messages = req.session.messages || [];
    req.session.messages = [];
    const username = req.session.savedUsername || "";
    const currentRoute = "/login";

    res.render('auth/signIn.ejs', {loggedIn, messages, username, currentRoute});
});
router.get('/register', async (req,res) => {
    const loggedIn = req.isAuthenticated();
    const messages = req.session.messages || [];
    req.session.messages = [];

    res.render('auth/register.ejs', {loggedIn, messages} );
});

router.get('/forgot-password', async (req,res) => {
    const loggedIn = req.isAuthenticated();
    const messages = req.session.messages || [];
    req.session.messages = [];

    res.render('auth/forgotPassword.ejs', {loggedIn, messages} );
});

router.post('/forgot-password', async (req, res) => {
    const username = req.body.username;
    const loggedIn = req.isAuthenticated();

    const theUser = await User.findOne({username: username} );
    
    if (theUser != null) {
        const token = crypto.randomBytes(20).toString('hex');
        await User.updateOne({username: username}, {passwordResetToken: token});
        const link = `${process.env.BASE_URL}/reset-password/${theUser._id}/${token}`;
        const emailBody = `Hello ${username}!\n\nSomeone has requested a link to change your password. You can do this through the link below.\n\n${link}\n\nIf you didn't request this, please ignore this email.\n\nYour password won't change until you access the link above and create a new one.\n\n -- \n\nThis email was sent automatically by the Soundcamp Server.`;
        await sendEmail(theUser.username, "Reset your password", emailBody);
        res.render('auth/passwordResetSent.ejs', {loggedIn, email: username});
    }
    else {
        req.session.messages = [{msg: "Cannot find account."}]
        res.redirect("/sam_fm/forgot-password");
    }
});

// Route to handle the reset token and choose new password
router.get('/reset-password/:id/:token', async (req, res) => {
  try {
    const { token, id } = req.params;
    const loggedIn = req.isAuthenticated();
    
    const theUser = await User.findOne({passwordResetToken: token, _id: id} );

    if (theUser != null && token != "") {
      res.render('auth/newPassword.ejs', {loggedIn, token});
    } else {
      res.status(404).send('Invalid or expired token');
    } 
  } catch (error) {
    console.log(error);
  }
});

// Route to update the password
router.post('/reset-password', async(req, res) => {
  try {
    const loggedIn = req.isAuthenticated();
    const { token, password } = req.body;
    const theUser = await User.findOne({passwordResetToken: token} );

    if (theUser != null) {
      await User.updateOne({passwordResetToken: token}, {passwordResetToken: ""});
      theUser.setPassword(password, function(){
        theUser.save();
        res.render('auth/passwordResetSuccess.ejs', {loggedIn});
      });
    } else {
      res.status(404).send('Invalid or expired token');
    }
  } catch (error) {
    console.log(error);
  }
});


/*register -- Look closer at the package https://www.npmjs.com/package/passport-local-mongoose
  for understanding why we don't try to encrypt the password within our application
*/
router.post('/register', validate.registerValidation(), validate.registerHandler, function (req, res) {
  User.register(
    new User({ 
      username: req.body.username
    }), req.body.password, function (err, msg) {
      if (err) {
        res.send(err);
      } else {
        res.redirect("/sam_fm/login");
      }
    }
  )
})

/*
  Login routes -- This is where we will use the 'local'
  passport authenciation strategy. If success, send to
  /login-success, if failure, send to /login-failure
*/
router.post('/login', validate.loginValidation(), validate.loginHandler, passport.authenticate('local', { 
  failureRedirect: '/sam_fm/login-failure', 
  successRedirect: '/sam_fm/login-success'
}), (err, req, res, next) => {
  if (err) next(err);
});

router.get('/login-failure', (req, res, next) => {
  req.session.messages = [{msg: "Invalid credentials"}];
  res.redirect('/sam_fm/login');
});

router.get('/login-success', (req, res, next) => {
  res.redirect('/sam_fm/dashboard');
});

router.get('/logout', function(req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/sam_fm/schedule');
    });
});

module.exports = router;