import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Your global styles with Tailwind setup
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);