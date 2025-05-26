// src/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  // Email/password login
  const handleEmailLogin = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || 'Login failed');
      }
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  // Google OAuth
  const handleGoogle = () => {
    window.location.href = '/auth/google';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>

        {error && <p className="error">{error}</p>}

        <button className="btn btn-google" onClick={handleGoogle}>
          Continue with Google
        </button>

        <div className="divider"><span>OR</span></div>

        <form onSubmit={handleEmailLogin}>
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

          <button type="submit" className="btn btn-primary">Log In</button>
        </form>
      </div>
    </div>
);
}
