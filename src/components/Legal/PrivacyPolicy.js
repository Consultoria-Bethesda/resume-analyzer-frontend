import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { privacyContent } from './content';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="header">
        <img src="/img/logo.jpg" alt="RH Sem Frescura Logo" />
        <h1>Política de Privacidade</h1>
      </div>
      <div className="section">
        <ReactMarkdown>{privacyContent}</ReactMarkdown>
        <button onClick={() => navigate('/')} className="back-button">
          Voltar
        </button>
      </div>
    </div>
  );
};

export default PrivacyPolicy;