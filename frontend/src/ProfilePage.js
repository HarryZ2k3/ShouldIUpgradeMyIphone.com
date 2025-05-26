// src/ProfilePage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL;  // e.g. "https://api.your-domain.com"

export default function ProfilePage() {
  const [user, setUser]       = useState(null);
  const [options, setOptions] = useState([]);
  const [model, setModel]     = useState('');
  const [error, setError]     = useState('');
  const navigate              = useNavigate();

  // 1) Load user info
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then(res => {
        if (res.status === 401) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setModel(data.currentModel || '');
      })
      .catch(() => {
        navigate('/login');
      });

    // Fetch all iPhone models
    fetch(`${API_BASE}/api/iphones`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setOptions(data.map(i => i["Model Name"])))
      .catch(err => console.error(err));
  }, [navigate]);

  // 2) Save selected model
  const handleSave = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/me/model`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ model })
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Save failed');
      }
      navigate('/'); // back to home
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return null; // or a spinner

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome, {user.email}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Your current iPhone model</label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              required
            >
              <option value="">— Select model —</option>
              {options.map((m, i) => (
                <option key={i} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      </div>
    </div>
  );
}
