import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
};

type AuthContextType = {
  user: UserProfile | null;
  session: Session | null;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (name: string, email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper para traduzir erros comuns do Supabase
  const translateError = (error: any) => {
    const message = error.message || '';
    if (message.includes('Invalid login credentials')) {
      return 'E-mail ou senha incorretos. Verifique se você já criou sua conta.';
    }
    if (message.includes('Email not confirmed')) {
      return 'E-mail não confirmado. Verifique sua caixa de entrada ou spam.';
    }
    if (message.includes('User already registered')) {
      return 'Este e-mail já está cadastrado. Tente fazer login.';
    }
    if (message.includes('Password should be')) {
      return 'A senha deve ter pelo menos 6 caracteres.';
    }
    return 'Ocorreu um erro: ' + message;
  };

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Fallback if profile doesn't exist yet (race condition with trigger)
        setUser({ id: userId, name: 'Usuário', email, role: 'client' });
      } else {
        setUser(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        Alert.alert('Erro no Login', translateError(error));
        setIsLoading(false);
        throw error;
      }
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  const signUp = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        Alert.alert('Erro no Cadastro', translateError(error));
        setIsLoading(false);
        throw error;
      }
      
      // Sucesso é tratado no componente para permitir navegação personalizada
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        signIn, 
        signUp, 
        signOut, 
        isAuthenticated: !!session?.user,
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
