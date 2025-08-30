const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

const tpoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    
    rules: {
        minCgpa: Number,
        maxBacklogs: Number,
        upgradeLimit: { type: Number, default: 2 }
    },
    announcements: [String],
    reports: [{
        type: String, 
        createdOn: { type: Date, default: Date.now }
    }],
    institutename:[String],
    contactnumber:[Number]
});
tpoSchema.plugin(passportLocalMongoose, { usernameField: "email" });
module.exports = mongoose.model("TPO", tpoSchema);
