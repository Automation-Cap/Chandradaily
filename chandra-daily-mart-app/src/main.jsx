import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global error logger for mobile debugging
window.onerror = function(msg, url, lineNo, columnNo, error) {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.width = '100%';
  div.style.zIndex = '99999';
  div.style.background = 'red';
  div.style.color = 'white';
  div.style.padding = '10px';
  div.style.fontSize = '12px';
  div.style.wordBreak = 'break-all';
  div.innerHTML = `Error: ${msg}<br>at ${url}:${lineNo}:${columnNo}`;
  document.body.appendChild(div);
  return false;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
