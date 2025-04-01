
import { createClient } from '@supabase/supabase-js';
import { apiUrl, anonKey } from '@/utils/databaseSetup';

const supabaseUrl = apiUrl();
const supabaseAnonKey = anonKey();

// Create Supabase client with proper credentials
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper method to get JWT token
export const getAuthToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token;
};

export default supabase;
