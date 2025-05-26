// src/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  const handleEmailSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Registration failed');
      }
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogle = () => {
    // Redirect browser to backend Google OAuth endpoint
    window.location.href = '/auth/google';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create an account</h2>

        {error && <p className="error">{error}</p>}

        <button className="btn btn-google" onClick={handleGoogle}>
          Continue with Google
        </button>

        <div className="divider"><span>OR</span></div>

        <form onSubmit={handleEmailSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary">Register with Email</button>
        </form>
      </div>
    </div>
  );
}
