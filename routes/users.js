/*
    ROUTING MODEL for Users (Caretakers)
*/

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const password = require('../config/password');
var moment = require('moment');
const { ensureAuthenticated } = require('../config/auth');

// User model
const User = require('../models/User');

// GET home page
router.get('/home', ensureAuthenticated, function (req, res, next) {
    var date = moment().format('MMMM Do YYYY');
    res.render('pages/users/home', {
        date: date
    });
});
// GET settings page
router.get('/settings', function (req, res, next) {
    res.render('pages/users/profile', {
        isAdmin: req.user.admin
    })
});

// GET reminder page
router.get('/reminders', function (req, res, next) {
    res.render('pages/users/reminder');
});

// Register Handle
router.post('/register', (req, res) => {
    // Information access
    if(req.user.admin != true) {
        console.log("Not admin");
        return;
    }
    const {
        first_name,
        last_name,
        email,
        password,
        password2
    } = req.body;

    const newUser = new User({
        first_name,
        last_name,
        email,
        password
    });
    // Hash user password
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // Assign user password as hashed password 
            newUser.password = hash;
            // Insert user into DB
            // TODO: Reassign to Redis
            newUser
                .save()
                .then(user => {
                    // Redirect to login page
                    res.redirect('/login');
                })
                .catch(err => console.log(err));
        });
    });
});


// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        // Redirects on both success and fail
        successRedirect: '/login/loader',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});


// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/logout/loader');
});


// Update Password Handle
router.post('/changePassword', ensureAuthenticated, (req, res) => {
    // Get params
    const {
        current_password,
        new_password,
        confirm_new_password
    } = req.body;
    // Compare new passwords 
    if (new_password == confirm_new_password) {
        // Verify user
        bcrypt.compare(current_password, req.user.password, (err, isMatch) => {
            if (isMatch) {
                // Hash password and update
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(new_password, salt, (err, hash) => {
                        if (err) throw err; 
                        // Reassign user password
                        User.findOneAndUpdate(
                            {"email": req.user.email}, 
                            {$set: {"password": hash}},
                            function(err) {
                                if (err) console.log(err);
                                req.flash('success', 'Password successfully updated.')
                            }
                        );
                        console.log("Password successfully changed");
                    });
                });
            }
            else {
                console.log("Password incorrect");
            }
        });
    }
    else {
        console.log("Passwords don't match");
    } 
    return res.redirect('/users/settings');
});


/* 
    Get reset password page
*/
router.get('/resetRequest', ensureReset, function (req, res, next) {
    res.render('pages/landing/resetRequest');
});


/* 
    Reset Password Handle
    TODO
*/
router.post('/resetRequest', (req, res) => {
    // Get post params
    const {
        email,
    } = req.body;
    // Attempt to locate user
    User.findOne({ email: email })
                .then(user => {
                    // If no match, return with no user param
                    if (!user) {
                        // TODO: Flash message with user notification
                        req.flash('failure', 'No user associated with email');
                    }
                    // Send email with reset instructions & notify user
                    else {
                        // TODO: Flash message with user notification
                        req.flash('success', 'An email with instructions has been sent to the associated address');
                        password.recover();

                    }
                })
                .catch(err => console.log(err));
    return res.redirect('pages/landing/resetRequest');
});




/* 
    Get reset password page
    Using ensureReset middleware to verify token access to route/page
*/
router.get('/reset', ensureReset, function (req, res, next) {
    return res.render('pages/landing/reset');
});


/* 
    Reset Password Handle
*/
router.post('/reset', (req, res) => {
    // TODO: Pass in user email

    // TODO: Ensure user has token permission to access route
    // Get post params
    const {
        new_password,
        confirm_new_password
    } = req.body;

    if (new_password == confirm_new_password) {
        // Hash password and update
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(new_password, salt, (err, hash) => {
                if (err) throw err; 
                // Reassign user password
                User.findOneAndUpdate(
                    {"email": /*EMAIL*/}, 
                    {$set: {"password": hash}},
                    function(err) {
                        if (err) console.log(err);
                        req.flash('success', 'Password successfully updated.')
                    }
                );
                console.log("Password successfully changed");
            });
        });
    }
    return res.redirect('/users/reset');
});


// Change Information Handle
router.post('/changeInfo', ensureAuthenticated, (req, res) => {
    // Get params
    var {
        first_name,
        last_name,
        new_email
    } = req.body;
    // Update email
    if ((new_email != req.user.email) && (new_email.length > 0)) {
        // TODO
        console.log(new_email);
        req.flash('success', 'Confirmation email sent to: ', new_email);
    }
    // Ensure non-empty fields
    if (first_name.length == 0) {
        first_name = req.user.first_name;
    }
    if (last_name.length == 0) {
        last_name = req.user.last_name;
    }
    var info = {
        "first_name": first_name,
        "last_name": last_name
    }
    // Update name
    User.findOneAndUpdate(
        {"email": req.user.email}, 
        {$set: info},
        function(err) {
            if (err) console.log(err);
            req.flash('success', 'Information successfully updated.')
        }
    );
    return res.redirect('/users/settings');
});




module.exports = router;