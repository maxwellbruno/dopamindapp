
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('dopamind_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const savedUsers = JSON.parse(localStorage.getItem('dopamind_users') || '[]');
    const existingUser = savedUsers.find((u: any) => u.email === email && u.password === password);
    
    if (existingUser) {
      const userData = { id: existingUser.id, email: existingUser.email, name: existingUser.name };
      setUser(userData);
      localStorage.setItem('dopamind_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const savedUsers = JSON.parse(localStorage.getItem('dopamind_users') || '[]');
    const existingUser = savedUsers.find((u: any) => u.email === email);
    
    if (existingUser) {
      return false; // User already exists
    }
    
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name
    };
    
    savedUsers.push(newUser);
    localStorage.setItem('dopamind_users', JSON.stringify(savedUsers));
    
    const userData = { id: newUser.id, email: newUser.email, name: newUser.name };
    setUser(userData);
    localStorage.setItem('dopamind_user', JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dopamind_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
