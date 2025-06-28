const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type : String,
        required : true,
        unique : true
    },

    password : {
        type : String,
        required : true,
        unique : false
    },

    role : {
        type : String,
        enum : ['user','admin'],
        required : true,
        default : 'user'
    }
});

module.exports = mongoose.model('User',UserSchema); 