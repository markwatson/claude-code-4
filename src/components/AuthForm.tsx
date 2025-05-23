import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register } = useAuth();

  const validateForm = (): string | null => {
    if (!username.trim()) {
      return 'Username is required';
    }
    
    if (!password) {
      return 'Password is required';
    }
    
    if (!isLogin) {
      if (username.length < 3) {
        return 'Username must be at least 3 characters long';
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return 'Username can only contain letters, numbers, and underscores';
      }
      
      if (password.length < 6) {
        return 'Password must be at least 6 characters long';
      }
    }
    
    return null;
  };

  const getErrorMessage = (error: any): string => {
    if (!error.response) {
      return "Sorry we're having some technical issues right now. Please try again later.";
    }
    
    if (error.response.status >= 500) {
      return "Sorry we're having some technical issues right now. Please try again later.";
    }
    
    return error.response?.data?.error || 'An unexpected error occurred';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
      }
    } catch (error: any) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={isLogin ? "Username" : "Username (letters, numbers, underscore only)"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={isLogin ? 1 : 3}
          />
          <input
            type="password"
            placeholder={isLogin ? "Password" : "Password (at least 6 characters)"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={isLogin ? 1 : 6}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <p>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            className="link-button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};