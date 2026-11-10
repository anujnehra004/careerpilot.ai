import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseLive: boolean;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (fullName: string, email: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local storage or active supabase session
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const meta = session.user.user_metadata || {};
            setUser({
              id: session.user.id,
              email: session.user.email || 'user@example.com',
              full_name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'User',
              avatar_url: meta.avatar_url,
            });
            setToken(session.access_token);
            localStorage.setItem('careerpilot_token', session.access_token);
          } else {
            // Check stored demo session
            restoreLocalSession();
          }
        } else {
          restoreLocalSession();
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        restoreLocalSession();
      } finally {
        setIsLoading(false);
      }
    };

    const restoreLocalSession = () => {
      const savedUser = localStorage.getItem('careerpilot_user');
      const savedToken = localStorage.getItem('careerpilot_token');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken || 'demo-token');
        } catch {
          setUser(null);
        }
      } else {
        // Auto-provision demo account so users can immediately test the dashboard
        const defaultUser: AuthUser = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'alex.morgan@careerpilot.ai',
          full_name: 'Alex Morgan',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        };
        setUser(defaultUser);
        setToken('demo-token');
        localStorage.setItem('careerpilot_user', JSON.stringify(defaultUser));
        localStorage.setItem('careerpilot_token', 'demo-token');
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          const meta = data.session.user.user_metadata || {};
          const authUser: AuthUser = {
            id: data.session.user.id,
            email: data.session.user.email || email,
            full_name: meta.full_name || email.split('@')[0],
          };
          setUser(authUser);
          setToken(data.session.access_token);
          localStorage.setItem('careerpilot_token', data.session.access_token);
          localStorage.setItem('careerpilot_user', JSON.stringify(authUser));
          return;
        }
      }

      // Local / Demo mode sign in
      const authUser: AuthUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email: email,
        full_name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      };
      setUser(authUser);
      setToken('demo-token');
      localStorage.setItem('careerpilot_token', 'demo-token');
      localStorage.setItem('careerpilot_user', JSON.stringify(authUser));
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (fullName: string, email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase && password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: fullName,
          };
          setUser(authUser);
          const t = data.session?.access_token || 'demo-token';
          setToken(t);
          localStorage.setItem('careerpilot_token', t);
          localStorage.setItem('careerpilot_user', JSON.stringify(authUser));
          return;
        }
      }

      const authUser: AuthUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email: email,
        full_name: fullName,
      };
      setUser(authUser);
      setToken('demo-token');
      localStorage.setItem('careerpilot_token', 'demo-token');
      localStorage.setItem('careerpilot_user', JSON.stringify(authUser));
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('careerpilot_token');
    localStorage.removeItem('careerpilot_user');
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } else {
      // Simulate OAuth login in demo mode
      const googleUser: AuthUser = {
        id: 'google-user-123',
        email: 'alex.google@example.com',
        full_name: 'Alex Morgan',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      setUser(googleUser);
      setToken('demo-token');
      localStorage.setItem('careerpilot_token', 'demo-token');
      localStorage.setItem('careerpilot_user', JSON.stringify(googleUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isSupabaseLive: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInWithGoogle,
      }}
    >
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
