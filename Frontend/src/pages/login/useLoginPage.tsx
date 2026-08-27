// src/pages/login/useLoginPage.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useLoginPage = () => {
  const [alias, setAlias] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, loginAsGuest, isAuthenticated, isGuest, loading: authLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alias || !password) {
      setError('Alias y contraseña son obligatorios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(alias, password);
    } catch (error: any) {
      setError(error.message || 'Credenciales incorrectas');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
  };

  return {
    alias,
    setAlias,
    password,
    setPassword,
    loading: loading || authLoading,
    error,
    handleSubmit,
    handleGuestLogin,
    isAuthenticated,
    isGuest
  };
};