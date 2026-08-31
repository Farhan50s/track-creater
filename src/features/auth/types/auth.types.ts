import { Session, User, AuthError } from '@supabase/supabase-js';

export interface Profile {
  user_id: string;
  created_at: string;
}

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  hasActiveTrack: boolean;
  isLoading: boolean;

  signIn: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ data: any; error: AuthError | null }>;
  refreshActiveTrack: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
