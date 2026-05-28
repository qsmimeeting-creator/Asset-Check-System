import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInManual: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for manual session
    const storedUser = localStorage.getItem('app_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('app_user');
      }
    }
    setLoading(false);

    if (!supabase) {
      return;
    }

    // Listen for auth changes (optional, but keep it for compatibility)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // If we use supabase auth, we could sync it here. 
      // But for "table editor login", we handle it manually.
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInManual = (userData: User) => {
    setUser(userData);
    localStorage.setItem('app_user', JSON.stringify(userData));
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('app_user');
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signInManual }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
