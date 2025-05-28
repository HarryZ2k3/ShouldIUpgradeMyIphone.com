// src/ProfilePage.js

import React, { useEffect, useState } from 'react';
import { useNavigate }      from 'react-router-dom';
import './ProfilePage.css';

const API_BASE = 'https://shouldiupgrademyiphone-backend.onrender.com';

export default function ProfilePage() {
  const [user,    setUser]    = useState(null);
  const [options, setOptions] = useState([]);
  const [model,   setModel]   = useState('');
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 1) Who am I?
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(u => {
        setUser(u);
        setModel(u.currentModel || '');
      })
      .catch(() => navigate('/login'));

    // 2) Load iPhone list
    fetch(`${API_BASE}/api/iphones`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setOptions(data.map(i => i['Model Name'])))
      .catch(console.error);
  }, [navigate]);

  // Save the chosen model
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
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  // Upload new avatar
  const handleImageChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('avatar', file);

    try {
      const res = await fetch(`${API_BASE}/auth/me/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: form
      });
      if (!res.ok) throw new Error('Upload failed');
      const { avatarUrl } = await res.json();
      // update user with new URL
      setUser(u => ({ ...u, avatarUrl }));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  if (!user) return null; // or a spinner

  // choose which avatar to show
  const avatarSrc = user.avatarUrl
    ? `${API_BASE}${user.avatarUrl}`
    : '/frontend/public/images/place_holder.png';

  return (
    <div className="profile-page-container">
      <div className="back-arrow" onClick={() => navigate('/')}>
        &#x25C0;
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <label htmlFor="avatar-upload" className="profile-pic">
            <img src={avatarSrc} alt="avatar" className="avatar" />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />

          <div className="user-info">
            <div className="user-name">{user.name || user.email}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>

        <hr />

        <form onSubmit={handleSave}>
          {error && <p className="error">{error}</p>}
          <div className="form-group">
            <label>Your current iPhone model</label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              required
            >
              <option value="">— Select model —</option>
              {options.map((m,i) => <option key={i} value={m}>{m}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>

        <hr />

        <div className="favorite-section">
          <div className="section-title">Favorite Model</div>
          <div className="favorite-slider">
            {/* placeholders */}
            <div className="model-card placeholder" />
            <div className="model-card placeholder" />
            <div className="model-card placeholder" />
            <div className="counter">0/0</div>
            <div className="arrow">{'>'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
