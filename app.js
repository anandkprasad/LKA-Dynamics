// Node.js server with EJS and static assets
const express = require('express');
const path = require('path');
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;


var bodyParser  = require("body-parser");
const connectDB = require("./db");


app.use(bodyParser.urlencoded({extended:true}));


// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


// Routes
app.get('/', (req, res) => {
  
	res.render('index');
});

app.post("/contact", async (req, res) => {
  try {
    const db = await connectDB();
    const contacts = db.collection("contacts");

    const { name, email, country_code, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).send("Missing required fields");
    }

    await contacts.insertOne({
      name,
      email,
      phone: `${country_code}${phone}`,
      message,
      createdAt: new Date(),
      source: "website"
    });

            res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/waitlist", async (req, res) => {
  try {
    const db = await connectDB();
    const waitlist = db.collection("waitlist");

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    await waitlist.insertOne({
      email,
      createdAt: new Date(),
      source: "homepage"
    });

    res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



(async () => {
  await connectDB();  
  
  app.listen(PORT, () => {
    console.log("Server is running on port");
  });
})();