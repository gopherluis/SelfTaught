"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("selftaught_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await api.auth.me();
      setUser(u);
      localStorage.setItem("selftaught_user", JSON.stringify(u));
    } catch {
      localStorage.removeItem("selftaught_token");
      localStorage.removeItem("selftaught_user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("selftaught_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }
    refreshUser();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("selftaught_token", token);
    localStorage.setItem("selftaught_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    try {
      api.auth.logout();
    } catch {}
    localStorage.removeItem("selftaught_token");
    localStorage.removeItem("selftaught_user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
