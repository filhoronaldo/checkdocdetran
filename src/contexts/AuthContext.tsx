
import React, { createContext, useState, useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { User, AuthContextType } from "@/types/auth";
import { toast } from "sonner";

// Initial admin user
const initialUsers = [
  {
    id: uuidv4(),
    email: "email@ronaldofilho.com",
    password: "Ron3951045@#$%", // In a real app, this would be hashed
    name: "Ronaldo Filho",
    isAdmin: true
  }
];

interface StoredUser extends User {
  password: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
  isLoading: true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useLocalStorage<StoredUser[]>("users", initialUsers);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>("currentUser", null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have stored users, if not, initialize with the default admin
    if (users.length === 0) {
      setUsers(initialUsers);
    }
    
    // Simulate auth check loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Create a user object without the password to store in context
      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      toast.success("Login realizado com sucesso!");
      return true;
    }
    
    toast.error("Email ou senha inválidos!");
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    toast.success("Logout realizado com sucesso!");
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        login,
        logout,
        isAuthenticated: !!currentUser,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const addUser = (user: Omit<StoredUser, "id">) => {
  const [users, setUsers] = useLocalStorage<StoredUser[]>("users", initialUsers);
  
  const newUser: StoredUser = {
    ...user,
    id: uuidv4()
  };
  
  setUsers([...users, newUser]);
  return newUser;
};

export const removeUser = (userId: string) => {
  const [users, setUsers] = useLocalStorage<StoredUser[]>("users", initialUsers);
  const [currentUser] = useLocalStorage<User | null>("currentUser", null);
  
  if (currentUser?.id === userId) {
    toast.error("Não é possível remover o usuário que está logado!");
    return false;
  }
  
  const updatedUsers = users.filter(user => user.id !== userId);
  
  if (updatedUsers.length === users.length) {
    toast.error("Usuário não encontrado!");
    return false;
  }
  
  setUsers(updatedUsers);
  toast.success("Usuário removido com sucesso!");
  return true;
};

export const getAllUsers = () => {
  const [users] = useLocalStorage<StoredUser[]>("users", initialUsers);
  // Return users without passwords
  return users.map(({ password, ...user }) => user);
};
