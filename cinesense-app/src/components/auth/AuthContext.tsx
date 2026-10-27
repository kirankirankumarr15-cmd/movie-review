"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "kirankirankumarr15@gmail.com";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "user" | "admin";
  badge: string;
  points: number;
}

export function isUserAdmin(user: { email?: string } | null | undefined): boolean {
  if (!user || !user.email) return false;
  return user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const loadUserFromStorage = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        const savedUserStr = localStorage.getItem("cinesense_user");
        if (savedUserStr) {
          const parsed = JSON.parse(savedUserStr) as AuthUser;
          // Ensure role is accurate based on email
          const adminCheck = isUserAdmin(parsed);
          parsed.role = adminCheck ? "admin" : "user";
          setUser(parsed);
        } else {
          setUser(null);
        }
      }
    } catch (e) {
      console.error("Failed to parse cinesense_user from storage", e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromStorage();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cinesense_user") {
        loadUserFromStorage();
      }
    };

    const handleCustomAuthChange = () => {
      loadUserFromStorage();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cinesense_auth_change", handleCustomAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cinesense_auth_change", handleCustomAuthChange);
    };
  }, [loadUserFromStorage]);

  const login = (newUser: AuthUser) => {
    const adminCheck = isUserAdmin(newUser);
    const finalizedUser: AuthUser = {
      ...newUser,
      role: adminCheck ? "admin" : "user",
      badge: adminCheck ? "Super Admin" : (newUser.badge || "Verified Reviewer"),
    };
    try {
      localStorage.setItem("cinesense_user", JSON.stringify(finalizedUser));
      setUser(finalizedUser);
      setIsAuthModalOpen(false);
      window.dispatchEvent(new Event("cinesense_auth_change"));
    } catch (err) {
      console.error("Error saving user to localStorage", err);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("cinesense_user");
      setUser(null);
      window.dispatchEvent(new Event("cinesense_auth_change"));
    } catch (err) {
      console.error("Error removing user from localStorage", err);
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const isAdmin = isUserAdmin(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        login,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
