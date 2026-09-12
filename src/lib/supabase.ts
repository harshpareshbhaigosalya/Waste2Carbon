import { createClient } from '@supabase/supabase-js';

// Credentials provided by user
export const SUPABASE_URL = 'https://ansotypwkiacbhplryxj.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_EgoBlZqpoZpy5fVBMXuQCA_OBNeRur_';
export const SUPABASE_SERVICE_KEY = 'sb_secret_HDGflEAWx7_0Z6-YFYIT0Q_yA1XqUwf';

// Primary Supabase client for client-side Auth & Queries
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Admin client for backend operations
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
