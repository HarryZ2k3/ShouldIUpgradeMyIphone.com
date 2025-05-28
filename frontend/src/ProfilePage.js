import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const API_BASE = 'https://shouldiupgrademyiphone-backend.onrender.com';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [options, setOptions] = useState([]);
  const [model, setModel] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [favIndex, setFavIndex] = useState(0);
  const [error, setError] = useState('');
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

    // 3) Load favorites
    fetch(`${API_BASE}/auth/me/favorites`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load favorites');
        return res.json();
      })
      .then(data => {
        setFavorites(data.favorites || []);
        setFavIndex(0);
      })
      .catch(console.error);
  }, [navigate]);

  // Save currentModel
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
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  // Save favorites
  const handleSaveFavorites = async () => {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/me/favorites`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ favorites })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      // optionally notify success
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return null;

  // Determine display for favorites slider
  const currentFav = favorites[favIndex] || null;

  return (
    <div className="profile-page-container">
      <div className="back-arrow" onClick={() => navigate('/')}>◀</div>

      <div className="profile-card">
        {/* Avatar and Basic Info */}
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
            onChange={async e => {
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
              } catch (err) {
                setError(err.message);
              }
            }}
          />

          <div className="user-info">
            <div className="user-name">{user.name || user.email}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>

        <hr />

        {/* Current Model Form */}
        <form onSubmit={handleSaveModel} className="form-group">
          <label>Your current iPhone model</label>
          <select value={model} onChange={e => setModel(e.target.value)} required>
            <option value="">— Select model —</option>
            {options.map((m, i) => <option key={i} value={m}>{m}</option>)}
          </select>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>

        <hr />

        {/* Favorites Multi-select & Save */}
        <div className="form-group">
          <label>Your Favorite Models</label>
          <select
            multiple
            value={favorites}
            onChange={e => {
              const chosen = Array.from(e.target.selectedOptions).map(o => o.value);
              setFavorites(chosen);
              setFavIndex(0);
            }}
            size={5}
          >
            {options.map((m, i) => <option key={i} value={m}>{m}</option>)}
          </select>
          <button type="button" className="btn btn-secondary" onClick={handleSaveFavorites}>
            Save Favorites
          </button>
        </div>

        <hr />

        {/* Favorites Slider Display */}
        <div className="favorite-section">
          <div className="section-title">Favorite Models</div>
          {favorites.length === 0 ? (
            <p>No favorites selected.</p>
          ) : (
            <div className="favorite-slider">
              <button
                className="btn btn-ghost"
                onClick={() => setFavIndex(i => Math.max(0, i - 1))}
                disabled={favIndex === 0}
              >‹</button>

              <div className="model-card">
                <h4>{currentFav}</h4>
                <img
                  src={`/images/${currentFav.toLowerCase().replace(/[^a-z0-9]+/g,'')}.png`}
                  alt={currentFav}
                  className="fav-image"
                />
              </div>

              <button
                className="btn btn-ghost"
                onClick={() => setFavIndex(i => Math.min(favorites.length - 1, i + 1))}
                disabled={favIndex === favorites.length - 1}
              >›</button>

              <div className="counter">{favIndex + 1}/{favorites.length}</div>
            </div>
          )}
        </div>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
