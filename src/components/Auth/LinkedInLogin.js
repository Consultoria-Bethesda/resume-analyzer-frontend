import React from 'react';
import { useNavigate } from 'react-router-dom';

const LinkedInLogin = () => {
  const navigate = useNavigate();

  const handleLinkedInLogin = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/linkedin/login`;
  };

  return (
    <button onClick={handleLinkedInLogin}>Login with LinkedIn</button>
  );
};

export default LinkedInLogin;