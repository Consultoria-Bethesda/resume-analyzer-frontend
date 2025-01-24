import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  // const navigate = useNavigate();

  const validateToken = useCallback(async (token) => {
    if (!token) {
      console.error('Token não fornecido para validação');
      return false;
    }

    try {
      // Garantir que o token não inclui o prefixo "Bearer "
      const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      console.log('Validando token (primeiros 20 caracteres):', cleanToken.substring(0, 20));
      
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/auth/validate-token`,
        {
          headers: { 'Authorization': `Bearer ${cleanToken}` }
        }
      );
      return response.status === 200;
    } catch (err) {
      console.error('Erro na validação do token:', err);
      return false;
    }
  }, []);

  // Função auxiliar para obter o token limpo
  const getCleanToken = () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) return null;
    return token.startsWith('Bearer ') ? token.split(' ')[1] : token;
  };

  // Função para configurar headers de autenticação
  const getAuthHeaders = () => {
    const token = getCleanToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const login = useCallback((userData) => {
    if (!userData || !userData.token) {
      console.error('Dados de usuário ou token inválidos:', userData);
      return;
    }
    
    console.log('Token recebido (primeiros 20 caracteres):', userData.token.substring(0, 20));
    
    // Armazenar token
    sessionStorage.setItem('authToken', userData.token);
    localStorage.setItem('authToken', userData.token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      if (token) {
        const isValid = await validateToken(token);
        if (!isValid) {
          logout();
        } else if (!user) {
          setUser({ token });
        }
      }
      
      setIsValidatingToken(false);
    };

    checkAuth();
  }, [validateToken, logout, user]);

  if (isValidatingToken) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  const value = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
