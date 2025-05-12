import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [options, setOptions] = useState([]);
  const [leftModel, setLeftModel] = useState('');
  const [rightModel, setRightModel] = useState('');
  const [leftSpecs, setLeftSpecs] = useState(null);
  const [rightSpecs, setRightSpecs] = useState(null);
  const [result, setResult] = useState('');

  const getImagePath = (modelName) => {
    if (!modelName || typeof modelName !== 'string') return null;

    const map = {
      "iPhone 11": "11.png",
      "iPhone 11 Pro": "11pro.png",
      "iPhone 11 Pro Max": "11promax.png",
      "iPhone 12": "12.png",
      "iPhone 12 mini": "12mini.png",
      "iPhone 12 Pro": "12pro.png",
      "iPhone 12 Pro Max": "12promax.png",
      "iPhone 13": "13.png",
      "iPhone 13 mini": "13mini.png",
      "iPhone 13 Pro": "13pro.png",
      "iPhone 13 Pro Max": "13promax.png",
      "iPhone 14": "14.png",
      "iPhone 14 Plus": "14plus.png",
      "iPhone 14 Pro": "14pro.png",
      "iPhone 14 Pro Max": "14promax.png",
      "iPhone 15": "15.png",
      "iPhone 15 Plus": "15plus.png",
      "iPhone 15 Pro": "15pro.png",
      "iPhone 15 Pro Max": "15promax.png",
      "iPhone 16": "16.png",
      "iPhone 16 Plus": "16plus.png",
      "iPhone 16 Pro": "16pro.png",
      "iPhone 16 Pro Max": "16promax.png",
      "iPhone SE (2nd generation)": "SE(2nd).png",
      "iPhone SE (3rd generation)": "SE(3rd).png",
      "iPhone XR": "XR.png"
    };

    const file = map[modelName];
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
                    <li key={key}><strong>{key}:</strong> {value}</li>
                  ) : null
                )}
              </ul>
            </div>

            <div className="spec-card">
              <h3>{rightSpecs["Model Name"]}</h3>
              <ul>
                {Object.entries(rightSpecs).map(([key, value]) =>
                  !["_id", "__v", "name", "Model Name"].includes(key) ? (
                    <li key={key}><strong>{key}:</strong> {value}</li>
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
