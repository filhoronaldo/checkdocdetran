
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

// Function to fetch a service with all its checklists and items ordered by position
export const fetchServiceWithOrderedChecklists = async (serviceId: string) => {
  try {
    // First, fetch the service
    const { data: service, error: serviceError } = await supabase
      .from('ckdt_services')
      .select('*')
      .eq('id', serviceId)
      .single();
    
    if (serviceError || !service) {
      console.error('Error fetching service:', serviceError);
      return null;
    }
    
    // Next, fetch the checklists ordered by position
    const { data: checklists, error: checklistsError } = await supabase
      .from('ckdt_checklists')
      .select('*')
      .eq('service_id', serviceId)
      .order('position', { ascending: true });
    
    if (checklistsError || !checklists) {
      console.error('Error fetching checklists:', checklistsError);
      return { ...service, checklists: [] };
    }
    
    // Fetch items for each checklist, ordered by position
    const checklistsWithItems = await Promise.all(
      checklists.map(async (checklist) => {
        const { data: items, error: itemsError } = await supabase
          .from('ckdt_checklist_items')
          .select('*')
          .eq('checklist_id', checklist.id)
          .order('position', { ascending: true });
        
        if (itemsError) {
          console.error(`Error fetching items for checklist ${checklist.id}:`, itemsError);
          return { ...checklist, items: [] };
        }
        
        // Convert the DB items to the format expected by the UI
        const formattedItems = items.map(item => ({
          ...item,
          isCompleted: false
        }));
        
        return { ...checklist, items: formattedItems };
      })
    );
    
    return {
      ...service,
      checklists: checklistsWithItems
    };
  } catch (error) {
    console.error('Error fetching service with ordered checklists:', error);
    return null;
  }
};

// Function to update checklist positions when a section is moved
export const updateChecklistPositions = async (serviceId: string, checklistIds: string[]) => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      console.error('No auth token available');
      return false;
    }
    
    // Update each checklist with its new position
    const updates = checklistIds.map((id, index) => {
      return supabase
        .from('ckdt_checklists')
        .update({ position: index })
        .eq('id', id);
    });
    
    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error('Error updating checklist positions:', error);
    return false;
  }
};

// Function to update checklist item positions within a checklist
export const updateChecklistItemPositions = async (checklistId: string, itemIds: string[]) => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      console.error('No auth token available');
      return false;
    }
    
    // Update each item with its new position
    const updates = itemIds.map((id, index) => {
      return supabase
        .from('ckdt_checklist_items')
        .update({ position: index })
        .eq('id', id);
    });
    
    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error('Error updating checklist item positions:', error);
    return false;
  }
};

export default supabase;
