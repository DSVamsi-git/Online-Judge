const mongoose = require('mongoose');
const User = require("./User");
const Problem = require("./Problem");

const SubmissionSchema = mongoose.Schema({
    code:{
        type:String,
        required:true,
    },
    problem:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Problem",
        required: true
    },
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true
    },
    status: {
        type: String, 
        required: true
    },
    language: {
        type: String,
        default: 'cpp' 
    },
    score: {
        type : Number,
        required: false
    },
    feedback: {
        type: String,
        required: false
    }
},
{timestamps:true}
);

module.exports = mongoose.model("Submission",SubmissionSchema);