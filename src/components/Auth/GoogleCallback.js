import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Evita processamento duplo
      if (processedRef.current) return;
      
      try {
        console.log("=== Google Callback Component Mounted ===");
        console.log("Current URL:", window.location.href);
        
        const params = new URLSearchParams(window.location.search);
        console.log("All URL Parameters:", Object.fromEntries(params.entries()));
        
        const token = params.get('token');
        const error = params.get('error');
        
        console.log("Received token:", token);
        console.log("Received error:", error);
        
        if (error) {
          console.error('Error during authentication:', error);
          navigate('/login', { 
            replace: true,
            state: { error: 'Falha na autenticação com Google: ' + error }
          });
          return;
        }
        
        if (!token) {
          console.error('No token received. URL Parameters:', Object.fromEntries(params.entries()));
          navigate('/login', { 
            replace: true,
            state: { error: 'Token não recebido' }
          });
          return;
        }

        console.log("Token received successfully, proceeding with login...");
        
        // Marca como processado
        processedRef.current = true;
        
        // Armazenar o token
        sessionStorage.setItem('authToken', token);
        localStorage.setItem('authToken', token);
        
        // Atualizar o contexto de autenticação
        login({ token });
        
        // Recuperar e limpar o redirect armazenado
        const redirectTo = sessionStorage.getItem('auth_redirect') || '/';
        sessionStorage.removeItem('auth_redirect');
        
        console.log("Redirecting to:", redirectTo);
        
        // Redirecionar para a página desejada usando replace
        navigate(redirectTo, { replace: true });
      } catch (error) {
        console.error('Error processing callback:', error);
        navigate('/login', { 
          replace: true,
          state: { error: 'Erro ao processar autenticação' }
        });
      }
    };

    handleCallback();
  }, [navigate, login]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h2 className="text-xl mb-4">Processando autenticação...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
};

export default GoogleCallback;
