import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';

type DemoUser = Pick<User, 'id' | 'email' | 'created_at' | 'user_metadata'> & {
  is_demo_user: true;
};

type AuthUser = User | DemoUser;

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: Record<string, string>) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DEMO_USERS_KEY = 'carbon-risk-demo-users';
const DEMO_SESSION_KEY = 'carbon-risk-demo-session';

interface StoredDemoUser {
  id: string;
  email: string;
  password: string;
  created_at: string;
  user_metadata: Record<string, string>;
}

const isFetchFailure = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('fetch failed');
};

const readDemoUsers = (): StoredDemoUser[] => {
  try {
    return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
  } catch {
    return [];
  }
};

const toDemoUser = (user: StoredDemoUser): DemoUser => ({
  id: user.id,
  email: user.email,
  created_at: user.created_at,
  user_metadata: user.user_metadata,
  is_demo_user: true
});

const getDemoSession = (): DemoUser | null => {
  const sessionId = localStorage.getItem(DEMO_SESSION_KEY);
  if (!sessionId) return null;
  const user = readDemoUsers().find((item) => item.id === sessionId);
  return user ? toDemoUser(user) : null;
};

const createDemoAccount = (email: string, password: string, metadata: Record<string, string> = {}) => {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readDemoUsers();
  if (users.some((user) => user.email === normalizedEmail)) {
    return { error: new Error('A demo account already exists for this email') };
  }

  const user: StoredDemoUser = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    password,
    created_at: new Date().toISOString(),
    user_metadata: metadata
  };

  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify([...users, user]));
  localStorage.setItem(DEMO_SESSION_KEY, user.id);
  return { user: toDemoUser(user), error: null };
};

const signInDemoAccount = (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = readDemoUsers().find((item) => item.email === normalizedEmail && item.password === password);
  if (!user) {
    return { error: new Error('Demo account not found. Please sign up first.') };
  }

  localStorage.setItem(DEMO_SESSION_KEY, user.id);
  return { user: toDemoUser(user), error: null };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadSession = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setUser(getDemoSession());
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? getDemoSession());

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? getDemoSession());
          setLoading(false);
        });
        unsubscribe = () => subscription.unsubscribe();
      } catch (error) {
        setUser(getDemoSession());
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    return () => unsubscribe?.();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error) {
          setUser(data.user);
          return { error: null };
        }

        return { error };
      } catch (error) {
        if (!isFetchFailure(error)) return { error };
      }
    }

    const result = signInDemoAccount(email, password);
    if (!result.error) setUser(result.user);
    return { error: result.error };
  };

  const signUp = async (email: string, password: string, metadata: Record<string, string> = {}) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata
          }
        });

        if (!error) {
          if (data.user) setUser(data.user);
          return { error: null };
        }

        return { error };
      } catch (error) {
        if (!isFetchFailure(error)) return { error };
      }
    }

    const result = createDemoAccount(email, password, metadata);
    if (!result.error) setUser(result.user);
    return { error: result.error };
  };

  const signOut = async () => {
    localStorage.removeItem(DEMO_SESSION_KEY);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
