import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (token && !user) {
      setUser({ token });
    }
  }, []); // Executar apenas na montagem do componente

  const login = useCallback((userData) => {
    sessionStorage.setItem('authToken', userData.token);
    localStorage.setItem('authToken', userData.token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('authToken');
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    logout
  }), [user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
