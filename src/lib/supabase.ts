
import { createClient } from '@supabase/supabase-js';
import { apiUrl, anonKey } from '@/utils/databaseSetup';
import { Service, ChecklistGroup, ChecklistItem } from '@/types';

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

// Function to fetch a service by ID with its checklists and items
export const fetchServiceById = async (serviceId: string): Promise<Service | null> => {
  try {
    // Fetch the service
    const { data: serviceData, error: serviceError } = await supabase
      .from('ckdt_services')
      .select('*')
      .eq('id', serviceId)
      .single();
    
    if (serviceError || !serviceData) {
      console.error('Error fetching service:', serviceError);
      return null;
    }
    
    // Fetch all checklists for this service, ordered by position
    const { data: checklistsData, error: checklistsError } = await supabase
      .from('ckdt_checklists')
      .select('*')
      .eq('service_id', serviceId)
      .order('position', { ascending: true });
    
    if (checklistsError) {
      console.error('Error fetching checklists:', checklistsError);
      return null;
    }
    
    // Make sure checklistsData is an array even if it's null or undefined
    const safeChecklistsData = checklistsData || [];
    
    // Prepare to store all checklists with their items
    const checklists: ChecklistGroup[] = [];
    
    // For each checklist, fetch its items
    for (const checklist of safeChecklistsData) {
      const { data: itemsData, error: itemsError } = await supabase
        .from('ckdt_checklist_items')
        .select('*')
        .eq('checklist_id', checklist.id)
        .order('position', { ascending: true });
      
      if (itemsError) {
        console.error('Error fetching checklist items:', itemsError);
        continue; // Skip this checklist if there's an error
      }
      
      // Make sure itemsData is an array even if it's null or undefined
      const safeItemsData = itemsData || [];
      
      // Convert items to our application format
      const items: ChecklistItem[] = safeItemsData.map(item => ({
        id: item.id,
        text: item.text,
        isCompleted: false, // Start uncompleted
        observation: item.observation || undefined,
        tags: item.tags || [], // Ensure tags is an array even if null
        isOptional: !!item.is_optional, // Convert to boolean
        position: item.position
      }));
      
      // Add the checklist with its items
      checklists.push({
        id: checklist.id,
        title: checklist.title,
        items,
        isOptional: !!checklist.is_optional, // Convert to boolean
        isAlternative: !!checklist.is_alternative, // Convert to boolean
        position: checklist.position
      });
    }
    
    // Build the complete service object
    return {
      id: serviceData.id,
      title: serviceData.title,
      category: serviceData.category,
      description: serviceData.description,
      checklists
    };
  } catch (error) {
    console.error('Error fetching service by ID:', error);
    return null;
  }
};

export default supabase;
