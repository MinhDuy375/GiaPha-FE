import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (emailOrUsername, password) => {
    setLoading(true);
    try {
      const data = await authService.login(emailOrUsername, password);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password) => {
    return await authService.register(fullName, email, password);
  };

  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  const changePassword = async (oldPassword, newPassword) => {
    const result = await authService.changePassword(oldPassword, newPassword);
    // Cập nhật user trong state và localStorage bỏ cờ MustChangePassword
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, mustChangePassword: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    forgotPassword,
    changePassword,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);