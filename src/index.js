import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Crear el root para React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizar la aplicación
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
