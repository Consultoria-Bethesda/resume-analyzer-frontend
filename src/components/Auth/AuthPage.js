import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';
import { Paper, Typography, Button, TextField, Divider, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

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
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      console.log('Token recebido na AuthPage:', token.substring(0, 10) + '...');
      sessionStorage.setItem('authToken', token);
      localStorage.setItem('authToken', token); // Backup em localStorage
      login({ token });
      navigate('/', { replace: true });
    }
  }, [navigate, login]);

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/google/login`);
      const data = await response.json();
      if (data.url) {
        console.log('Redirecionando para URL do Google:', data.url);
        window.location.href = data.url;
      }
    } catch (error) {
      setError('Erro ao conectar com Google');
      console.error('Erro no login do Google:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

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
        body: JSON.stringify(
          isRegistering 
            ? {
                email: formData.email,
                password: formData.password,
                name: formData.name
              }
            : {
                email: formData.email,
                password: formData.password
              }
        ),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 503) {
          throw new Error("Serviço temporariamente indisponível. Por favor, tente novamente em alguns instantes.");
        } else if (response.status === 500) {
          throw new Error("Erro interno do servidor. Por favor, tente novamente.");
        } else if (data.detail === "Por favor, verifique seu email para ativar sua conta") {
          setError("Sua conta ainda não foi ativada. Por favor, verifique seu email para ativar sua conta.");
        } else {
          throw new Error(data.detail || 'Erro na autenticação');
        }
        return;
      }

      if (isRegistering) {
        setSuccessMessage(data.message);
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          name: ''
        });
      } else {
        localStorage.setItem('authToken', data.access_token);
        login({ token: data.access_token });
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: 2
      }}
    >
      <Box
        component="img"
        src="/img/logo.jpg"
        alt="RH Super Sincero Logo"
        sx={{
          width: 200,
          height: 'auto',
          marginBottom: 2
        }}
      />
      
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: 400,
          backgroundColor: 'white',
          borderRadius: 2
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: '#512808', // Alterado para o marrom da identidade visual
            marginBottom: 3
          }}
        >
          CV Sem Frescura
        </Typography>

        <Typography 
          variant="h6" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ marginBottom: 3 }}
        >
          {isRegistering ? 'Criar Nova Conta' : 'Acessar Minha Conta'}
        </Typography>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          sx={{
            marginBottom: 2,
            color: 'rgba(0, 0, 0, 0.87)',
            borderColor: 'rgba(0, 0, 0, 0.23)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderColor: 'rgba(0, 0, 0, 0.23)'
            }
          }}
        >
          Continuar com Google
        </Button>

        <Divider sx={{ my: 2 }}>ou</Divider>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <TextField
              fullWidth
              label="Nome"
              variant="outlined"
              margin="normal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          )}
          
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          
          <TextField
            fullWidth
            label="Senha"
            variant="outlined"
            margin="normal"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          
          {isRegistering && (
            <TextField
              fullWidth
              label="Confirmar Senha"
              variant="outlined"
              margin="normal"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          )}

          {successMessage && (
            <Typography color="success" align="center" sx={{ mt: 2 }}>
              {successMessage}
            </Typography>
          )}

          {error && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {isRegistering ? 'Criar Conta' : 'Entrar'}
          </Button>
        </form>

        <Button
          fullWidth
          onClick={() => setIsRegistering(!isRegistering)}
          sx={{ textTransform: 'none' }}
        >
          {isRegistering
            ? 'Já tem uma conta? Entre aqui'
            : 'Não tem uma conta? Registre-se'}
        </Button>
      </Paper>
    </Box>
  );
};

export default AuthPage;
