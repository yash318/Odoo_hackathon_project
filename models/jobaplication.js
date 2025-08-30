const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, required: true }, // link to specific job

    companyName: String,
    location: String,
    package: String,
    eligibility: {
        department: [String],
        minCgpa: Number,
        allowedBacklogs: Number
    },
    deadline: Date,
    overview: String,
    skills: [String],
    compensation: {
        fixed: Number,
        variable: Number,
        otherBenefits: String
    },
    timeline: {
        testDate: Date,
        interviewDate: Date,
        offerDate: Date
    },
    notes: String
});

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
