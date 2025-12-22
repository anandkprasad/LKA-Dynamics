// Node.js server with EJS and static assets
const express = require("express");
const path = require("path");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// ================== Middleware ==================
app.use(express.urlencoded({ extended: true })); // replaces body-parser
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================== Routes ==================
app.get("/", (req, res) => {
  res.render("index");
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
      phone: `${country_code || ""}${phone}`,
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

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================== 404 ==================
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// ================== Start Server ==================
(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
