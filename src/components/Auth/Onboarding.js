import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/auth';

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useAuth();

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token');
    if (token) {
      setToken(token);
      navigate('/dashboard');
    }
  }, [location, setToken, navigate]);

  return (
    <div>
      <h1>Welcome to Onboarding</h1>
      <p>Please complete the onboarding process.</p>
    </div>
  );
};

export default Onboarding;