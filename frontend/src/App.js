// File: src/App.js

import React, { useEffect, useState } from 'react';
import './App.css';
import Cookies from 'js-cookie';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate
} from 'react-router-dom';

import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ProfilePage from './ProfilePage';

const API_BASE = process.env.REACT_APP_API_URL;

// — Helper: chronological index for model comparison —
function getModelYearIndex(name) {
  const order = [
    "iPhone SE (2nd generation)", "iPhone SE (3rd generation)", "iPhone XR",
    "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
    "iPhone 12", "iPhone 12 mini", "iPhone 12 Pro", "iPhone 12 Pro Max",
    "iPhone 13", "iPhone 13 mini", "iPhone 13 Pro", "iPhone 13 Pro Max",
    "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
    "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
    "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max"
  ];
  return order.indexOf(name);
}

// — Helper: highlight 'better' vs 'worse' —
function getHighlightClass(key, left, right, isLeft) {
  const fields = ["RAM (GB)", "Battery Life (hrs)", "Storage options", "Rear Camera Setup"];
  if (!fields.includes(key)) return '';
  const lval = left[key], rval = right[key];
  if (!lval || !rval) return '';

  const li = getModelYearIndex(left["Model Name"]);
  const ri = getModelYearIndex(right["Model Name"]);
  if (li === -1 || ri === -1) return '';

  const newerIsLeft = li > ri;
  let betterSide = null;

  if (["RAM (GB)", "Battery Life (hrs)"].includes(key)) {
    const l = parseFloat(lval), r = parseFloat(rval);
    if (!isNaN(l) && !isNaN(r)) betterSide = l > r ? "left" : r > l ? "right" : null;
  } else if (key === "Storage options") {
    const l = (lval.match(/\d+GB/g) || []).length;
    const r = (rval.match(/\d+GB/g) || []).length;
    betterSide = l > r ? "left" : r > l ? "right" : null;
  } else { // Rear Camera Setup
    const l = (lval.match(/\d+/g) || []).length;
    const r = (rval.match(/\d+/g) || []).length;
    betterSide = l > r ? "left" : r > l ? "right" : null;
  }
  if (!betterSide) return '';

  const isNewerSide = isLeft === newerIsLeft;
  if ((betterSide === "left" && isLeft && isNewerSide) ||
      (betterSide === "right" && !isLeft && !isNewerSide)) {
    return 'better';
  }
  if ((betterSide === "left" && isLeft && !isNewerSide) ||
      (betterSide === "right" && !isLeft && isNewerSide)) {
    return 'worse';
  }
  return '';
}

// — Helper: upgrade verdict —
function getUpgradeVerdict(left, right) {
  if (!left || !right) return '';
  const fields = [
    "RAM (GB)", "Battery Life (hrs)", "Rear Camera Setup",
    "Display Size (inches)", "Weight (g)"
  ];
  let score = 0;
  fields.forEach(key => {
    const a = parseFloat(right[key]), b = parseFloat(left[key]);
    if (!isNaN(a) && !isNaN(b)) {
      if (key === "Weight (g)" ? a < b : a > b) score++;
    } else if (key === "Rear Camera Setup") {
      const c1 = (left[key]?.match(/\d+/g) || []).length;
      const c2 = (right[key]?.match(/\d+/g) || []).length;
      if (c2 > c1) score++;
    }
  });
  if (score >= 3) return "✅ Upgrade Recommended";
  if (score >= 1) return "⚖️ Minimal Difference";
  return "❌ Downgrade or Not Worth It";
}

// — Helper: model image path —
function getImagePath(modelName) {
  const map = {
    "iphone 11": "11.png", "iphone 11 pro": "11pro.png", "iphone 11 pro max": "11promax.png",
    "iphone 12": "12.png", "iphone 12 mini": "12mini.png", "iphone 12 pro": "12pro.png", "iphone 12 pro max": "12promax.png",
    "iphone 13": "13.png", "iphone 13 mini": "13mini.png", "iphone 13 pro": "13pro.png", "iphone 13 pro max": "13promax.png",
    "iphone 14": "14.png", "iphone 14 plus": "14plus.png", "iphone 14 pro": "14pro.png", "iphone 14 pro max": "14promax.png",
    "iphone 15": "15.png", "iphone 15 plus": "15plus.png", "iphone 15 pro": "15pro.png", "iphone 15 pro max": "15promax.png",
    "iphone 16": "16.png", "iphone 16 plus": "16plus.png", "iphone 16 pro": "16pro.png", "iphone 16 pro max": "16promax.png",
    "iphone se (2nd generation)": "SE2nd.png", "iphone se (3rd generation)": "SE3rd.png", "iphone xr": "XR.png"
  };
  const key = modelName.trim().toLowerCase();
  return map[key] ? `/images/${map[key]}` : null;
}

