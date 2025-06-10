const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data.json");

// Initialize data structure
let data = {
  users: {},
  doctorPassword: "doctor123", // Default doctor password
};

// Load data from file if it exists
try {
  if (fs.existsSync(DATA_FILE)) {
    const fileData = fs.readFileSync(DATA_FILE, "utf8");
    data = JSON.parse(fileData);
  } else {
    // Create initial data file
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  }
} catch (error) {
  console.error("Error loading data:", error);
}

// Save data to file
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

// User management
function getUser(username) {
  return data.users[username];
}

function createUser(username, password) {
  if (data.users[username]) {
    return false;
  }
  data.users[username] = {
    password,
    requests: [],
  };
  saveData();
  return true;
}

function verifyUser(username, password) {
  const user = data.users[username];
  return user && user.password === password;
}

function addRequest(username, request) {
  const user = data.users[username];
  if (!user) return false;
  user.requests.push(request);
  saveData();
  return true;
}

function getAllRequests() {
  const all = [];
  Object.keys(data.users).forEach((username) => {
    data.users[username].requests.forEach((request) => {
      all.push({ ...request });
    });
  });
  return all;
}

function getUserRequests(username) {
  const user = data.users[username];
  return user ? user.requests : [];
}

function completeRequest(requestId, notes) {
  for (const username of Object.keys(data.users)) {
    const request = data.users[username].requests.find(
      (r) => r.id === requestId
    );
    if (request) {
      request.status = "completed";
      request.doctorNotes = notes;
      saveData();
      return request;
    }
  }
  return null;
}

// Doctor authentication
function verifyDoctor(password) {
  return password === data.doctorPassword;
}

function changeDoctorPassword(newPassword) {
  data.doctorPassword = newPassword;
  saveData();
  return true;
}

module.exports = {
  getUser,
  createUser,
  verifyUser,
  addRequest,
  getAllRequests,
  getUserRequests,
  completeRequest,
  verifyDoctor,
  changeDoctorPassword,
};
