import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('uvms_token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('uvms_role') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('uvms_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate auth state on mount
  useEffect(() => {
    const hydrateAuth = async () => {
      const storedToken = localStorage.getItem('uvms_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          const profile = res.data || res;
          if (profile) {
            setUser(profile);
            localStorage.setItem('uvms_user', JSON.stringify(profile));
            if (res.role) {
              setRole(res.role);
              localStorage.setItem('uvms_role', res.role);
            }
          }
        } catch {
          // Token invalid or expired
          logout();
        }
      }
      setIsLoading(false);
    };

    hydrateAuth();
  }, []);

  const login = (authToken, authUser, authRole) => {
    if (authToken) localStorage.setItem('uvms_token', authToken);
    if (authRole) localStorage.setItem('uvms_role', authRole);
    if (authUser) localStorage.setItem('uvms_user', JSON.stringify(authUser));

    setToken(authToken || null);
    setUser(authUser || null);
    setRole(authRole || null);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore network errors on logout to allow clean local reset
    } finally {
      localStorage.removeItem('uvms_token');
      localStorage.removeItem('uvms_role');
      localStorage.removeItem('uvms_user');

      setToken(null);
      setUser(null);
      setRole(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('uvms_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ token, user, role, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
