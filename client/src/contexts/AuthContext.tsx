import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authService } from '../services/auth';
import type { SignUpFormData, SignInFormData } from '../types/auth';
import { toast } from "react-hot-toast";

type AuthContextType = {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (credentials: SignInFormData) => Promise<void>;
  signUp: (userData: SignUpFormData) => Promise<void>;
  signOut: () => void;
  clearError: () => void;
  checkAuth: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated on initial load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (authService.checkExistTokens() && !user) {
      try {
        setIsLoading(true);
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        authService.clearTokens();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const signIn = useCallback(async (credentials: SignInFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.signIn(credentials);
      const userData = await authService.getCurrentUser();
      toast.success('Sign in successful');
      setUser(userData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign in');
      toast.error('Sign in failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (userData: SignUpFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.signUp(userData);
      toast.success('Sign up successful');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign up');
      toast.error('Sign up failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    authService.signOut();
    toast.success('Sign out successful');
    setUser(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: authService.checkExistTokens() ,
        isLoading,
        error,
        signIn,
        signUp,
        signOut,
        clearError,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
