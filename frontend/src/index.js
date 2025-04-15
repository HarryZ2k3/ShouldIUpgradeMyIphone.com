// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Your full-page gradient + layout styles
import App from './App'; // Your main iPhone comparison component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
