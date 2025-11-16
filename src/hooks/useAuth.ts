import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Agora o signUp aceita o "name"
  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }, // salva como metadata do usuário
      },
    });

    // Inicializa perfil e assinatura após signup
    if (data.user && !error) {
      try {
        // Cria perfil com o nome informado
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: name || email.split('@')[0],
        });

        // Cria assinatura (free tier por padrão)
        await supabase.from('subscriptions').insert({
          user_id: data.user.id,
          is_premium: false,
        });
      } catch (initError) {
        console.error('Error initializing user data:', initError);
      }
    }

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Garante que perfil e assinatura existam
    if (data.user && !error) {
      try {
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (!existingSubscription) {
          await supabase.from('subscriptions').insert({
            user_id: data.user.id,
            is_premium: false,
          });
        }

        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!existingProfile) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          });
        }
      } catch (initError) {
        console.error('Error ensuring user data:', initError);
      }
    }

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    return { data, error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };
};
