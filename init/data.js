const mongoose = require("mongoose");
const Student = require("../models/student");
const Company = require("../models/compny");  
const TPO = require("../models/tpo");
mongoose.connect("mongodb://127.0.0.1:27017/Odoo_p1", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

async function seedData() {
    try {
        await Student.deleteMany({});
        await Company.deleteMany({});
        await TPO.deleteMany({});

        const students = await Student.insertMany([
            {
                name: "Yash Chaudhary",
                email: "yash@example.com",
                password: "hashedpassword1",
                rollNo: "CE123",
                department: "CSE",
                cgpa: 8.5,
                skills: ["JavaScript", "Node.js", "MongoDB"],
                projects: ["Placement Tracker", "E-commerce Clone"],
                resumeLinks: ["resume_v1.pdf"]
            },
            {
                name: "Aditi Sharma",
                email: "aditi@example.com",
                password: "hashedpassword2",
                rollNo: "CE124",
                department: "CSE",
                cgpa: 9.1,
                skills: ["Python", "Machine Learning"],
                projects: ["ML Placement Predictor"],
                resumeLinks: ["resume_aditi.pdf"]
            }
        ]);
        const companies = await Company.insertMany([
            {
                name: "Google",
                email: "hr@google.com",
                password: "hashedpassword3",
                description: "Tech Giant",
                jobs: [
                    {
                        title: "Software Engineer",
                        package: 30,
                        tier: "Tier-1",
                        eligibility: {
                            minCgpa: 8,
                            allowedBacklogs: 0,
                            department: ["CSE", "IT"],
                            skills: ["DSA", "System Design", "JavaScript"]
                        },
                        deadline: new Date("2025-12-31")
                    }
                ]
            },
            {
                name: "Infosys",
                email: "hr@infosys.com",
                password: "hashedpassword4",
                description: "IT Services",
                jobs: [
                    {
                        title: "System Engineer",
                        package: 5,
                        tier: "Tier-3",
                        eligibility: {
                            minCgpa: 6,
                            allowedBacklogs: 2,
                            department: ["CSE", "IT", "ECE"],
                            skills: ["Java", "SQL"]
                        },
                        deadline: new Date("2025-09-30")
                    }
                ]
            }
        ]);
        const tpo = await TPO.create({
            name: "Training & Placement Officer",
            email: "tpo@college.com",
            password: "hashedpassword5",
            rules: {
                minCgpa: 6,
                maxBacklogs: 2,
                upgradeLimit: 2
            },
            announcements: ["Welcome to Placement Season 2025!"],
            reports: ["Initial placement drive started."]
        });

        console.log("Sample data inserted successfully!");
        mongoose.connection.close();
    } catch (err) {
        console.error("Error inserting data:", err);
        mongoose.connection.close();
    }
}

seedData();
