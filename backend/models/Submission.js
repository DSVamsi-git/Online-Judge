const mongoose = require('mongoose');
const User = require("../../backend/models/User");
const Problem = require("../../backend/models/Problem");

SubmissionSchema = mongoose.Schema({
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
        default: 'cpp' // in case you want to support multiple langs later
    }
},
{timestamps:true}
);

module.exports = mongoose.model("Submission",SubmissionSchema);