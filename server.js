require("dotenv").config();

// Purvaja MediQR - server.js
const express = require("express");
const session = require("express-session");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const QRCode = require("qrcode");
const path = require("path");
const os = require("os");

const app = express();
const PORT = 3000;

// -------------------- Database Connection --------------------
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "mediqr",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// -------------------- Middleware --------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "purvaja_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.static(path.join(__dirname, "public")));

// -------------------- Helper --------------------
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

// -------------------- Routes --------------------

// Root → redirect
app.get("/", (req, res) => {
  if (req.session.userId) res.redirect("/index.html");
  else res.redirect("/login.html");
});

// Signup
app.post("/signup", async (req, res) => {
  const { name, email, password, blood_group, allergies, emergency_contact } =
    req.body;
  if (!name || !email || !password)
    return res.status(400).send("Missing required fields");

  const password_hash = await bcrypt.hash(password, 10);
  const public_token = Math.random().toString(36).substring(2, 15);

  try {
    const [result] = await pool.query(
      `INSERT INTO users 
       (name, email, password_hash, blood_group, allergies, emergency_contact, public_token) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        password_hash,
        blood_group,
        allergies,
        emergency_contact,
        public_token,
      ]
    );
    req.session.userId = result.insertId;
    res.redirect("/index.html");
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).send("Email already exists!");
    res.status(500).send("Error creating account");
  }
});

// Login
app.post("/login", async (req, res) => {
  console.log("Login POST request received:", req.body); // debug
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(401).send("Invalid email or password");

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).send("Invalid email or password");

    req.session.userId = user.id;
    res.redirect("/index.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});

// Dashboard API
app.get("/api/dashboard", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Unauthorized" });

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      req.session.userId,
    ]);
    const user = rows[0];
    const profileUrl = `http://${getLocalIP()}:${PORT}/profile/${user.public_token}`;
    const qrDataUrl = await QRCode.toDataURL(profileUrl);

    res.json({
      name: user.name,
      blood_group: user.blood_group,
      allergies: user.allergies,
      emergency_contact: user.emergency_contact,
      profileUrl,
      qrDataUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading dashboard" });
  }
});

// Public Profile
app.get("/profile/:token", async (req, res) => {
  const token = req.params.token;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE public_token = ?",
      [token]
    );
    if (rows.length === 0) return res.status(404).send("Profile not found");

    const user = rows[0];
    res.send(`
      <h1>Emergency Medical Info</h1>
      <p><b>Name:</b> ${user.name}</p>
      <p><b>Blood Group:</b> ${user.blood_group || "N/A"}</p>
      <p><b>Allergies:</b> ${user.allergies || "N/A"}</p>
      <p><b>Emergency Contact:</b> ${user.emergency_contact || "N/A"}</p>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading profile");
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login.html"));
});

// -------------------- Start Server --------------------
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📱 LAN access: http://${getLocalIP()}:${PORT}`);
});