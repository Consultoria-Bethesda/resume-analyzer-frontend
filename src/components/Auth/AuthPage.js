import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';
import './AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AuthPage montado');
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
    }
  }, [navigate, login]);

  const handleGoogleLogin = () => {
    console.log('Tentando login com Google...');
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    console.log('Backend URL:', backendUrl);

    fetch(`${backendUrl}/auth/google/login`)
        .then(response => {
            console.log('Resposta recebida:', response);
            return response.json();
        })
        .then(data => {
            console.log('Dados recebidos:', data);
            console.log('URL de autenticação do Google:', data.url);
            if (data.url) {
                console.log('Redirecionando para:', data.url);
                window.location.href = data.url;
            } else {
                console.error('URL não encontrada na resposta');
            }
        })
        .catch(error => {
            console.error('Erro ao obter URL de autenticação do Google:', error);
        });
};

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isRegistering && formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login';
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isRegistering ? {
          email: formData.email,
          password: formData.password,
          name: formData.name
        } : {
          email: formData.email,
          password: formData.password
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Erro na autenticação');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.access_token);
      login({ token: data.access_token });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <img src="/img/logo.jpg" alt="RH Super Sincero Logo" />
        <h1>CV Sem Frescura</h1>
      </div>

      <div className="section">
        <h2>Bem-vindo ao CV Sem Frescura</h2>
        <p>Faça login para começar a análise do seu currículo</p>
        
        <div className="auth-buttons">
          <button 
            className="login-button google-button"
            onClick={handleGoogleLogin}
          >
            <img src="/img/google-icon.png" alt="Google Icon" className="google-icon" />
            Continuar com Google
          </button>
        </div>

        <div className="auth-separator">
          <span>ou</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="name">Nome completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar senha</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <button type="submit" className="submit-button">
            {isRegistering ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegistering ? (
            <>
              Já tem uma conta?{' '}
              <button onClick={() => setIsRegistering(false)}>
                Faça login
              </button>
            </>
          ) : (
            <>
              Não tem uma conta?{' '}
              <button onClick={() => setIsRegistering(true)}>
                Cadastre-se
              </button>
            </>
          )}
        </p>

        <div className="legal-links">
          <p>
            Ao fazer login, você concorda com nossos{' '}
            <a href="/terms-of-service">Termos de Serviço</a> e{' '}
            <a href="/privacy-policy">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;