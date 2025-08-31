const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, unique: true },

  fullName: String,
  email: String,
  phone: String,
  summary: String,

  skills: [String],

  education: [{
    institute: String,
    degree: String,
    year: String
  }],

  experience: [{
    company: String,
    role: String,
    year: String
  }],

  projects: [{
    name: String,
    description: String
  }],

  achievements: [String]
});

module.exports = mongoose.model("Resume", resumeSchema);
