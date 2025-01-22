import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../../services/auth';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Token de verificação não encontrado.');
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/auth/verify-email/${token}`
        );

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email verificado com sucesso!');
          localStorage.setItem('authToken', data.access_token);
          login({ token: data.access_token });
          setTimeout(() => navigate('/'), 2000);
        } else {
          setStatus('error');
          setMessage(data.detail || 'Erro ao verificar email.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Erro ao conectar ao servidor.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate, login]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%'
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{ 
            color: '#512808',
            marginBottom: 3,
            fontWeight: 'bold'
          }}
        >
          Verificação de Email
        </Typography>

        {status === 'verifying' && (
          <>
            <CircularProgress sx={{ marginBottom: 2 }} />
            <Typography>Verificando seu email...</Typography>
          </>
        )}

        {status === 'success' && (
          <Typography color="success.main">
            {message}
          </Typography>
        )}

        {status === 'error' && (
          <Typography color="error">
            {message}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default VerifyEmail;