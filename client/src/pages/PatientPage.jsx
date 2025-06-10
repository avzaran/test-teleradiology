import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

function PatientPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('username'));
  const [requests, setRequests] = useState([]);
  const [file, setFile] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn) fetchRequests();
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRequests = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/requests?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
        // Calculate stats
        setStats({
          total: data.length,
          pending: data.filter(r => r.status !== 'completed').length,
          completed: data.filter(r => r.status === 'completed').length
        });
      } else {
        throw new Error('Failed to fetch requests');
      }
    } catch (err) {
      setError('Failed to load your requests. Please try again.');
    }
  };

  const register = async () => {
    try {
      if (!username || !password) {
        setError('Please enter both username and password');
        return;
      }

      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        setError('');
        alert('Registration successful! Please login.');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const login = async () => {
    try {
      if (!username || !password) {
        setError('Please enter both username and password');
        return;
      }

      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        setError('');
        localStorage.setItem('username', username);
        setIsLoggedIn(true);
        setPassword('');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const upload = async () => {
    if (!file) return;
    try {
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
        fetchRequests(); // Refresh the list
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    }
  };

  const filteredRequests = requests.filter(r => {
    return filter === 'all' || 
      (filter === 'pending' && r.status !== 'completed') ||
      (filter === 'completed' && r.status === 'completed');
  });

  if (!isLoggedIn) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="card w-full max-w-md">
          <div className="flex justify-between items-center mb-lg">
            <h2 className="text-center">Patient Portal</h2>
            <Link to="/" className="btn btn-secondary">Home</Link>
          </div>
          
          {error && (
            <div className="bg-danger text-white p-md rounded-md mb-md">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-md">
            <input 
              className="w-full"
              placeholder="Username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
            <input 
              className="w-full"
              placeholder="Password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            <div className="flex gap-md">
              <button className="btn flex-1" onClick={login}>Login</button>
              <button className="btn btn-secondary flex-1" onClick={register}>Register</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-lg">
      <div className="flex justify-between items-center mb-lg">
        <h2>Welcome, {username}</h2>
        <div className="flex gap-md">
          <Link to="/" className="btn btn-secondary">Home</Link>
          <button 
            className="btn btn-danger"
            onClick={() => { 
              localStorage.removeItem('username'); 
              setIsLoggedIn(false);
              navigate('/');
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-danger text-white p-md rounded-md mb-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-md mb-lg">
        <div className="card bg-primary text-white">
          <h3>Total Requests</h3>
          <p className="text-2xl">{stats.total}</p>
        </div>
        <div className="card bg-warning text-white">
          <h3>Pending</h3>
          <p className="text-2xl">{stats.pending}</p>
        </div>
        <div className="card bg-success text-white">
          <h3>Completed</h3>
          <p className="text-2xl">{stats.completed}</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card mb-lg">
        <h3 className="mb-md">Upload New MRI</h3>
        <div className="flex gap-md items-end">
          <div className="flex-1">
            <input 
              type="file" 
              className="w-full"
              onChange={e => setFile(e.target.files[0])} 
            />
            {file && (
              <p className="text-muted-foreground mt-sm">
                Selected file: {file.name}
              </p>
            )}
          </div>
          <button 
            className="btn btn-success"
            onClick={upload}
            disabled={!file}
          >
            Create Request
          </button>
        </div>
      </div>

      {/* Requests Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-md">
          <h3>Your Requests</h3>
          <select 
            className="w-48"
            value={filter} 
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="grid gap-md">
          {filteredRequests.map(r => (
            <div key={r.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="mb-sm">MRI Request</h4>
                  <p className="text-muted-foreground">File: {r.file}</p>
                  <p className="text-muted-foreground">Status: {r.status}</p>
                  <p className="text-muted-foreground">
                    Date: {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <a 
                  href={`http://localhost:3001/uploads/${r.file}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-secondary"
                >
                  View MRI
                </a>
              </div>

              {r.doctorNotes && (
                <div className="mt-md p-md bg-muted rounded-md">
                  <h4 className="mb-sm">Doctor's Notes:</h4>
                  <p>{r.doctorNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PatientPage;
