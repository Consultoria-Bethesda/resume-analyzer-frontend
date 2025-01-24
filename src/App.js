import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import AuthPage from './components/Auth/AuthPage';
import CheckoutPage from './components/Checkout/CheckoutPage';
import { AuthProvider, useAuth } from './services/auth';
import GoogleCallback from './components/Auth/GoogleCallback';
import axios from 'axios';
import './App.css';
import TermsOfService from './components/Legal/TermsOfService';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import VerifyEmail from './components/Auth/VerifyEmail';
import TestAnalysis from './components/TestAnalysis';

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      // Verifica se está em processo de autenticação do Google
      if (location.pathname.includes('/auth/google')) {
        return;
      }

      const params = new URLSearchParams(location.search);
      const tokenFromUrl = params.get('token');

      if (tokenFromUrl) {
        console.log('Token encontrado na URL em ProtectedRoute');
        sessionStorage.setItem('authToken', tokenFromUrl);
        localStorage.setItem('authToken', tokenFromUrl);
        login({ token: tokenFromUrl });
        navigate(location.pathname, { replace: true });
        return;
      }

      if (!token) {
        console.log('Token não encontrado, redirecionando para login');
        navigate('/login', {
          replace: true,
          state: { from: location.pathname }
        });
      }
    };

    checkAuth();
  }, [location, navigate, login, token]);

  if (!token && !location.search.includes('token=')) {
    return null;
  }

  return children;
};

const MainContent = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [file, setFile] = useState(null);
  const [jobLinks, setJobLinks] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isVerifyingCredits, setIsVerifyingCredits] = useState(true);

  // Função para realizar nova análise
  const handleNewAnalysis = () => {
    resetForm();
    setAnalysis(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.reload(); // Força o refresh da página
  };

  // Função para verificar créditos
  const verifyCredits = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!token) {
        logout();
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/payment/verify-credits`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setCredits(response.data.remaining_analyses);
      setIsVerifyingCredits(false);
    } catch (err) {
      console.error('Erro ao verificar créditos:', err);
      if (err.response?.status === 401) {
        logout();
      }
      setIsVerifyingCredits(false);
    }
  }, [logout]);

  useEffect(() => {
    verifyCredits();
  }, [verifyCredits]);

  // Renderização condicional enquanto verifica créditos
  if (isVerifyingCredits) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verificando suas informações...</p>
      </div>
    );
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...jobLinks];
    newLinks[index] = value;
    setJobLinks(newLinks);
  };

  const addLink = (e) => {
    e.preventDefault();
    if (jobLinks.length < 2) {
      setJobLinks(prevLinks => [...prevLinks, '']);
    }
  };

  const handleLogout = () => {
    navigate('/logout');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!file) {
      setError('Por favor, selecione um arquivo PDF.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      const formData = new FormData();
      formData.append('file', file); // Usando a variável file ao invés de selectedFile
      jobLinks.forEach(link => {
        if (link) formData.append('job_links', link);
      });

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/cv/analyze`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${cleanToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data) {
        setAnalysis(response.data);
        await verifyCredits();
        resetForm();
      }
    } catch (err) {
      console.error('Erro:', err.response?.data || err.message);
      handleAnalysisError(err);
    } finally {
      setLoading(false);
    }
  };

  // Função para resetar o formulário
  const resetForm = () => {
    setFile(null);
    setJobLinks(['']);
    setError(null);
    if (document.getElementById('curriculo')) {
      document.getElementById('curriculo').value = '';
    }
  };

  const CreditsDisplay = () => (
    <div className="credits-display">
      {typeof credits === 'number' ? (
        <>
          <p>Créditos disponíveis: {credits}</p>
          {credits === 0 && (
            <button
              onClick={() => navigate('/checkout')}
              className="buy-credits-button"
            >
              Comprar Créditos
            </button>
          )}
        </>
      ) : (
        <p>Carregando créditos...</p>
      )}
    </div>
  );

  // Função para tratar erros de análise
  const handleAnalysisError = (err) => {
    if (err.response?.status === 401) {
      setError('Sessão expirada. Por favor, faça login novamente.');
      logout();
    } else if (err.response?.status === 402) {
      setError('Créditos insuficientes. Por favor, adquira mais créditos.');
      navigate('/checkout');
    } else if (err.response?.data?.error) {
      setError(err.response.data.error);
    } else {
      setError('Erro ao analisar currículo. Por favor, tente novamente.');
    }
  };

  return (
    <div className="container">
      <div className="header">
        <img src="/img/logo.jpg" alt="RH Super Sincero Logo" />
        <h1>CV Sem Frescura</h1>
        <button onClick={handleLogout} className="logout-button">Sair</button>
      </div>

      <CreditsDisplay />
      
      {analysis ? (
        <>
          <TestAnalysis analysis={analysis} />
          <div className="new-analysis-container">
            <button onClick={handleNewAnalysis} className="new-analysis-button">
              Nova Análise
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="section">
            <h2>Bem-vindo ao CV Sem Frescura</h2>
            <p>Nossa plataforma foi desenvolvida para ajudar você a otimizar seu currículo para vagas específicas.</p>
          </div>

          <div className="section">
            <h3>Como funciona:</h3>
            <ol>
              <li>Faça upload do seu currículo em formato PDF</li>
              <li>Adicione até 2 links de vagas que deseja se candidatar</li>
              <li>Nossa IA analisará seu currículo em relação às vagas</li>
              <li>Receba recomendações personalizadas para aumentar suas chances</li>
            </ol>
          </div>

          <div className="section">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="curriculo">Upload do Currículo (PDF):</label>
                <input
                  type="file"
                  id="curriculo"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="file-input"
                />
              </div>

              {jobLinks.map((link, index) => (
                <div key={index} className="form-group">
                  <label htmlFor={`jobLink${index}`}>
                    Link da Vaga {index + 1}:
                  </label>
                  <input
                    type="url"
                    id={`jobLink${index}`}
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    placeholder="Cole aqui o link da vaga"
                    className="url-input"
                  />
                </div>
              ))}

              {jobLinks.length < 2 && (
                <button
                  type="button"
                  onClick={addLink}
                  className="add-link-button"
                >
                  + Adicionar outro link de vaga
                </button>
              )}

              {error && <div className="error-message">{error}</div>}

              <button
                type="submit"
                disabled={loading || credits === 0}
                className="submit-button"
              >
                {loading ? 'Analisando...' : 'Analisar Currículo'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

function App() {
  return (
    <div className="app-container">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/logout" element={<LogoutHandler />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainContent />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;

const LogoutHandler = () => {
  const { logout } = useAuth();
  
  useEffect(() => {
    logout();
  }, [logout]);
  
  return null;
};
