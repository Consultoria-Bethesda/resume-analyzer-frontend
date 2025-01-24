import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './services/auth';

// Verificação das variáveis de ambiente após os imports
if (!process.env.REACT_APP_BACKEND_URL) {
  console.error('REACT_APP_BACKEND_URL não está definido! Verifique os arquivos .env');
}

console.log('Environment:', process.env.NODE_ENV);
console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
