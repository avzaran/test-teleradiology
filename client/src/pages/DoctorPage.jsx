import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

function DoctorPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [requests, setRequests] = useState([]);
  const [note, setNote] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });
  const [error, setError] = useState('');

  const login = async () => {
    try {
      if (!password) {
        setError('Please enter the password');
        return;
      }

      const res = await fetch('http://localhost:3001/api/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        setError('');
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

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/allrequests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
        setStats({
          total: data.length,
          pending: data.filter(r => r.status !== 'completed').length,
          completed: data.filter(r => r.status === 'completed').length
        });
      } else {
        throw new Error('Failed to fetch requests');
      }
    } catch (err) {
      setError('Failed to load requests. Please try again.');
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchRequests();
  }, [isLoggedIn]);

  const complete = async (reqId, username) => {
    try {
      if (!note) {
        setError('Please add notes before completing the request');
        return;
      }

      const res = await fetch(`http://localhost:3001/api/requests/${reqId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: note, username })
      });

      if (res.ok) {
        setError('');
        setNote('');
        setSelectedId(null);
        fetchRequests();
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to complete request');
      }
    } catch (err) {
      setError(err.message || 'Failed to complete request. Please try again.');
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesFilter = filter === 'all' || 
      (filter === 'pending' && r.status !== 'completed') ||
      (filter === 'completed' && r.status === 'completed');
    
    const matchesSearch = r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.file.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (!isLoggedIn) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="card w-full max-w-md">
          <div className="flex justify-between items-center mb-lg">
            <h2 className="text-center">Doctor Login</h2>
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
              placeholder="Password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            <button className="btn w-full" onClick={login}>Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-lg">
      <div className="flex justify-between items-center mb-lg">
        <h2>Doctor Dashboard</h2>
        <div className="flex gap-md">
          <Link to="/" className="btn btn-secondary">Home</Link>
          <button 
            className="btn btn-danger"
            onClick={() => { 
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

      {/* Filters */}
      <div className="flex gap-md mb-lg">
        <div className="flex-1">
          <input
            className="w-full"
            placeholder="Search by patient name or file..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
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

      {/* Requests List */}
      <div className="grid gap-md">
        {filteredRequests.map(r => (
          <div key={r.id} className="card">
            <div className="flex justify-between items-start mb-md">
              <div>
                <h3 className="mb-sm">Patient: {r.username}</h3>
                <p className="text-muted-foreground">File: {r.file}</p>
                <p className="text-muted-foreground">Status: {r.status}</p>
                <p className="text-muted-foreground">Date: {new Date(r.createdAt).toLocaleDateString()}</p>
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

            {r.status !== 'completed' && (
              <div className="mt-md">
                <textarea
                  className="w-full mb-sm"
                  placeholder="Add your notes here..."
                  value={selectedId === r.id ? note : ''}
                  onChange={e => { setSelectedId(r.id); setNote(e.target.value); }}
                  rows={3}
                />
                <button 
                  className="btn btn-success"
                  onClick={() => complete(r.id, r.username)}
                >
                  Complete Request
                </button>
              </div>
            )}

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
  );
}

export default DoctorPage;
