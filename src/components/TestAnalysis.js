import React from 'react';
import './TestAnalysis.css';

const TestAnalysis = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="section analysis-section">
      {/* ATS Score */}
      <div className="analysis-block">
        <h3>Pontuação ATS</h3>
        <div className="ats-score">
          {analysis.ats_score}
        </div>
      </div>

      {/* Mensagem Motivacional */}
      <div className="analysis-block">
        <h3>Avaliação Geral</h3>
        <p className="motivational-message">
          {analysis.motivational_message}
        </p>
      </div>

      {/* Palavras-chave Encontradas */}
      <div className="analysis-block">
        <h3>Termos Encontrados no Currículo</h3>
        <div className="keywords-grid">
          <div className="keyword-section">
            <h4>Correspondências Exatas</h4>
            <div className="keyword-list">
              {analysis.exact_matches?.present?.map((keyword, index) => (
                <div key={index} className="keyword-item match">
                  {keyword}
                </div>
              ))}
            </div>
          </div>
          <div className="keyword-section">
            <h4>Correspondências Contextuais</h4>
            <div className="keyword-list">
              {analysis.semantic_matches?.present?.map((keyword, index) => (
                <div key={index} className="keyword-item semantic-match">
                  {keyword}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Palavras-chave Faltantes */}
      <div className="analysis-block">
        <h3>Termos Ausentes</h3>
        <div className="keywords-grid">
          <div className="keyword-section">
            <h4>Termos Críticos Faltantes</h4>
            <div className="keyword-list">
              {analysis.exact_matches?.missing?.map((keyword, index) => (
                <div key={index} className="keyword-item missing">
                  {keyword}
                </div>
              ))}
            </div>
          </div>
          <div className="keyword-section">
            <h4>Contextos Sugeridos</h4>
            <div className="keyword-list">
              {analysis.semantic_matches?.missing?.map((keyword, index) => (
                <div key={index} className="keyword-item semantic-missing">
                  {keyword}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recomendações */}
      <div className="analysis-block">
        <h3>Recomendações de Melhoria</h3>
        <ul className="recommendations-list">
          {analysis.recommendations?.map((rec, index) => (
            <li key={index} className="recommendation-item">
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TestAnalysis;
