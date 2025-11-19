import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rota padrão para o app */}
        <Route path="/*" element={<App />} />

        {/* Rota específica para reset de senha */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
