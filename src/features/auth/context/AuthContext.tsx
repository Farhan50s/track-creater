import React, { createContext, useEffect, useState, useCallback, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { AuthContextValue, Profile } from '../types/auth.types';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasActiveTrack, setHasActiveTrack] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isMounted = useRef<boolean>(true);

  // Fetch profile with maybeSingle and a single fallback retry for high-latency trigger completion
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, created_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('[AuthContext] Error fetching profile:', error.message);
      }

      if (data) {
        return data as Profile;
      }

      // Retry once after 300ms if trigger was still executing
      await new Promise((res) => setTimeout(res, 300));
      const retryResult = await supabase
        .from('profiles')
        .select('user_id, created_at')
        .eq('user_id', userId)
        .maybeSingle();

      return (retryResult.data as Profile) || null;
    } catch (err) {
      console.error('[AuthContext] Exception fetching profile:', err);
      return null;
    }
  }, []);

  // Fetch active track status
  const fetchActiveTrack = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_active_track')
        .select('track_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('[AuthContext] Error checking active track:', error.message);
        return false;
      }
      return Boolean(data);
    } catch (err) {
      console.error('[AuthContext] Exception checking active track:', err);
      return false;
    }
  }, []);

  // Sync user metadata (profile and active track)
  const syncUserData = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      if (isMounted.current) {
        setProfile(null);
        setHasActiveTrack(false);
      }
      return;
    }

    const [userProfile, activeTrackExists] = await Promise.all([
      fetchProfile(currentUser.id),
      fetchActiveTrack(currentUser.id),
    ]);

    if (isMounted.current) {
      setProfile(userProfile);
      setHasActiveTrack(activeTrackExists);
    }
  }, [fetchProfile, fetchActiveTrack]);

  // Public refresh methods
  const refreshProfile = useCallback(async () => {
    if (user) {
      const updatedProfile = await fetchProfile(user.id);
      if (isMounted.current) {
        setProfile(updatedProfile);
      }
    }
  }, [user, fetchProfile]);

  const refreshActiveTrack = useCallback(async () => {
    if (user) {
      const active = await fetchActiveTrack(user.id);
      if (isMounted.current) {
        setHasActiveTrack(active);
      }
    }
  }, [user, fetchActiveTrack]);

  // Auth Lifecycle: Initialize & Listen
  useEffect(() => {
    isMounted.current = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted.current) return;

      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await syncUserData(currentUser);
      } else {
        setProfile(null);
        setHasActiveTrack(false);
      }

      if (isMounted.current) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [syncUserData]);

  // Auth Actions
  const signIn = useCallback(async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password });
    return { data: res.data, error: res.error };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const res = await supabase.auth.signUp({ email, password });
    return { data: res.data, error: res.error };
  }, []);

  const signOut = useCallback(async () => {
    const res = await supabase.auth.signOut();
    if (isMounted.current) {
      setSession(null);
      setUser(null);
      setProfile(null);
      setHasActiveTrack(false);
    }
    return { error: res.error };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const res = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    return { data: res.data, error: res.error };
  }, []);

  const value: AuthContextValue = {
    session,
    user,
    profile,
    hasActiveTrack,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshActiveTrack,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
