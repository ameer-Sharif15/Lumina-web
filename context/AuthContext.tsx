'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  fullName: string;
  email: string;
  isVerified: boolean;
  isOnboarded: boolean;
  personal?: {
    phone?: string;
    bio?: string;
    photoUrl?: string;
    [key: string]: any;
  };
  professional?: {
    institution?: string;
    position?: string;
    yearsExperience?: string;
    [key: string]: any;
  };
  classroom?: {
    subjects?: string[];
    studentLevel?: string;
    teachingPhilosophy?: string;
    planStyle?: string[];
    [key: string]: any;
  };
  settings?: any;
  createdAt?: string;
  onboardingStep?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null, token?: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate states from localStorage on client-side mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('user_token');
      const savedUser = localStorage.getItem('user_profile');
      
      if (savedToken) {
        setTokenState(savedToken);
      }
      if (savedUser) {
        setUserState(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('[AuthContext] Hydration error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setUser = (newUser: User | null, newToken?: string | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('user_profile', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user_profile');
    }

    if (newToken !== undefined) {
      setTokenState(newToken);
      if (newToken) {
        localStorage.setItem('user_token', newToken);
      } else {
        localStorage.removeItem('user_token');
      }
    }
  };

  const logout = () => {
    setUserState(null);
    setTokenState(null);
    localStorage.removeItem('user_profile');
    localStorage.removeItem('user_token');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
