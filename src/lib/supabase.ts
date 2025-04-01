
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
  try {
    // First try to get from session
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      return data.session.access_token;
    }
    
    // If no session, try to get from localStorage
    const user = localStorage.getItem('currentUser');
    if (user) {
      // For our temporary auth system, create a simple token
      // This is just for development purposes
      return 'temp_auth_token_' + JSON.parse(user).id;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Function to check if user is authenticated
export const isAuthenticated = () => {
  try {
    const user = localStorage.getItem('currentUser');
    return !!user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export default supabase;
