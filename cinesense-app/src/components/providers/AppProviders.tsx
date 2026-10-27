"use client";

import React from "react";
import { AuthProvider } from "@/components/auth/AuthContext";
import AuthGate from "@/components/auth/AuthGate";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}
