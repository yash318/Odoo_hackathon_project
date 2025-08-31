const mongoose = require("mongoose");

const companyTestSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    jobRole: { type: String, required: true },
    date: { type: Date, required: true },
    duration: Number, // in minutes
    status: {
        type: String,
        enum: ['Scheduled', 'Pending', 'Completed'],
        default: 'Pending'
    }
});

module.exports = mongoose.model("CompanyTest", companyTestSchema);

