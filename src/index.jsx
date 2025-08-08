// index.js สำหรับ React 18
import React from 'react';
import ReactDOM from 'react-dom/client';  // ดูตรงนี้
import App from './App';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
