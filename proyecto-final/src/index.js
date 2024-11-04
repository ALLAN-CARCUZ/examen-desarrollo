import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AppRoutes } from './App'; // Importa las rutas de App
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoutes /> {/* Usa AppRoutes dentro de BrowserRouter */}
    </BrowserRouter>
  </React.StrictMode>
);





