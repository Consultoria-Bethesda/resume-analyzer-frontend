import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { termsContent } from './content';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="header">
        <img src="/img/logo.jpg" alt="RH Sem Frescura Logo" />
        <h1>Termos de Serviço</h1>
      </div>
      <div className="section">
        <ReactMarkdown>{termsContent}</ReactMarkdown>
        <button onClick={() => navigate('/')} className="back-button">
          Voltar
        </button>
      </div>
    </div>
  );
};

export default TermsOfService;