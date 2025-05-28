import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL;

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [options, setOptions] = useState([]);
  const [model, setModel] = useState('');
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock user
    setUser({ name: 'Exian Maple', email: 'Example123@gmail.com', currentModel: '' });

    fetch(`${API_BASE}/api/iphones`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setOptions(data.map(i => i["Model Name"])))
      .catch(err => console.error(err));
  }, [navigate]);

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

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page-container">
      {/* Back arrow */}
      <div className="back-arrow" onClick={() => navigate('/')}>
        &#x25C0;
      </div>

      <div className="profile-card">
        {/* Profile section */}
        <div className="profile-header">
          <div className="profile-pic">
            <input type="file" id="upload" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            <label htmlFor="upload">
              <img
                src={profileImage || '/placeholder-profile.png'}
                alt="Profile"
                className="avatar"
              />
            </label>
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>

        <hr />

        {/* Model selector */}
        <form onSubmit={handleSave}>
          {error && <p className="error">{error}</p>}
          <div className="form-group">
            <label>Your current iPhone model</label>
            <select value={model} onChange={e => setModel(e.target.value)} required>
              <option value="">— Select model —</option>
              {options.map((m, i) => (
                <option key={i} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>

        <hr />

        {/* Favorite models placeholder */}
        <div className="favorite-section">
          <div className="section-title">Favorite Model</div>
          <div className="favorite-slider">
            {/* Placeholder: your partner will implement this */}
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
