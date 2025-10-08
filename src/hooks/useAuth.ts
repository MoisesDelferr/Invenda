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

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    // Initialize user profile and subscription after signup
    if (data.user && !error) {
      try {
        // Create profile
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: email.split('@')[0]
        });

        // Create subscription (free tier by default)
        await supabase.from('subscriptions').insert({
          user_id: data.user.id,
          is_premium: false
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

    // Ensure user has profile and subscription
    if (data.user && !error) {
      try {
        // Check if subscription exists
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (!existingSubscription) {
          // Create subscription if it doesn't exist
          await supabase.from('subscriptions').insert({
            user_id: data.user.id,
            is_premium: false
          });
        }

        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!existingProfile) {
          // Create profile if it doesn't exist
          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: data.user.email?.split('@')[0] || 'User'
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