const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const PDFDocument = require("pdfkit");
const fs = require("fs");

// Models
const Student = require("./models/student");
const Company = require("./models/compny");
const TPO = require("./models/tpo");
const JobApplication = require("./models/jobaplication");
const Application = require("./models/application");
const Test = require('./models/test');
const CompanyTest = require('./models/companytest');
const Resume = require("./models/resume");

const app = express();

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/Odoo_p1")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// View Engine Setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session Configuration
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

// Use static authenticate method of model for LocalStrategy
passport.use('student', new LocalStrategy({ usernameField: 'email' }, Student.authenticate()));
passport.use('company', new LocalStrategy({ usernameField: 'email' }, Company.authenticate()));
passport.use('tpo', new LocalStrategy({ usernameField: 'email' }, TPO.authenticate()));


// Use static serialize and deserialize of model for passport session support
passport.serializeUser((user, done) => {
    done(null, { id: user.id, role: user.constructor.modelName });
});

passport.deserializeUser(async (obj, done) => {
    try {
        let user;
        if (obj.role === 'Student') {
            user = await Student.findById(obj.id);
        } else if (obj.role === 'Company') {
            user = await Company.findById(obj.id);
        } else if (obj.role === 'TPO') {
            user = await TPO.findById(obj.id);
        }
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});


// Flash Middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



// Signup Routes
app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Sign Up' });
});

app.post('/signup', async (req, res, next) => {
    try {
        const { email, name, password, role } = req.body;
        let user;
        if (role === 'student') {
            console.log(req.body)
            const { rollNo, branch } = req.body;
            user = new Student({ email, name, rollNo, branch });
            await Student.register(user, password);
        } else if (role === 'company') {
            console.log(req.body)
            const { description, contactnumber } = req.body;
            user = new Company({ email, name, description, contactnumber });
            await Company.register(user, password);
        } else if (role === 'tpo') {
            console.log(req.body);
            const { institutename, contactnumber } = req.body;
            user = new TPO({ email, name, institutename, contactnumber });
            await TPO.register(user, password);
        } else {
            req.flash('error', 'Invalid role selected.');
            return res.redirect('/signup');
        }

        req.login(user, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to the Placement Tracker!');
            res.redirect('/');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
});

// Login Routes
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.post('/login', (req, res, next) => {
    const { role } = req.body;
    let strategy;
    if (role === 'student') strategy = 'student';
    else if (role === 'company') strategy = 'company';
    else if (role === 'tpo') strategy = 'tpo';
    else {
        req.flash('error', 'Please select a valid role.');
        return res.redirect('/login');
    }

    passport.authenticate(strategy, {
        failureFlash: true,
        failureRedirect: '/login'
    })(req, res, () => {
        req.flash('success', 'Welcome back!');
        const redirectUrl = req.session.returnTo || '/';
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    });
});


app.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', "Goodbye!");
        res.redirect('/login');
    });
});



app.get("/", async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/login');
        }

        if (req.user.constructor.modelName === 'Student') {
            const student = await Student.findById(req.user._id)
                .populate("applications.company");
            return res.render("studentdash", {
                title: "Dashboard",
                student
            });
        }
        res.send(`<h1>Welcome ${req.user.name}</h1><p>(${req.user.constructor.modelName} Dashboard)</p><a href="/logout">Logout</a>`);

    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not load dashboard.');
        res.redirect('/login');
    }
});

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}


app.get("/jobs", isLoggedIn, async (req, res) => {
    try {
        const allJobs = await JobApplication.find({});

        const student = await Student.findById(req.user._id)
            .populate({
                path: 'applications',
                populate: {
                    path: 'job',
                    model: 'JobApplication'
                }
            });
        // console.log(student.applications[0].job.company)

        res.render("jobs", {
            title: "Job Applications",
            jobs: allJobs,
            myApplications: student ? student.applications : [],
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching job data");
    }
});

app.get("/jobs/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const job = await JobApplication.findById(id);
        if (!job) {
            req.flash('error', 'Cannot find that job!');
            return res.redirect('/jobs');
        }
        res.render("detailjobapplication", {
            title: "Job Details",
            job
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong.');
        res.redirect('/jobs');
    }
});
app.get('/jobs/:id/apply', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const job = await JobApplication.findById(id);
        if (!job) {
            req.flash('error', 'Cannot find that job to apply for!');
            return res.redirect('/jobs');
        }
        res.render('apply', { title: 'Apply for Job', job });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong when loading the application page.');
        res.redirect(`/jobs/${req.params.id}`);
    }
});

app.post('/jobs/:id/apply', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const job = await JobApplication.findById(id);
        const student = await Student.findById(req.user._id);


        const newApplication = new Application({
            ...req.body,
            job: job._id,
            student: student._id
        });
        await newApplication.save();

        student.applications.push(newApplication);
        await student.save();

        req.flash('success', 'Your application was submitted successfully!');
        res.redirect('/jobs');

    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to submit your application. Please try again.');
        res.redirect(`/jobs/${req.params.id}`);
    }
});

