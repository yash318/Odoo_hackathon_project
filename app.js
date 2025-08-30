const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");

const Student = require("./models/student");
const Company = require("./models/compny");   

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

// Routes
app.get("/", async (req, res) => {
    try {
        const student = await Student.findOne({ email: "yash@example.com" })
            .populate("applications.company");   // ✅ now works

        res.render("studentdash", { 
            title: "Dashboard", 
            student 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching student");
    }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
