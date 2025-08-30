const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobApplication",
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    fullName: { type: String, required: true },
    enrollmentNumber: { type: String, required: true },
    branch: { type: String, required: true },
    passingYear: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    resume: { type: String }, // For simplicity, stores filename. File upload requires more setup.
    coverLetter: { type: String },
    status: {
        type: String,
        enum: ["Applied", "Under Review", "Shortlisted", "Rejected"],
        default: "Applied"
    },
    appliedOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Application", applicationSchema);
