import { createClient } from '@supabase/supabase-js';

// Support both Vite browser environment (import.meta.env) and Node runtime (process.env)
const envUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  'https://placeholder.supabase.co';

const envAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  'placeholder-anon-key';

// Strip trailing slashes and redundant /rest/v1 suffixes to ensure Supabase client constructs proper /auth/v1 and /rest/v1 routes
const supabaseUrl = envUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = envAnonKey.trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
