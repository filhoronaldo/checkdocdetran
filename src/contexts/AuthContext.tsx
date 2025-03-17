
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
    const session = supabase.auth.getSession();
    
    // Check if user is already logged in
    const checkUser = async () => {
      const { data } = await session;
      
      if (data.session) {
        const { data: userData } = await supabase
          .from('auth.users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
          
        if (userData) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || '',
            name: userData.user_metadata?.name || '',
            isAdmin: userData.role === 'admin'
          });
        }
      }
      
      setIsLoading(false);
    };
    
    checkUser();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: userData } = await supabase
          .from('auth.users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (userData) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: userData.user_metadata?.name || '',
            isAdmin: userData.role === 'admin'
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
        const { data: userData } = await supabase
          .from('auth.users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (userData) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: userData.user_metadata?.name || '',
            isAdmin: userData.role === 'admin'
          });
        }
        
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
  
  // Check if user is admin
  const { data: currentUser } = await supabase
    .from('auth.users')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  if (!currentUser || currentUser.role !== 'admin') {
    toast.error("Você não tem permissão para acessar esta função");
    return [];
  }
  
  // Get all users
  const { data: users, error } = await supabase
    .from('auth.users')
    .select('*');
    
  if (error) {
    toast.error("Erro ao buscar usuários");
    return [];
  }
  
  return users.map(user => ({
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || '',
    isAdmin: user.role === 'admin'
  }));
};

// Admin function to remove a user (requires admin access)
export const removeUser = async (userId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    toast.error("Você precisa estar logado para acessar esta função");
    return false;
  }
  
  // Check if user is admin
  const { data: currentUser } = await supabase
    .from('auth.users')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  if (!currentUser || currentUser.role !== 'admin') {
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
