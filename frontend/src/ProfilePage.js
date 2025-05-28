import React, { useEffect, useState } from 'react';
import { useNavigate }      from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL;

export default function ProfilePage() {
  const [user, setUser]       = useState(null);
  const [options, setOptions] = useState([]);
  const [model, setModel]     = useState('');
  const [error, setError]     = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // load real user + models
  useEffect(() => {
    // 1) whoami
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

    // 2) iPhone list
    fetch(`${API_BASE}/api/iphones`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setOptions(data.map(i => i['Model Name'])))
      .catch(console.error);
  }, [navigate]);

  // save chosen model
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
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  // upload avatar
  const handleImageChange = async e => {
    if (!e.target.files[0]) return;
    setUploading(true);
    const form = new FormData();
    form.append('avatar', e.target.files[0]);
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
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null; // or spinner

  return (
    <div className="profile-page-container">
      <div className="back-arrow" onClick={() => navigate('/')}>
        &#x25C0;
      </div>

      <div className="profile-card">
        {/* Avatar + upload */}
        <div className="profile-header">
          <label htmlFor="avatar-upload" className="profile-pic">
            <img
              src={user.avatarUrl || '/placeholder-profile.png'}
              alt="avatar"
              className="avatar"
            />
            {uploading && <div className="uploading-indicator">Uploading…</div>}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>

        <hr />

        {/* Model picker */}
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
              {options.map((m,i) => (
                <option key={i} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </form>

        <hr />

        {/* Favorites (placeholder) */}
        <div className="favorite-section">
          <div className="section-title">Favorite Model</div>
          {/* … */}
        </div>
      </div>
    </div>
  );
}
