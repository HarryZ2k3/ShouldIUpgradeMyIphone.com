// File: src/App.js
import './App.css';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const API_BASE = process.env.REACT_APP_API_URL;

function App() {
  // --- THEME SETUP ---
  const [theme, setTheme] = useState(() => Cookies.get('theme') || 'light');

  // 2) Apply theme class to <body> and persist to cookie
  useEffect(() => {
    // remove every possible theme class before applying the new one
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-sakura');
    document.body.classList.add(`theme-${theme}`);
    Cookies.set('theme', theme, { expires: 365 });
  }, [theme]);

  const [options, setOptions] = useState([]);
  const [leftModel, setLeftModel] = useState('');
  const [rightModel, setRightModel] = useState('');
  const [leftSpecs, setLeftSpecs] = useState(null);
  const [rightSpecs, setRightSpecs] = useState(null);
  const [result, setResult] = useState('');
  const [expanded, setExpanded] = useState([false, false]);

  const toggleSpecExpand = (idx) => {
    setExpanded((prev) => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  const getModelYearIndex = (name) => {
    const order = [
      "iPhone SE (2nd generation)", "iPhone SE (3rd generation)", "iPhone XR",
      "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max", "iPhone 12", "iPhone 12 mini",
      "iPhone 12 Pro", "iPhone 12 Pro Max", "iPhone 13", "iPhone 13 mini", "iPhone 13 Pro",
      "iPhone 13 Pro Max", "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
      "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 16",
      "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max"
    ];
    return order.indexOf(name);
  };

  const getHighlightClass = (key, value, left, right, isLeft) => {
    const fieldsToCompare = ["RAM (GB)", "Battery Life (hrs)", "Storage options", "Rear Camera Setup"];
    if (!fieldsToCompare.includes(key)) return '';

    const leftVal = left[key], rightVal = right[key];
    if (!leftVal || !rightVal) return '';

    const leftIndex = getModelYearIndex(left["Model Name"]);
    const rightIndex = getModelYearIndex(right["Model Name"]);
    if (leftIndex === -1 || rightIndex === -1) return '';

    const newerIsLeft = leftIndex > rightIndex;
    let betterSide = null;

    if (["RAM (GB)", "Battery Life (hrs)"].includes(key)) {
      const l = parseFloat(leftVal), r = parseFloat(rightVal);
      if (isNaN(l) || isNaN(r)) return '';
      betterSide = l > r ? "left" : r > l ? "right" : null;
    } else if (key === "Storage options") {
      const l = (leftVal.match(/\d+GB/g) || []).length;
      const r = (rightVal.match(/\d+GB/g) || []).length;
      betterSide = l > r ? "left" : r > l ? "right" : null;
    } else if (key === "Rear Camera Setup") {
      const l = (leftVal.match(/\d+/g) || []).length;
      const r = (rightVal.match(/\d+/g) || []).length;
      betterSide = l > r ? "left" : r > l ? "right" : null;
    }

    const isNewer = isLeft === newerIsLeft;
    if (!betterSide) return '';
    if ((betterSide === "left" && isLeft && isNewer) || (betterSide === "right" && !isLeft && !isNewer)) return 'better';
    if ((betterSide === "left" && isLeft && !isNewer) || (betterSide === "right" && !isLeft && isNewer)) return 'worse';
    return '';
  };

  const getUpgradeVerdict = (left, right) => {
    if (!left || !right) return '';

    const compareFields = [
      "RAM (GB)", "Battery Life (hrs)", "Rear Camera Setup", "Display Size (inches)", "Weight (g)"
    ];

    let score = 0;
    compareFields.forEach((key) => {
      const a = parseFloat(right[key]);
      const b = parseFloat(left[key]);
      if (!isNaN(a) && !isNaN(b)) {
        if (key === "Weight (g)") {
          if (a < b) score++; // Lighter is better
        } else {
          if (a > b) score++; // Bigger/higher is better
        }
      } else if (key === "Rear Camera Setup") {
        const c1 = (left[key]?.match(/\d+/g) || []).length;
        const c2 = (right[key]?.match(/\d+/g) || []).length;
        if (c2 > c1) score++;
      }
    });

    if (score >= 3) return "✅ Upgrade Recommended";
    if (score === 1 || score === 2) return "⚖️ Minimal Difference";
    return "❌ Downgrade or Not Worth It";
  };

  const getImagePath = (modelName) => {
    const map = {
      "iphone 11": "11.png", "iphone 11 pro": "11pro.png", "iphone 11 pro max": "11promax.png",
      "iphone 12": "12.png", "iphone 12 mini": "12mini.png", "iphone 12 pro": "12pro.png", "iphone 12 pro max": "12promax.png",
      "iphone 13": "13.png", "iphone 13 mini": "13mini.png", "iphone 13 pro": "13pro.png", "iphone 13 pro max": "13promax.png",
      "iphone 14": "14.png", "iphone 14 plus": "14plus.png", "iphone 14 pro": "14pro.png", "iphone 14 pro max": "14promax.png",
      "iphone 15": "15.png", "iphone 15 plus": "15plus.png", "iphone 15 pro": "15pro.png", "iphone 15 pro max": "15promax.png",
      "iphone 16": "16.png", "iphone 16 plus": "16plus.png", "iphone 16 pro": "16pro.png", "iphone 16 pro max": "16promax.png",
      "iphone se (2nd generation)": "SE2nd.png", "iphone se (3rd generation)": "SE3rd.png", "iphone xr": "XR.png"
    };
    const normalized = modelName.trim().toLowerCase();
    return map[normalized] ? `/images/${map[normalized]}` : null;
  };

  useEffect(() => {
    const savedLeft = Cookies.get('leftModel');
    const savedRight = Cookies.get('rightModel');

    fetch(`${API_BASE}/api/iphones`)
      .then(res => res.json())
      .then(data => {
        const names = data.map(item => item["Model Name"]);
        setOptions(names);
        if (names.length > 0) {
          setLeftModel(savedLeft && names.includes(savedLeft) ? savedLeft : names[0]);
          setRightModel(savedRight && names.includes(savedRight) ? savedRight : names[1] || names[0]);
        }
      })
      .catch(err => console.error("Error fetching models:", err));
  }, []);

  const handleCompare = async () => {
    if (leftModel === rightModel) {
      setResult(`You selected the same model: "${leftModel}". Try picking two different models.`);
      return;
    }

    try {
      const [leftRes, rightRes] = await Promise.all([
        fetch(`${API_BASE}/api/iphones/${encodeURIComponent(leftModel)}`),
        fetch(`${API_BASE}/api/iphones/${encodeURIComponent(rightModel)}`)
      ]);
      const [leftData, rightData] = await Promise.all([leftRes.json(), rightRes.json()]);
      setLeftSpecs(leftData);
      setRightSpecs(rightData);
      setResult(`Comparing "${leftModel}" vs "${rightModel}"`);
    } catch (err) {
      console.error('Error comparing phones:', err);
      setResult('Failed to fetch comparison data.');
    }
  };

  return (
    <div className="App">
      {/* Theme toggle button */}
      <button
        className="theme-toggle-btn"
        onClick={() =>
          setTheme(prev =>
            prev === 'light'
              ? 'dark'
              : prev === 'dark'
              ? 'sakura'
              : 'light'
          )
        }
      >
        Switch to {theme === 'light'
          ? 'Dark'
          : theme === 'dark'
          ? 'Sakura'
          : 'Light'} Mode
      </button>

      <h2><b>Should I Upgrade My iPhone</b></h2>

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
            {options.map((model, i) => (
              <option key={i} value={model}>{model}</option>
            ))}
          </select>
        </div>

        <button id="BtnCompare" onClick={handleCompare}>Compare</button>

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
            {options.map((model, i) => (
              <option key={i} value={model}>{model}</option>
            ))}
          </select>
        </div>
      </div>

      {leftSpecs && rightSpecs && (
        <>
          <div className="image-compare-wrapper">
            <img src={getImagePath(leftSpecs["Model Name"])} alt={leftSpecs["Model Name"]} className="compare-image" />
            <div className="vertical-line" />
            <img src={getImagePath(rightSpecs["Model Name"])} alt={rightSpecs["Model Name"]} className="compare-image" />
          </div>

          <div className="specs-grid">
            {[leftSpecs, rightSpecs].map((specs, idx) => (
              <div className="spec-card" key={idx}>
                <h3>{specs["Model Name"]}</h3>
                <ul>
                  {Object.entries(specs).map(([key, value]) =>
                    [
                      "RAM (GB)", "Processor", "Battery Life (hrs)", "Rear Camera Setup",
                      "Storage options", "Display Size (inches)", "Weight (g)", "Price (USD)"
                    ].includes(key) ? (
                      <li key={key} className={getHighlightClass(key, value, leftSpecs, rightSpecs, idx === 0)}>
                        <strong>{key}:</strong> {value}
                      </li>
                    ) : null
                  )}
                </ul>

                <div className="expand-toggle" onClick={() => toggleSpecExpand(idx)}>
                  {expanded[idx] ? "▲ Hide full specs" : "▼ Show more details"}
                </div>

                <div className={`spec-details ${expanded[idx] ? 'open' : ''}`}>
                  <ul>
                    {Object.entries(specs).map(([key, value]) =>
                      ![
                        "_id", "__v", "name", "Model Name", "RAM (GB)", "Processor",
                        "Battery Life (hrs)", "Rear Camera Setup", "Storage options",
                        "Display Size (inches)", "Weight (g)", "Price (USD)"
                      ].includes(key) && !key.toLowerCase().startsWith("field") ? (
                        <li key={key}><strong>{key}:</strong> {value}</li>
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

export default App;
