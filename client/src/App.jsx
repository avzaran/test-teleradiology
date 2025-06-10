import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('username'));
  const [requests, setRequests] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (isLoggedIn) fetchRequests();
  }, [isLoggedIn]);

  const fetchRequests = async () => {
    const res = await fetch(`http://localhost:3001/api/requests?username=${username}`);
    if (res.ok) {
      const data = await res.json();
      setRequests(data);
    }
  };

  const register = async () => {
    const res = await fetch('http://localhost:3001/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      alert('Registered! Please login.');
    } else {
      alert('Registration failed');
    }
  };

  const login = async () => {
    const res = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      localStorage.setItem('username', username);
      setIsLoggedIn(true);
      setPassword('');
    } else {
      alert('Login failed');
    }
  };

  const upload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    form.append('username', username);
    const res = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: form
    });
    if (res.ok) {
      const data = await res.json();
      setRequests([...requests, data.request]);
      setFile(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login">
        <h2>Patient Login / Register</h2>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={login}>Login</button>
        <button onClick={register}>Register</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Welcome, {username}</h2>
      <button onClick={() => { localStorage.removeItem('username'); setIsLoggedIn(false); }}>Logout</button>
      <h3>Upload MRI</h3>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={upload}>Create Request</button>

      <h3>Your Requests</h3>
      <ul>
        {requests.map(r => (
          <li key={r.id}>
            File: <a href={`http://localhost:3001/uploads/${r.file}`} target="_blank" rel="noreferrer">{r.file}</a> - Status: {r.status}
            {r.doctorNotes && (
              <p><strong>Doctor notes:</strong> {r.doctorNotes}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
