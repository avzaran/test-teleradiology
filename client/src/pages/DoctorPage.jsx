import { useState, useEffect } from 'react';
import '../App.css';

function DoctorPage() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [requests, setRequests] = useState([]);
  const [note, setNote] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const login = async () => {
    const res = await fetch('http://localhost:3001/api/doctor/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      setIsLoggedIn(true);
      setPassword('');
    } else {
      alert('Login failed');
    }
  };

  const fetchRequests = async () => {
    const res = await fetch('http://localhost:3001/api/allrequests');
    if (res.ok) {
      const data = await res.json();
      setRequests(data);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchRequests();
  }, [isLoggedIn]);

  const complete = async (reqId, username) => {
    const res = await fetch(`http://localhost:3001/api/requests/${reqId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: note, username })
    });
    if (res.ok) {
      setNote('');
      fetchRequests();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login container">
        <h2>Doctor Login</h2>
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div className="dashboard container">
      <h2>Doctor Dashboard</h2>
      <button onClick={() => { setIsLoggedIn(false); }}>Logout</button>
      <h3>Patient Requests</h3>
      <ul>
        {requests.map(r => (
          <li key={r.id}>
            {r.username}: <a href={`http://localhost:3001/uploads/${r.file}`} target="_blank" rel="noreferrer">{r.file}</a> - {r.status}
            {r.status !== 'completed' && (
              <div>
                <input placeholder="Notes" value={selectedId === r.id ? note : ''} onChange={e => { setSelectedId(r.id); setNote(e.target.value); }} />
                <button onClick={() => complete(r.id, r.username)}>Complete</button>
              </div>
            )}
            {r.doctorNotes && <p><strong>Notes:</strong> {r.doctorNotes}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DoctorPage;
