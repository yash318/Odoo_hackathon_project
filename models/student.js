const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
   
    rollNo: { type: String, required: true },
    department: String,
    cgpa: Number,
    skills: [String],
    projects: [String],
    branch:[String],
    resumeLinks: [String],  
    applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
}],
    notifications: [String]
});
studentSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("Student", studentSchema);
