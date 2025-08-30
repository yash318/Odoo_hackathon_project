const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    rollNo: { type: String, required: true },
    department: String,
    cgpa: Number,
    skills: [String],
    projects: [String],
    resumeLinks: [String],  
    applications: [{
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
        status: { 
            type: String, 
            enum: ["Applied", "Test", "Shortlisted", "Interview", "Offer", "Joined"], 
            default: "Applied" 
        },
        appliedOn: { type: Date, default: Date.now }
    }],
    notifications: [String]
});

module.exports = mongoose.model("Student", studentSchema);
