const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const data = require("./data");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, "uploads");
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

app.post("/api/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (data.createUser(username, password)) {
    res.json({ message: "Registration successful" });
  } else {
    res.status(400).json({ message: "User already exists" });
  }
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (data.verifyUser(username, password)) {
    res.json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

app.post("/api/doctor/login", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  if (data.verifyDoctor(password)) {
    res.json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid password" });
  }
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const request = {
    id: Date.now().toString(),
    file: req.file.filename,
    status: "uploaded",
    doctorNotes: "",
    username,
    createdAt: new Date().toISOString(),
  };

  if (data.addRequest(username, request)) {
    res.json({ request });
  } else {
    res.status(401).json({ message: "Unknown user" });
  }
});

app.get("/api/requests", (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  const requests = data.getUserRequests(username);
  res.json(requests);
});

app.get("/api/allrequests", (req, res) => {
  const requests = data.getAllRequests();
  res.json(requests);
});

app.post("/api/requests/:id/complete", (req, res) => {
  const { notes } = req.body;
  const requestId = req.params.id;

  if (!notes) {
    return res.status(400).json({ message: "Notes are required" });
  }

  const request = data.completeRequest(requestId, notes);
  if (request) {
    res.json({ request });
  } else {
    res.status(404).json({ message: "Request not found" });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(
    "Default doctor password:",
    data.verifyDoctor("doctor123") ? "doctor123" : "changed"
  );
});
