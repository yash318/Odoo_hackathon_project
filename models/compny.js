const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    
    description: String,
    jobs: [{
        title: String,
        package: Number,
        tier: { type: String, enum: ["Tier-1", "Tier-2", "Tier-3", "Internship"] },
        eligibility: {
            minCgpa: Number,
            allowedBacklogs: Number,
            department: [String],
            skills: [String]
        },
        applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
        shortlisted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
        offers: [{
            student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
            status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" }
        }],
        deadline: Date,
        hrcontact:[Number],
        contactnumber:[Number]
    }]
});
companySchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("Company", companySchema);
