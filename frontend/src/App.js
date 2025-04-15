import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [options, setOptions] = useState([]);
  const [leftModel, setLeftModel] = useState('');
  const [rightModel, setRightModel] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    fetch('/api/iphones')
      .then(res => res.json())
      .then(data => {
        const names = data.map(item => item.name);
        setOptions(names);
        if (names.length > 0) {
          setLeftModel(names[0]);
          setRightModel(names[1] || names[0]);
        }
      })
      .catch(err => console.error("Error fetching models:", err));
  }, []);

  const handleCompare = () => {
    if (leftModel && rightModel) {
      if (leftModel === rightModel) {
        setResult(`You selected the same model: "${leftModel}". Try picking two different models.`);
      } else {
        setResult(`Comparing "${leftModel}" vs "${rightModel}"...`);
        // 🔜 You can fetch detailed specs here in the future
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
          {options.map((model, i) => (
            <option key={i} value={model}>
              {model.charAt(0).toUpperCase() + model.slice(1)}
            </option>
          ))}
        </select>

        <button id="BtnCompare" onClick={handleCompare}>Compare</button>

        <select id="selectRight" value={rightModel} onChange={(e) => setRightModel(e.target.value)}>
          {options.map((model, i) => (
            <option key={i} value={model}>
              {model.charAt(0).toUpperCase() + model.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="custom-search">
        <input type="text" placeholder="Search for model name..." />
        <button>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <polygon points="6,4 20,12 6,20" fill="grey" />
          </svg>
        </button>
      </div>

      <div id="separator" />

      {result && <div className="result-display">{result}</div>}
    </div>
  );
}

export default App;
