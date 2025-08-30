const mongoose = require("mongoose");

const tpoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    rules: {
        minCgpa: Number,
        maxBacklogs: Number,
        upgradeLimit: { type: Number, default: 2 }
    },
    announcements: [String],
    reports: [{
        type: String, 
        createdOn: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model("TPO", tpoSchema);
