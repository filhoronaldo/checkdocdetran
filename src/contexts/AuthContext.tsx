
import React, { createContext, useState, useContext, useEffect } from "react";
import { User, AuthContextType } from "@/types/auth";
import { toast } from "sonner";
import supabase from "@/lib/supabase";

// Temporarily bypassing Supabase for auth
const TEMP_ADMIN = {
  id: "admin-123",
  email: "email@ronaldofilho.com",
  password: "Ron3951045@#$%",
  name: "Admin User",
  isAdmin: true
};

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
    // Check if user is already logged in via localStorage
    const checkUser = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log("Setting user from localStorage:", userData);
          setUser(userData);
          
          // For our temporary auth setup, we're manually setting a session
          if (!await supabase.auth.getSession()) {
            await supabase.auth.setSession({
              access_token: 'temp_auth_token_' + userData.id,
              refresh_token: 'temp_refresh_token',
            });
          }
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login with:", email);
      
      // Check against temporary admin credentials
      if (email === TEMP_ADMIN.email && password === TEMP_ADMIN.password) {
        console.log("Login successful with temp admin");
        
        // Create a user object without the password
        const userData: User = {
          id: TEMP_ADMIN.id,
          email: TEMP_ADMIN.email,
          name: TEMP_ADMIN.name,
          isAdmin: TEMP_ADMIN.isAdmin
        };
        
        // Store in localStorage for persistence
        localStorage.setItem('currentUser', JSON.stringify(userData));
        setUser(userData);
        
        // For our temporary auth setup, manually set a session
        await supabase.auth.setSession({
          access_token: 'temp_auth_token_' + userData.id,
          refresh_token: 'temp_refresh_token',
        });
        
        return true;
      }
      
      console.log("Login failed: Invalid credentials");
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Email ou senha inválidos!");
      return false;
    }
  };

  const logout = async () => {
    try {
      // Clear from localStorage
      localStorage.removeItem('currentUser');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      setUser(null);
      toast.success("Logout realizado com sucesso!");
    } catch (error) {
      console.error("Logout error:", error);
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

// Temporary implementation
export const getAllUsers = async () => {
  return [
    {
      id: TEMP_ADMIN.id,
      email: TEMP_ADMIN.email,
      name: TEMP_ADMIN.name,
      isAdmin: TEMP_ADMIN.isAdmin
    }
  ];
};

// Temporary implementation
export const removeUser = async (userId: string) => {
  toast.error("Função temporariamente indisponível");
  return false;
};
