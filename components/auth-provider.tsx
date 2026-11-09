'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  plan: string;
  subscription_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

type AuthResult = {
  error?: string;
  needsConfirmation?: boolean;
};

type AuthContextValue = {
  ready: boolean;
  configured: boolean;
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function fallbackProfile(user: User): Profile {
  return {
    id: user.id,
    email: user.email ?? null,
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
    plan: 'none',
    subscription_status: 'none',
    stripe_customer_id: null,
    stripe_subscription_id: null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (user: User | null) => {
    const client = getSupabaseClient();
    if (!client || !user) {
      setProfile(null);
      return;
    }

    try {
      const { data } = await client
        .from('profiles')
        .select('id, email, full_name, plan, subscription_status, stripe_customer_id, stripe_subscription_id')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
        return;
      }

      // Profil normalno pravi trigger pri registraciji. Ako ga nema,
      // koristimo lokalni fallback dok se baza ne uskladi.
      setProfile(fallbackProfile(user));
    } catch {
      setProfile(fallbackProfile(user));
    }
  }, []);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    let active = true;

    client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      loadProfile(data.session?.user ?? null).finally(() => {
        if (active) setReady(true);
      });
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      void loadProfile(nextSession?.user ?? null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const client = getSupabaseClient();
    if (!client) return { error: 'Nalozi nisu povezani. Dodajte Supabase ključeve u okruženje.' };
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    return error ? { error: error.message } : {};
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string): Promise<AuthResult> => {
    const client = getSupabaseClient();
    if (!client) return { error: 'Nalozi nisu povezani. Dodajte Supabase ključeve u okruženje.' };
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    if (error) return { error: error.message };
    return data.session ? {} : { needsConfirmation: true };
  }, []);

  const signOut = useCallback(async () => {
    const client = getSupabaseClient();
    setProfile(null);
    setSession(null);
    if (client) await client.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) return;
    const { data } = await client.auth.getSession();
    setSession(data.session);
    await loadProfile(data.session?.user ?? null);
  }, [loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      configured: isSupabaseConfigured,
      user: session?.user ?? null,
      profile,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [ready, session, profile, signIn, signUp, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth mora biti unutar AuthProvider komponente.');
  }
  return context;
}
