"use client";

import React from "react";
import { ThemeProvider } from "@/components/theme/ThemeContext";
import { AuthProvider } from "@/components/auth/AuthContext";
import AuthGate from "@/components/auth/AuthGate";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate>{children}</AuthGate>
      </AuthProvider>
    </ThemeProvider>
  );
}
