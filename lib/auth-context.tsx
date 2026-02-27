"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  userName: string | null;
  displayName: string | null;
  isLoading: boolean;
  login: (name: string, displayName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const storedUserName = localStorage.getItem("userName");
    const storedDisplayName = localStorage.getItem("displayName");
    
    if (storedUserName && storedDisplayName) {
      setUserName(storedUserName);
      setDisplayName(storedDisplayName);
    }
    setIsLoading(false);
  }, []);

  const login = (name: string, display: string) => {
    localStorage.setItem("userName", name);
    localStorage.setItem("displayName", display);
    setUserName(name);
    setDisplayName(display);
  };

  const logout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("displayName");
    setUserName(null);
    setDisplayName(null);
  };

  return (
    <AuthContext.Provider value={{ userName, displayName, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}