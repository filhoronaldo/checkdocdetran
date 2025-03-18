
import React, { createContext, useState, useContext, useEffect } from "react";
import { User, AuthContextType } from "@/types/auth";
import { toast } from "sonner";
import supabase from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
  isLoading: true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Get user metadata and role
        const { data: { user: userData } } = await supabase.auth.getUser();
        
        if (userData) {
          const isAdmin = userData.app_metadata?.role === 'admin';
          
          setUser({
            id: userData.id,
            email: userData.email || '',
            name: userData.user_metadata?.name || '',
            isAdmin: isAdmin
          });
        }
      }
      
      setIsLoading(false);
    };
    
    checkUser();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Get user metadata and role
        const { data: { user: userData } } = await supabase.auth.getUser();
        
        if (userData) {
          const isAdmin = userData.app_metadata?.role === 'admin';
          
          setUser({
            id: userData.id,
            email: userData.email || '',
            name: userData.user_metadata?.name || '',
            isAdmin: isAdmin
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user && data.session) {
        // Check if user is admin
        const isAdmin = data.user.app_metadata?.role === 'admin';
        
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || '',
          isAdmin: isAdmin
        });
        
        toast.success("Login realizado com sucesso!");
        return true;
      }
      
      return false;
    } catch (error) {
      toast.error("Email ou senha inválidos!");
      return false;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      setUser(null);
      toast.success("Logout realizado com sucesso!");
    } else {
      toast.error("Erro ao fazer logout!");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Admin function to get all users (requires admin access)
export const getAllUsers = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    toast.error("Você precisa estar logado para acessar esta função");
    return [];
  }
  
  // Get current user info
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  if (!currentUser || currentUser.app_metadata?.role !== 'admin') {
    toast.error("Você não tem permissão para acessar esta função");
    return [];
  }
  
  // Get all users
  const { data: users, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    toast.error("Erro ao buscar usuários");
    return [];
  }
  
  return users.users.map(user => ({
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || '',
    isAdmin: user.app_metadata?.role === 'admin'
  }));
};

// Admin function to remove a user (requires admin access)
export const removeUser = async (userId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    toast.error("Você precisa estar logado para acessar esta função");
    return false;
  }
  
  // Get current user info
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  if (!currentUser || currentUser.app_metadata?.role !== 'admin') {
    toast.error("Você não tem permissão para acessar esta função");
    return false;
  }
  
  // Check if trying to remove themselves
  if (userId === session.user.id) {
    toast.error("Não é possível remover o usuário que está logado!");
    return false;
  }
  
  // Remove user
  const { error } = await supabase.auth.admin.deleteUser(userId);
  
  if (error) {
    toast.error("Erro ao remover usuário");
    return false;
  }
  
  toast.success("Usuário removido com sucesso!");
  return true;
};
