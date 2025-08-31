const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
    title: { type: String, required: true },
    duration: Number, // in minutes
    questions: Number,
    topics: [String],
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Interview Prep'],
        default: 'Intermediate'
    }
});

module.exports = mongoose.model("Test", testSchema);
