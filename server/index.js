const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dest = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    cb(null, dest);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const users = {};

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (users[username]) {
    return res.status(400).json({ message: 'User already exists' });
  }
  users[username] = { password, requests: [] };
  res.json({ message: 'registered' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ message: 'logged in' });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  const { username } = req.body;
  if (!users[username]) {
    return res.status(401).json({ message: 'Unknown user' });
  }
  const request = {
    id: Date.now().toString(),
    file: req.file.filename,
    status: 'uploaded',
    doctorNotes: ''
  };
  users[username].requests.push(request);
  res.json({ request });
});

app.get('/api/requests', (req, res) => {
  const { username } = req.query;
  const user = users[username];
  if (!user) {
    return res.status(401).json({ message: 'Unknown user' });
  }
  res.json(user.requests);
});

app.post('/api/requests/:id/complete', (req, res) => {
  const { username, notes } = req.body;
  const user = users[username];
  if (!user) {
    return res.status(401).json({ message: 'Unknown user' });
  }
  const request = user.requests.find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }
  request.status = 'completed';
  request.doctorNotes = notes;
  res.json({ request });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
