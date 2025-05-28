// src/ProfilePage.js

import React, { useEffect, useState } from 'react';
import { useNavigate }      from 'react-router-dom';
import './ProfilePage.css';

const API_BASE = process.env.REACT_APP_API_URL;

// map model names to image filenames
const modelImageMap = {
  "iphone 11": "11.png",       "iphone 11 pro": "11pro.png",
  "iphone 11 pro max": "11promax.png",
  "iphone 12": "12.png",       "iphone 12 mini": "12mini.png",
  "iphone 12 pro": "12pro.png", "iphone 12 pro max": "12promax.png",
  "iphone 13": "13.png",       "iphone 13 mini": "13mini.png",
  "iphone 13 pro": "13pro.png", "iphone 13 pro max": "13promax.png",
  "iphone 14": "14.png",       "iphone 14 plus": "14plus.png",
  "iphone 14 pro": "14pro.png", "iphone 14 pro max": "14promax.png",
  "iphone 15": "15.png",       "iphone 15 plus": "15plus.png",
  "iphone 15 pro": "15pro.png", "iphone 15 pro max": "15promax.png",
  "iphone 16": "16.png",       "iphone 16 plus": "16plus.png",
  "iphone 16 pro": "16pro.png", "iphone 16 pro max": "16promax.png",
  "iphone se (2nd generation)": "SE2nd.png",
  "iphone se (3rd generation)": "SE3rd.png",
  "iphone xr": "XR.png"
};

function getModelImage(name) {
  const key = name.trim().toLowerCase();
  return modelImageMap[key]
    ? `/images/${modelImageMap[key]}`
    : '/images/place_holder.png';
}

export default function ProfilePage() {
  const [user,      setUser]      = useState(null);
  const [options,   setOptions]   = useState([]);
  const [model,     setModel]     = useState('');
  const [favorites, setFavorites] = useState([]);
  const [favInput,  setFavInput]  = useState('');
  const [error,     setError]     = useState('');
  const navigate = useNavigate();

  // Upload new avatar
  const handleAvatarChange = async e => {
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
      setUser(u => ({ ...u, avatarUrl }));
    } catch {
      setError('Failed to upload avatar');
    }
  };

  useEffect(() => {
    // fetch user profile
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(u => {
        setUser(u);
        setModel(u.currentModel || '');
      })
      .catch(() => navigate('/login'));

    // fetch favorites
    fetch(`${API_BASE}/auth/me/favorites`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setFavorites(d.favorites || []))
      .catch(console.error);

    // fetch all iPhone models
    fetch(`${API_BASE}/api/iphones`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setOptions(data.map(i => i['Model Name'])))
      .catch(console.error);
  }, [navigate]);

  // Save current model: now reload page instead of navigate home
  const handleSaveModel = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/me/model`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ model })
      });
      if (!res.ok) throw new Error();
      // refresh current profile page
      window.location.reload();
    } catch {
      setError('Failed to save current model');
    }
  };

  // Add favorite
  const handleAddFavorite = val => {
    if (!val || favorites.includes(val)) return;
    setFavorites([...favorites, val]);
    setFavInput('');
  };

  // Remove favorite
  const handleRemoveFavorite = val => {
    setFavorites(favorites.filter(f => f !== val));
  };

  // Persist favorites
  const handleSaveFavorites = async () => {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/me/favorites`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ favorites })
      });
      if (!res.ok) throw new Error();
      window.location.reload();
    } catch {
      setError('Failed to save favorites');
    }
  };

  if (!user) return null;

  const suggestions = favInput
    ? options.filter(o =>
        o.toLowerCase().includes(favInput.toLowerCase()) && !favorites.includes(o)
      )
    : [];

  return (
    <div className="profile-page-container">
      <div className="back-arrow" onClick={() => navigate('/')}>◀</div>
      <div className="profile-card">
        {/* === Profile Header === */}
        <div className="profile-header">
          <label htmlFor="avatar-upload" className="profile-pic">
            <img
              src={user.avatarUrl ? `${API_BASE}${user.avatarUrl}` : '/images/place_holder.png'}
              alt="avatar"
              className="avatar"
            />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
          <div className="user-info">
            <div className="user-name">{user.name || user.email}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>

        <hr />

        {/* === Current Model === */}
        <form onSubmit={handleSaveModel} className="form-group">
          <label>Your current iPhone model</label>
          <select value={model} onChange={e => setModel(e.target.value)} required>
            <option value="">— Select model —</option>
            {options.map((m,i) => (
              <option key={i} value={m}>{m}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>

        <hr />

        {/* === Add Favorites === */}
        <div className="form-group">
          <label>Add Favorite Models</label>
          <div className="favorite-input-container">
            <input
              type="text"
              className="favorite-input"
              placeholder="Start typing to search…"
              value={favInput}
              onChange={e => setFavInput(e.target.value)}
            />
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.slice(0,5).map((s,i) => (
                  <li key={i} onClick={() => handleAddFavorite(s)}>{s}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="chips-container">
            {favorites.map((f,i) => (
              <span key={i} className="chip">
                {f}
                <button type="button" className="chip-remove" onClick={() => handleRemoveFavorite(f)}>×</button>
              </span>
            ))}
          </div>
          <button type="button" className="btn btn-secondary" onClick={handleSaveFavorites}>
            Save Favorites
          </button>
        </div>

        <hr />

        {/* === Favorites Preview Grid === */}
        <div className="favorite-section">
          <div className="section-title">Your Favorite Models</div>
          {favorites.length === 0 ? (
            <p>No favorites selected.</p>
          ) : (
            <div className="favorite-grid">
              {favorites.map((fav,i) => (
                <div className="model-card" key={i}>
                  <img src={getModelImage(fav)} alt={fav} className="fav-image" />
                  <div className="model-name">{fav}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
