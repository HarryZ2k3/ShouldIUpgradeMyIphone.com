import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [options, setOptions] = useState([]);
  const [leftModel, setLeftModel] = useState('');
  const [rightModel, setRightModel] = useState('');
  const [leftSpecs, setLeftSpecs] = useState(null);
  const [rightSpecs, setRightSpecs] = useState(null);
  const [result, setResult] = useState('');
  const getHighlightClass = (key, value, left, right, isLeft) => {
  const fieldsToCompare = ["RAM (GB)", "Battery Life (hrs)"];
  if (!fieldsToCompare.includes(key)) return '';

  const leftVal = parseFloat(left[key]);
  const rightVal = parseFloat(right[key]);
  if (isNaN(leftVal) || isNaN(rightVal)) return '';

  if (isLeft) {
    if (leftVal > rightVal) return 'better';
    if (leftVal < rightVal) return 'worse';
  } else {
    if (rightVal > leftVal) return 'better';
    if (rightVal < leftVal) return 'worse';
  }

  return '';
};

  const getImagePath = (modelName) => {
  if (!modelName || typeof modelName !== 'string') return null;

  const map = {
    "iphone 11": "11.png",
    "iphone 11 pro": "11pro.png",
    "iphone 11 pro max": "11promax.png",
    "iphone 12": "12.png",
    "iphone 12 mini": "12mini.png",
    "iphone 12 pro": "12pro.png",
    "iphone 12 pro max": "12promax.png",
    "iphone 13": "13.png",
    "iphone 13 mini": "13mini.png",
    "iphone 13 pro": "13pro.png",
    "iphone 13 pro max": "13promax.png",
    "iphone 14": "14.png",
    "iphone 14 plus": "14plus.png",
    "iphone 14 pro": "14pro.png",
    "iphone 14 pro max": "14promax.png",
    "iphone 15": "15.png",
    "iphone 15 plus": "15plus.png",
    "iphone 15 pro": "15pro.png",
    "iphone 15 pro max": "15promax.png",
    "iphone 16": "16.png",
    "iphone 16 plus": "16plus.png",
    "iphone 16 pro": "16pro.png",
    "iphone 16 pro max": "16promax.png",
    "iphone se (2nd generation)": "SE2nd.png",
    "iphone se (3rd generation)": "SE3rd.png",
    "iphone xr": "XR.png"
  };

  const normalized = modelName.trim().toLowerCase();
  const file = map[normalized];

  if (!file) console.warn("Image not found for:", modelName);
  return file ? `/images/${file}` : null;
  };


  useEffect(() => {
    fetch('/api/iphones')
      .then(res => res.json())
      .then(data => {
        const names = data.map(item => item["Model Name"]);
        setOptions(names);
        if (names.length > 0) {
          setLeftModel(names[0]);
          setRightModel(names[1] || names[0]);
        }
      })
      .catch(err => {
        console.error("Error fetching models:", err);
      });
  }, []);

  const handleCompare = async () => {
    if (leftModel && rightModel) {
      if (leftModel === rightModel) {
        setResult(`You selected the same model: "${leftModel}". Try picking two different models.`);
        return;
      }

      try {
        const [leftRes, rightRes] = await Promise.all([
          fetch(`/api/iphones/${encodeURIComponent(leftModel)}`),
          fetch(`/api/iphones/${encodeURIComponent(rightModel)}`)
        ]);

        const [leftData, rightData] = await Promise.all([
          leftRes.json(),
          rightRes.json()
        ]);

        setLeftSpecs(leftData);
        setRightSpecs(rightData);
        setResult(`Comparing "${leftModel}" vs "${rightModel}"`);
      } catch (err) {
        console.error('Error comparing phones:', err);
        setResult('Failed to fetch comparison data.');
      }
    } else {
      setResult('Please select both models to compare.');
    }
  };

  return (
    <div className="App">
      <h2><b>Iphone Comparer</b></h2>

      <div className="compare-container">
        <select id="selectLeft" value={leftModel} onChange={(e) => setLeftModel(e.target.value)}>
          {options.map((model, i) =>
            typeof model === 'string' ? (
              <option key={i} value={model}>
                {model}
              </option>
            ) : null
          )}
        </select>

        <button id="BtnCompare" onClick={handleCompare}>Compare</button>

        <select id="selectRight" value={rightModel} onChange={(e) => setRightModel(e.target.value)}>
          {options.map((model, i) =>
            typeof model === 'string' ? (
              <option key={i} value={model}>
                {model}
              </option>
            ) : null
          )}
        </select>
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
            <div className="spec-card">
              <h3>{leftSpecs["Model Name"]}</h3>
              <ul>
                {Object.entries(leftSpecs).map(([key, value]) =>
                  !["_id", "__v", "name", "Model Name"].includes(key) ? (
                    <li key={key} className={getHighlightClass(key, value, leftSpecs, rightSpecs, key === "RAM (GB)")}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ) : null
                )}
              </ul>
            </div>

            <div className="spec-card">
              <h3>{rightSpecs["Model Name"]}</h3>
              <ul>
                {Object.entries(rightSpecs).map(([key, value]) =>
                  !["_id", "__v", "name", "Model Name"].includes(key) ? (
                    <li key={key} className={getHighlightClass(key, value, leftSpecs, rightSpecs, key === "RAM (GB)")}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          </div>
        </>
      )}

      {result && <div className="result-display">{result}</div>}
    </div>
  );
}

export default App;
