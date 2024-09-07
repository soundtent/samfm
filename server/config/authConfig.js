const passport = require('passport');
const User = require('../models/User');

const initialisePassportLocalStrategy = async () => {
    var passportLocalStrategy = require('passport-local');
    const strategy = new passportLocalStrategy(User.authenticate())
    passport.use(strategy);
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
};

module.exports = initialisePassportLocalStrategy;