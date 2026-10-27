"use client";

import React, { useState } from "react";
import { useAuth, ADMIN_EMAIL, AuthUser } from "./AuthContext";
import { Lock, Mail, User as UserIcon, ShieldCheck, Sparkles, CheckCircle2, Film, ArrowRight, Shield } from "lucide-react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading, login } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08080d] flex flex-col items-center justify-center p-4">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-600/40 animate-pulse">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            <p className="text-sm text-slate-400 font-medium">Verifying CineSense session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  // Not logged in: Show mandatory Authentication Portal
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    setTimeout(() => {
      const cleanEmail = email.trim();
      if (!cleanEmail) {
        setErrorMessage("Please enter a valid email address.");
        setIsSubmitting(false);
        return;
      }

      let cleanName = name.trim();
      const isSuperAdmin = cleanEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      if (!cleanName) {
        if (isSuperAdmin) {
          cleanName = "Administrator";
        } else {
          const rawPart = cleanEmail.split("@")[0] || "Film Buff";
          const words = rawPart.replace(/[0-9_.-]+/g, " ").trim();
          cleanName = words
            ? words
                .split(" ")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(" ")
            : rawPart;
        }
      }

      // If user is named 'hod' or has email hod@..., change name to a friendly title
      if (cleanName.toLowerCase() === "hod" || cleanEmail.toLowerCase().startsWith("hod@")) {
        cleanName = "Senior Critic";
      }

      let cleanUsername = cleanEmail.split("@")[0] || (isSuperAdmin ? "admin" : "cinephile");
      if (cleanUsername.toLowerCase() === "hod") {
        cleanUsername = "senior_critic";
      }

      const authenticatedUser: AuthUser = {
        id: isSuperAdmin ? "user-admin" : `user-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        username: cleanUsername,
        role: isSuperAdmin ? "admin" : "user",
        badge: isSuperAdmin ? "Super Admin" : "Verified Reviewer",
        points: isSuperAdmin ? 2500 : 100,
      };

      setSuccessMessage(
        isSuperAdmin
          ? `Welcome back, Administrator! Accessing Command Center...`
          : `Signed in successfully as ${cleanName}!`
      );

      setTimeout(() => {
        login(authenticatedUser);
      }, 500);
    }, 400);
  };

  const handleQuickLogin = (type: "admin" | "reviewer") => {
    setIsSubmitting(true);
    setErrorMessage("");

    setTimeout(() => {
      let quickUser: AuthUser;
      if (type === "admin") {
        quickUser = {
          id: "user-admin",
          name: "Administrator",
          email: ADMIN_EMAIL,
          username: "admin",
          role: "admin",
          badge: "Super Admin",
          points: 2500,
        };
        setSuccessMessage("Authenticated as Super Admin");
      } else {
        quickUser = {
          id: "user-demo",
          name: "Guest Critic",
          email: "guest@cinesense.app",
          username: "guest_critic",
          role: "user",
          badge: "Verified Reviewer",
          points: 100,
        };
        setSuccessMessage("Logged in as Demo Reviewer");
      }

      setTimeout(() => {
        login(quickUser);
      }, 400);
    }, 300);
  };

  return (
    <div className="relative min-h-screen bg-[#07070c] text-slate-100 flex flex-col justify-center items-center px-4 py-12 overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-pink-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand / Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-pink-500 shadow-xl shadow-purple-600/30 mb-4 border border-white/20">
            <Film className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">Sense</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Multi-Lingual Movie Sentiment Intelligence & Verified Review Analytics
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-medium">
            <Lock size={12} className="text-purple-400" />
            <span>Login Required to Access Platform</span>
          </div>
        </div>

        {/* Auth Card Container */}
        <div className="bg-[#12121d]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          {/* Quick Instant Logins */}
          <div className="space-y-2 mb-6">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Fast 1-Click Access
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin("reviewer")}
                disabled={isSubmitting}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all flex flex-col items-center justify-center gap-1 group hover:border-purple-500/50 cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Sparkles size={14} />
                  <span>Reviewer</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Public Member</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("admin")}
                disabled={isSubmitting}
                className="p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-200 transition-all flex flex-col items-center justify-center gap-1 group hover:border-purple-400 cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck size={14} />
                  <span>Admin Login</span>
                </div>
                <span className="text-[10px] text-purple-300 font-normal">Super Admin</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#12121d] px-3 text-[11px] text-slate-500 uppercase font-mono tracking-widest shrink-0">
              or enter your credentials
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-[#181827] border border-white/10 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                setErrorMessage("");
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tab === "signin"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setErrorMessage("");
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tab === "signup"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Main Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "signup" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Display Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan / Cinema Critic"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#181827] border border-white/10 focus:border-purple-500 focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Email Address
                </label>
                {email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Shield size={10} /> Admin Email Recognized
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#181827] border border-white/10 focus:border-purple-500 focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#181827] border border-white/10 focus:border-purple-500 focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? "Authenticating..." : tab === "signin" ? "Sign In & Enter" : "Create Account & Enter"}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Admin Note */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] text-slate-400">
              Admin dashboard is strictly reserved for authorized administrators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
