import './App.css';
import { useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL;

function App() {
  const [options, setOptions] = useState([]);
  const [leftModel, setLeftModel] = useState('');
  const [rightModel, setRightModel] = useState('');
  const [leftSpecs, setLeftSpecs] = useState(null);
  const [rightSpecs, setRightSpecs] = useState(null);
  const [expanded, setExpanded] = useState([false, false]);

  const toggleSpecExpand = (idx) => {
    setExpanded(prev => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
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

  const getHighlightClass = (key, left, right, isLeft) => {
    const valueA = left[key];
    const valueB = right[key];
    if (valueA == null || valueB == null) return '';

    let isBetter = false;

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      isBetter = valueA > valueB;
    } else if (typeof valueA === 'string') {
      isBetter = valueA.length > valueB.length;
    }

    if (isBetter && isLeft) return 'better';
    if (!isBetter && !isLeft) return 'better';
    if (!isBetter && isLeft) return 'worse';
    if (isBetter && !isLeft) return 'worse';
    return '';
  };

  const getUpgradeVerdict = (left, right) => {
    if (!left || !right) return '';
    let score = 0;

    if (right.specs?.ramGB > left.specs?.ramGB) score++;
    if ((right.specs?.camera?.rear?.match(/\d+/g) || []).length > (left.specs?.camera?.rear?.match(/\d+/g) || []).length) score++;
    if (right.specs?.battery?.lifeHours > left.specs?.battery?.lifeHours) score++;
    if (right.specs?.display?.sizeInches > left.specs?.display?.sizeInches) score++;
    if (right.specs?.weightGrams < left.specs?.weightGrams) score++;

    if (score >= 3) return "✅ Upgrade Recommended";
    if (score === 1 || score === 2) return "⚖️ Minimal Difference";
    return "❌ Downgrade or Not Worth It";
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/iphones`)
      .then(res => res.json())
      .then(data => {
        const names = data.map(item => item.modelName);
        setOptions(names);
        setLeftModel(names[0]);
        setRightModel(names[1] || names[0]);
      })
      .catch(err => console.error("Error fetching models:", err));
  }, []);

  const handleCompare = async () => {
    if (!leftModel || !rightModel || leftModel === rightModel) return;

    try {
      const [leftRes, rightRes] = await Promise.all([
        fetch(`${API_BASE}/api/iphones/${encodeURIComponent(leftModel)}`),
        fetch(`${API_BASE}/api/iphones/${encodeURIComponent(rightModel)}`)
      ]);
      const [leftData, rightData] = await Promise.all([leftRes.json(), rightRes.json()]);
      setLeftSpecs(leftData);
      setRightSpecs(rightData);
    } catch (err) {
      console.error("Compare failed:", err);
    }
  };

  const primaryFields = [
    { key: "ramGB", label: "RAM (GB)" },
    { key: "processor", label: "Processor" },
    { key: "battery.lifeHours", label: "Battery Life (hrs)" },
    { key: "camera.rear", label: "Rear Camera" },
    { key: "storageOptions", label: "Storage Options" },
    { key: "display.sizeInches", label: "Display Size (inches)" },
    { key: "weightGrams", label: "Weight (g)" },
    { key: "priceUSD", label: "Price (USD)" }
  ];

  const getFieldValue = (specs, path) => {
    return path.split('.').reduce((obj, part) => obj?.[part], specs?.specs || specs);
  };

  return (
    <div className="App">
      <h2><b>Should I Upgrade My iPhone</b></h2>

      <div className="compare-container">
        <div className="dropdown-group">
          <label>My Current iPhone</label>
          <select value={leftModel} onChange={e => setLeftModel(e.target.value)}>
            {options.map((model, i) => <option key={i} value={model}>{model}</option>)}
          </select>
        </div>

        <button id="BtnCompare" onClick={handleCompare}>Compare</button>

        <div className="dropdown-group">
          <label>iPhone I'm Considering</label>
          <select value={rightModel} onChange={e => setRightModel(e.target.value)}>
            {options.map((model, i) => <option key={i} value={model}>{model}</option>)}
          </select>
        </div>
      </div>

      {leftSpecs && rightSpecs && (
        <>
          <div className="image-compare-wrapper">
            <img src={getImagePath(leftSpecs.modelName)} alt={leftSpecs.modelName} className="compare-image" />
            <div className="vertical-line" />
            <img src={getImagePath(rightSpecs.modelName)} alt={rightSpecs.modelName} className="compare-image" />
          </div>

          <div className="specs-grid">
            {[leftSpecs, rightSpecs].map((specs, idx) => (
              <div className="spec-card" key={idx}>
                <h3>{specs.modelName}</h3>
                <ul>
                  {primaryFields.map(({ key, label }) => {
                    const value = getFieldValue(specs, key);
                    const formatted = Array.isArray(value) ? value.join(', ') : value;
                    return (
                      <li key={key} className={getHighlightClass(key, leftSpecs.specs, rightSpecs.specs, idx === 0)}>
                        <strong>{label}:</strong> {formatted}
                      </li>
                    );
                  })}
                </ul>

                <div className="expand-toggle" onClick={() => toggleSpecExpand(idx)}>
                  {expanded[idx] ? "▲ Hide full specs" : "▼ Show more details"}
                </div>

                <div className={`spec-details ${expanded[idx] ? 'open' : ''}`}>
                  <ul>
                    {Object.entries(specs.specs || {}).map(([key, value]) =>
                      !primaryFields.some(f => f.key.includes(key)) ? (
                        <li key={key}><strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}</li>
                      ) : null
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="verdict-display">{getUpgradeVerdict(leftSpecs, rightSpecs)}</div>
        </>
      )}
    </div>
  );
}

export default App;
