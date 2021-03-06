/*
    DATABASE SCHEMA for Users (Caretakers)
*/

const mongoose = require('mongoose');
const crypto = require('crypto');

// Define user attributes
// TODO: Add token generation structure
const userSchema = new mongoose.Schema({
    first_name:{
        type: String,
        required: true
    },
    last_name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    admin:{
        type: Boolean,
        default: false
    },
    resetPasswordToken:{
        type: String,
        required: false
    },
    resetPasswordExpires:{
        type: Date,
        required: false
    },
    updateEmail:{
        type: String,
        required: false
    },
    updateEmailToken:{
        type: String,
        required: false
    },
    updateEmailExpires:{
        type: Date,
        required: false
    }
});

// Generate random token & set validity time-frame
// Valid for 2 hours (7200000ms)
userSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 7200000;
};


// Generate random token & set validity time-frame
// Valid for 2 hours (7200000ms)
userSchema.methods.generateEmailUpdate = function() {
    this.updateEmailToken = crypto.randomBytes(20).toString('hex');
    this.updateEmailExpires = Date.now() + 7200000;
};


// Export module name and schema
const User = mongoose.model('User', userSchema);
module.exports = User;


