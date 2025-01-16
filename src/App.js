import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import AuthPage from './components/Auth/AuthPage';
import CheckoutPage from './components/Checkout/CheckoutPage';
import { AuthProvider, useAuth } from './services/auth';
import axios from 'axios';
import './App.css';
import TermsOfService from './components/Legal/TermsOfService';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const location = useLocation();
  
  if (!token && !location.search.includes('token=')) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const MainContent = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [file, setFile] = useState(null);
  const [jobLinks, setJobLinks] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    console.log('AppContent montado');
    console.log('URL atual:', window.location.href);
    console.log('Query params:', window.location.search);
    
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    console.log('Token encontrado:', token);
    
    if (token) {
        console.log('Processando token...');
        localStorage.setItem('authToken', token);
        login({ token });
        navigate('/', { replace: true });
        console.log('Redirecionamento completo');
        checkCredits(); // Adicione esta linha
    }
}, [navigate, login]);

  useEffect(() => {
    checkCredits();
  }, []);

  const checkCredits = async () => {
    try {
        const token = localStorage.getItem('authToken');
        console.log('Token:', token); // Adicione este log
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        console.log('Backend URL:', backendUrl); // Log adicionado aqui
        console.log('Verificando créditos...');
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/payment/verify-credits`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json' // Adicione este header
            }
        });
        console.log('Resposta da verificação de créditos:', response.data);
        setCredits(response.data.remaining_analyses);
    } catch (err) {
        console.error('Erro ao verificar créditos:', err);
        console.error('Resposta do erro:', err.response?.data); // Adicione este log
    }
};

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
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecione um currículo.');
      return;
    }

    // Limpar links vazios
    const validLinks = jobLinks.filter(link => link && link.trim());

    // Validar links de vagas
    if (validLinks.length === 0) {
      setError('Por favor, adicione pelo menos um link de vaga para análise.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('file', file);
    validLinks.forEach((link, index) => {
      formData.append(`job_links`, link);
    });
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/cv/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        console.log('Resposta do servidor:', response.data);
        setAnalysis(response.data);
        await checkCredits();
      } else {
        setError('Resposta vazia do servidor');
      }
    } catch (err) {
      console.error('Erro detalhado:', err.response?.data || err.message);
      
      if (err.response?.status === 402) {
        setError(
          <div className="credits-error">
            <p>Créditos insuficientes. Por favor, adquira mais créditos.</p>
            <button 
              onClick={() => navigate('/checkout')}
              className="buy-credits-button"
            >
              Comprar Créditos
            </button>
          </div>
        );
      } else {
        setError(`Erro ao analisar o currículo: ${err.response?.data?.detail || err.message}`);
      }
    } finally {
      setLoading(false);
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

  return (
    <div className="container">
      <div className="header">
        <img src="/img/logo.jpg" alt="RH Super Sincero Logo" />
        <h1>CV Sem Frescura</h1>
        <button onClick={handleLogout} className="logout-button">Sair</button>
      </div>

      <CreditsDisplay />

      <div className="section">
        <h2>Bem-vindo ao CV Sem Frescura</h2>
        <p>Nossa plataforma foi desenvolvida para ajudar você a otimizar seu currículo para vagas específicas.</p>
        <ul>
          <li>Analisamos seu currículo em relação às vagas desejadas</li>
          <li>Fornecemos feedback detalhado e personalizado</li>
          <li>Sugerimos melhorias específicas</li>
          <li>Aumentamos suas chances de ser selecionado</li>
        </ul>
      </div>

      <div className="section">
        <h2>Prepare seus Documentos</h2>
        <p>Antes de começar, tenha em mãos:</p>
        <ul>
          <li>Seu currículo em formato PDF ou DOCX</li>
          <li>Links das vagas que deseja se candidatar (até 2 vagas por análise)</li>
          <li>Cada pacote de créditos permite 4 análises (total de 8 vagas)</li>
          <li>Certifique-se que o currículo esteja atualizado</li>
        </ul>
        <p>Como usar:</p>
        <ul>
          <li>Faça upload do seu currículo</li>
          <li>Cole os links das vagas desejadas</li>
          <li>Clique em "Analisar Currículo"</li>
          <li>Aguarde a análise completa</li>
          <li>Receba recomendações personalizadas</li>
        </ul>
      </div>

      <div className="section">
        <h2>Envie seu Currículo</h2>
        {typeof credits === 'number' && credits >= 0 ? (
          credits > 0 ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="curriculo">Currículo (PDF ou DOCX)</label>
                <input 
                  type="file" 
                  id="curriculo" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                />
              </div>

              {jobLinks.map((link, index) => (
                <div className="form-group" key={index}>
                  <label htmlFor={`link-vaga-${index}`}>
                    Link da Vaga {index + 1}
                  </label>
                  <input 
                    type="text" 
                    id={`link-vaga-${index}`}
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              ))}

              {jobLinks.length < 2 && (
                <button 
                  type="button"
                  className="add-link-btn"
                  onClick={addLink}
                >
                  + Adicionar Outra Vaga
                </button>
              )}

              <button 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Analisando...' : 'Analisar Currículo'}
              </button>
            </form>
          ) : (
            <div className="no-credits-message">
              <p>Você precisa de créditos para analisar seu currículo.</p>
              <button 
                onClick={() => navigate('/checkout')}
                className="buy-credits-button"
              >
                Comprar Créditos
              </button>
            </div>
          )
        ) : (
          <div className="loading-credits">
            <p>Carregando créditos...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="section">
            <p>Analisando seu currículo... Por favor, aguarde.</p>
          </div>
        )}

        {analysis && Object.keys(analysis).length > 0 && (
          <div className="section">
            {analysis.introduction && (
              <div className="analysis-block">
                <h3>Introdução</h3>
                <p className="analysis-text">{analysis.introduction}</p>
              </div>
            )}

            {analysis.extracted_keywords?.all_keywords?.length > 0 && (
              <div className="analysis-block">
                <h3>Palavras-chave Identificadas</h3>
                <div className="keywords-grid">
                  {analysis.extracted_keywords.all_keywords.map((keyword, index) => (
                    <div key={index} className="keyword-item">
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.keywords && (
              <div className="analysis-block">
                {analysis.keywords.present?.length > 0 && (
                  <div className="keywords-section">
                    <h3>Palavras-chave Presentes</h3>
                    <ul className="keywords-list">
                      {analysis.keywords.present.map((keyword, index) => (
                        <li key={index} className="keyword-item">{keyword}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.keywords.missing?.length > 0 && (
                  <div className="keywords-section">
                    <h3>Palavras-chave Ausentes</h3>
                    <ul className="keywords-list">
                      {analysis.keywords.missing.map((keyword, index) => (
                        <li key={index} className="keyword-item">{keyword}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {analysis.recommendations?.length > 0 && (
              <div className="analysis-block">
                <h3>Recomendações</h3>
                <ol className="recommendations-list">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="recommendation-item">{recommendation}</li>
                  ))}
                </ol>
              </div>
            )}

            {analysis.conclusion && (
              <div className="analysis-block">
                <h3>Conclusão</h3>
                <p className="analysis-text">{analysis.conclusion}</p>
              </div>
            )}

            {/* Botão Nova Análise */}
            <div className="new-analysis-section">
              {credits > 0 ? (
                <button 
                  className="new-analysis-button"
                  onClick={() => {
                    setAnalysis(null);
                    setFile(null);
                    setJobLinks(['']);
                    setError(null);
                    if (document.getElementById('curriculo')) {
                      document.getElementById('curriculo').value = '';
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Nova Análise
                </button>
              ) : (
                <div className="no-credits-message">
                  <p>Você precisa de créditos para fazer uma nova análise.</p>
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="buy-credits-button"
                  >
                    Comprar Créditos
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
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
      </Router>
    </AuthProvider>
  );
}

export default App;