app.get("/practice", isLoggedIn, async (req, res) => {
    try {
        // Fetch all available mock tests
        const mockTests = await Test.find({});

        // Fetch all company tests
        const companyTests = await CompanyTest.find({});

        res.render("practice", {
            title: "Practice & Exams",
            mockTests,
            companyTests
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not load the practice and exam page.');
        res.redirect('/');
    }
});


app.get("/resume", isLoggedIn, async (req, res) => {
    const resume = await Resume.findOne({ student: req.user._id });
    res.render("resume", { title: "Resume Builder", resume });
});


app.post("/resume", isLoggedIn, async (req, res) => {
    const toArray = (data) => data ? (Array.isArray(data) ? data : [data]) : [];

    const { fullName, email, phone, summary, skillsCsv, achieve } = req.body;

    const eduInstitutes = toArray(req.body.eduInstitute);
    const eduDegrees = toArray(req.body.eduDegree);
    const eduYears = toArray(req.body.eduYear);
    const expCompanies = toArray(req.body.expCompany);
    const expRoles = toArray(req.body.expRole);
    const expYears = toArray(req.body.expYear);
    const projNames = toArray(req.body.projName);
    const projDescs = toArray(req.body.projDesc);

    const achievements = (achieve || "").split(/\r?\n/).map(a => a.trim()).filter(Boolean);

    const payload = {
        student: req.user._id,
        fullName, email, phone, summary,
        skills: (skillsCsv || "").split(",").map(s => s.trim()).filter(Boolean),
        education: eduInstitutes.map((institute, i) => ({
            institute: institute,
            degree: eduDegrees[i],
            year: eduYears[i]
        })).filter(e => e.institute),
        experience: expCompanies.map((company, i) => ({
            company: company,
            role: expRoles[i],
            year: expYears[i]
        })).filter(e => e.company),
        projects: projNames.map((name, i) => ({
            name: name,
            description: projDescs[i]
        })).filter(p => p.name),
        achievements: achievements 
    };

    await Resume.findOneAndUpdate(
        { student: req.user._id },
        { $set: payload },
        { upsert: true }
    );

    res.redirect("/preview");
});
app.get("/preview", isLoggedIn, async (req, res) => {
    const resume = await Resume.findOne({ student: req.user._id });
    if (!resume) return res.redirect("/resume");
    res.render("preview", { title: "Resume Preview", resume });
});
app.get("/resume/download", isLoggedIn, async (req, res) => {
    const resume = await Resume.findOne({ student: req.user._id });
    if (!resume) return res.redirect("/resume");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");

    const doc = new PDFDocument();
    doc.pipe(res);


    doc.fontSize(20).text(resume.fullName, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`${resume.email} | ${resume.phone}`, { align: "center" });
    doc.moveDown(1);


    if (resume.summary) {
        doc.fontSize(14).text("Summary", { underline: true });
        doc.fontSize(12).text(resume.summary);
        doc.moveDown();
    }


    if (resume.skills?.length) {
        doc.fontSize(14).text("Skills", { underline: true });
        doc.fontSize(12).text(resume.skills.join(", "));
        doc.moveDown();
    }


    if (resume.education?.length) {
        doc.fontSize(14).text("Education", { underline: true });
        resume.education.forEach(e => {
            doc.fontSize(12).text(`${e.degree} - ${e.institute} (${e.year})`);
        });
        doc.moveDown();
    }

    if (resume.experience?.length) {
        doc.fontSize(14).text("Experience", { underline: true });
        resume.experience.forEach(x => {
            doc.fontSize(12).text(`${x.role} at ${x.company} (${x.year})`);
        });
        doc.moveDown();
    }


    if (resume.projects?.length) {
        doc.fontSize(14).text("Projects", { underline: true });
        resume.projects.forEach(p => {
            doc.fontSize(12).text(`${p.name}: ${p.description}`);
        });
        doc.moveDown();
    }

    if (resume.achievements?.length) {
        doc.fontSize(14).text("Achievements", { underline: true });
        resume.achievements.forEach(a => {
            doc.fontSize(12).text(`• ${a}`, { continued: false });
        });
        doc.moveDown();
    }
    doc.end();
});

app.get("/profile", isLoggedIn, async (req, res) => {
    try {
        // Find the logged-in student and populate their recent applications
        const student = await Student.findById(req.user._id).populate({
            path: 'applications',
            options: { sort: { 'appliedOn': -1 } }, // Sort to get the most recent first
            populate: {
                path: 'job',
                model: 'JobApplication'
            }
        });

        // Also, find if an editable resume exists for this student
        const savedResume = await Resume.findOne({ student: req.user._id });

        if (!student) {
            req.flash('error', 'Could not find your profile.');
            return res.redirect('/');
        }
        
        // Render the profile page, passing both student and savedResume data
        res.render("profile", {
            title: "My Profile",
            student,
            savedResume // Pass the editable resume data to the view
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong while loading your profile.');
        res.redirect('/');
    }
});

// This route handles the profile update from the form's AJAX request
app.post("/profile/update", isLoggedIn, async (req, res) => {
    try {
        const { cgpa, skills, projects } = req.body;

        // Sanitize and prepare the data for the database
        const skillsArray = (skills || "").split(",").map(s => s.trim()).filter(Boolean);
        const projectsArray = (projects || "").split(/\r?\n/).map(p => p.trim()).filter(Boolean);
        
        // Find the student by their ID and update their information
        await Student.findByIdAndUpdate(req.user._id, {
            cgpa,
            skills: skillsArray,
            projects: projectsArray
        });
        
        // Send a success response back to the browser
        res.status(200).json({ message: "Profile updated successfully!" });
    } catch (err) {
        console.error("Profile update error:", err);
        // Send an error response if something goes wrong
        res.status(500).json({ message: "Server error while updating profile." });
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

