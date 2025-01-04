import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [jobLinks, setJobLinks] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

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
    if (jobLinks.length < 3) {
      setJobLinks(prevLinks => [...prevLinks, '']);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecione um currículo.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_urls', JSON.stringify(jobLinks));
    
    try {
      const response = await axios.post('http://localhost:8000/generate/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data) {
        console.log('Resposta do servidor:', response.data);
        setAnalysis(response.data);
      } else {
        setError('Resposta vazia do servidor');
      }
    } catch (err) {
      console.error('Erro detalhado:', err.response?.data || err.message);
      setError(`Erro ao analisar o currículo: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <img src="/img/logo.jpg" alt="RH Super Sincero Logo" />
        <h1>RH Super Sincero</h1>
      </div>

      <div className="section">
        <h2>Bem-vindo ao RH Super Sincero</h2>
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
          <li>Links das vagas que deseja se candidatar (até 3 vagas)</li>
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

          {jobLinks.length < 3 && (
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
            {/* Introdução */}
            {analysis.introduction && (
              <div className="analysis-block">
                <h3>Introdução</h3>
                <p className="analysis-text">{analysis.introduction}</p>
              </div>
            )}

            {/* Palavras-chave Extraídas */}
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

            {/* Palavras-chave Presentes e Ausentes */}
            {analysis.keywords && (
              <div className="analysis-block">
                {/* Palavras-chave Presentes */}
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

                {/* Palavras-chave Ausentes */}
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

            {/* Recomendações */}
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

            {/* Conclusão */}
            {analysis.conclusion && (
              <div className="analysis-block">
                <h3>Conclusão</h3>
                <p className="analysis-text">{analysis.conclusion}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;