// — HomePage: the main comparator —
function HomePage() {
  const [options, setOptions]       = useState([]);
  const [leftModel, setLeftModel]   = useState('');
  const [rightModel, setRightModel] = useState('');
  const [leftSpecs, setLeftSpecs]   = useState(null);
  const [rightSpecs, setRightSpecs] = useState(null);
  const [result, setResult]         = useState('');
  const [expanded, setExpanded]     = useState([false, false]);

  useEffect(() => {
    const savedL = Cookies.get('leftModel');
    const savedR = Cookies.get('rightModel');
    fetch(`${API_BASE}/api/iphones`)
      .then(res => res.json())
      .then(data => {
        const names = data.map(i => i['Model Name']);
        setOptions(names);
        if (names.length) {
          setLeftModel(savedL && names.includes(savedL) ? savedL : names[0]);
          setRightModel(savedR && names.includes(savedR) ? savedR : names[1] || names[0]);
        }
      })
      .catch(console.error);
  }, []);

  const handleCompare = async () => {
    if (leftModel === rightModel) {
      setResult(`You selected the same model: "${leftModel}".`);
      return;
    }
    try {
      const [lRes, rRes] = await Promise.all([
        fetch(`${API_BASE}/api/iphones/${encodeURIComponent(leftModel)}`),
        fetch(`${API_BASE}/api/iphones/${encodeURIComponent(rightModel)}`)
      ]);
      const [lData, rData] = await Promise.all([lRes.json(), rRes.json()]);
      setLeftSpecs(lData);
      setRightSpecs(rData);
      setResult(`Comparing "${leftModel}" vs "${rightModel}"`);
    } catch (e) {
      console.error(e);
      setResult('Failed to fetch comparison data.');
    }
  };

  const toggleSpecExpand = idx => {
    setExpanded(prev => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  return (
    <div>
      <h2>Should I Upgrade My iPhone</h2>

      <div className="compare-container">
        <div className="dropdown-group">
          <label htmlFor="selectLeft">My Current iPhone</label>
          <select
            id="selectLeft"
            value={leftModel}
            onChange={e => {
              setLeftModel(e.target.value);
              Cookies.set('leftModel', e.target.value, { expires: 7 });
            }}
          >
            {options.map((m, i) => (
              <option key={i} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleCompare}>
          Compare
        </button>

        <div className="dropdown-group">
          <label htmlFor="selectRight">iPhone I'm Considering</label>
          <select
            id="selectRight"
            value={rightModel}
            onChange={e => {
              setRightModel(e.target.value);
              Cookies.set('rightModel', e.target.value, { expires: 7 });
            }}
          >
            {options.map((m, i) => (
              <option key={i} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {leftSpecs && rightSpecs && (
        <>
          <div className="image-compare-wrapper">
            <img
              src={getImagePath(leftSpecs["Model Name"])}
              alt={leftSpecs["Model Name"]}
              className="compare-image"
            />
            <div className="vertical-line" />
            <img
              src={getImagePath(rightSpecs["Model Name"])}
              alt={rightSpecs["Model Name"]}
              className="compare-image"
            />
          </div>

          <div className="specs-grid">
            {[leftSpecs, rightSpecs].map((s, idx) => (
              <div className="spec-card" key={idx}>
                <h3>{s["Model Name"]}</h3>
                <ul>
                  {Object.entries(s).map(([k, v]) =>
                    ["RAM (GB)", "Processor", "Battery Life (hrs)",
                     "Rear Camera Setup", "Storage options",
                     "Display Size (inches)", "Weight (g)", "Price (USD)"]
                    .includes(k) ? (
                      <li
                        key={k}
                        className={getHighlightClass(k, leftSpecs, rightSpecs, idx === 0)}
                      >
                        <strong>{k}:</strong> {v}
                      </li>
                    ) : null
                  )}
                </ul>

                <div className="expand-toggle" onClick={() => toggleSpecExpand(idx)}>
                  {expanded[idx] ? "▲ Hide full specs" : "▼ Show more details"}
                </div>

                <div className={`spec-details ${expanded[idx] ? 'open' : ''}`}>
                  <ul>
                    {Object.entries(s).map(([k, v]) =>
                      !["_id","__v","name","Model Name","RAM (GB)","Processor",
                        "Battery Life (hrs)","Rear Camera Setup","Storage options",
                        "Display Size (inches)","Weight (g)","Price (USD)"]
                      .includes(k) && !k.toLowerCase().startsWith("field") ? (
                        <li key={k}><strong>{k}:</strong> {v}</li>
                      ) : null
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {result && <div className="result-display">{result}</div>}
          <div className="verdict-display">
            {getUpgradeVerdict(leftSpecs, rightSpecs)}
          </div>
        </>
      )}
    </div>
  );
}

// — AppContent: handles auth, theme, logout & routing —
function AppContent() {
  const [theme, setTheme] = useState(() => Cookies.get('theme') || 'light');
  const [user, setUser]   = useState(null);
  const navigate          = useNavigate();

  // Apply theme
  useEffect(() => {
    document.body.classList.remove('theme-light','theme-dark','theme-sakura');
    document.body.classList.add(`theme-${theme}`);
    Cookies.set('theme', theme, { expires: 365 });
  }, [theme]);

  // Fetch current user
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(u => setUser(u))
      .catch(() => setUser(null));
  }, []);

  // Logout handler
  const handleLogout = async () => {
    await fetch(`${API_BASE}/auth/logout`, { credentials: 'include' });
    setUser(null);
    navigate('/login');
  };

  // Cycle theme
  const cycleTheme = () => {
    setTheme(prev =>
      prev === 'light' ? 'dark'
      : prev === 'dark'  ? 'sakura'
      : 'light'
    );
  };

  return (
    <div className="App">
      <header className="site-header">
        <Link className="btn btn-ghost" to="/">Home</Link>

        {user ? (
          <>
            <span className="header-user">Logged in as {user.email}</span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="btn btn-ghost" to="/login">Login</Link>
            <Link className="btn btn-ghost" to="/register">Register</Link>
          </>
        )}

        <Link className="btn btn-ghost" to="/profile">Profile</Link>

        <button className="btn btn-primary theme-toggle-btn" onClick={cycleTheme}>
          Switch to {theme === 'light'
            ? 'Dark'
            : theme === 'dark'
            ? 'Sakura'
            : 'Light'} Mode
        </button>
      </header>

      <main>
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile"  element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}

// — App: wraps everything in the Router —
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
