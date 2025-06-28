const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  ProblemHeading: {
    type: String,
    required: true,
    unique: true
  },
  Description: {
    type: String,
    required: true,
    unique: true
  },
  Difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard'],
  },
  Author: {
    type: String,
    required: false,
    unique: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
