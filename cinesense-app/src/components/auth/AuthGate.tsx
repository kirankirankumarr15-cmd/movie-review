"use client";

import React, { useState } from "react";
import { useAuth, ADMIN_EMAIL, AuthUser } from "./AuthContext";
import {
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Film,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading, login } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07060d] flex flex-col items-center justify-center p-4">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl p-[2px] bg-gradient-to-tr from-rose-500 via-purple-600 to-amber-400 shadow-xl shadow-purple-600/40 animate-pulse">
            <img
              src="/assets/cinesense-logo.jpg"
              alt="CineSense Logo"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            <p className="text-sm text-slate-300 font-medium">Verifying CineSense session...</p>
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
        setEmail(ADMIN_EMAIL);
        setPassword("12345678");
        setSuccessMessage("Authenticated as Super Admin");
      } else {
        quickUser = {
          id: "user-demo",
          name: "Guest Critic",
          email: "chinnu123@gmail.com",
          username: "chinnu",
          role: "user",
          badge: "Verified Reviewer",
          points: 100,
        };
        setEmail("chinnu123@gmail.com");
        setPassword("12345678");
        setSuccessMessage("Logged in as Verified Reviewer");
      }

      setTimeout(() => {
        login(quickUser);
      }, 400);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07060d] font-sans overflow-y-auto overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* Cinematic Studio Background Image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none scale-100 transition-transform duration-1000"
        style={{ backgroundImage: 'url(/assets/cinesense-login-bg.jpg)' }}
      />

      {/* Atmospheric Overlays & Vignette */}
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-[#06060c] via-black/35 to-[#06060c]/85 pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#080712]/50 to-[#05040a]/95 pointer-events-none" />

      {/* Subtle Ambient Glow Spheres */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-10 right-10 w-[300px] h-[250px] bg-pink-600/10 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* Center Container */}
      <div className="relative z-10 w-full max-w-xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        
        {/* Top Header Branding */}
        <div className="flex flex-col items-center text-center mb-4">
          {/* Glowing CineSense 3D Camera / Film Reel Logo */}
          <div className="relative mb-3 group cursor-pointer">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-[2px] bg-gradient-to-tr from-rose-500 via-purple-600 to-amber-400 shadow-[0_0_35px_rgba(217,70,239,0.55)] transition-transform duration-300 group-hover:scale-105">
              <img
                src="/assets/cinesense-logo.jpg"
                alt="CineSense Logo"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 opacity-30 blur-xl group-hover:opacity-70 transition duration-300 -z-10" />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight drop-shadow-lg">
            Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500">Sense</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-xs sm:text-[13px] font-medium tracking-wide mt-1.5 max-w-md px-4 leading-relaxed drop-shadow">
            Multi-Lingual Movie Sentiment Intelligence &amp; Verified Review Analytics
          </p>

          {/* Access Badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#18112c]/85 border border-purple-500/40 text-[11px] font-semibold text-purple-200 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.25)]">
            <Lock size={12} className="text-purple-300" />
            <span>Login Required to Access Platform</span>
          </div>
        </div>

        {/* Center Interactive Glassmorphic Card */}
        <div className="w-full max-w-[460px] bg-[#0c0b16]/85 backdrop-blur-2xl border border-purple-500/30 rounded-[28px] p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(168,85,247,0.18)] text-white relative">
          
          {/* Section 1: FAST 1-CLICK ACCESS */}
          <div className="text-center text-[10px] font-bold tracking-[0.22em] text-slate-400 uppercase mb-3">
            FAST 1-CLICK ACCESS
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Reviewer 1-Click Button */}
            <button
              type="button"
              onClick={() => handleQuickLogin("reviewer")}
              disabled={isSubmitting}
              title="Instant 1-Click Sign In as Public Reviewer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#141322]/90 hover:bg-[#1c192f] border border-white/10 hover:border-amber-400/50 transition-all text-left group active:scale-[0.98] shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-400/20 transition-all flex-shrink-0">
                <Sparkles size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-amber-300 tracking-wide group-hover:text-amber-200 transition-colors">
                  Reviewer
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Public Member
                </div>
              </div>
            </button>

            {/* Admin 1-Click Button */}
            <button
              type="button"
              onClick={() => handleQuickLogin("admin")}
              disabled={isSubmitting}
              title="Instant 1-Click Sign In as Super Administrator"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#18142a]/90 hover:bg-[#231b3e] border border-purple-500/30 hover:border-cyan-400/50 transition-all text-left group active:scale-[0.98] shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/25 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-400/20 transition-all flex-shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-cyan-300 tracking-wide group-hover:text-cyan-200 transition-colors">
                  Admin Login
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Super Admin
                </div>
              </div>
            </button>
          </div>

          {/* Section 2: OR Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-white/10" />
            <span className="absolute bg-[#0c0b16] px-3 text-[9.5px] uppercase tracking-[0.2em] font-semibold text-slate-400">
              OR ENTER YOUR CREDENTIALS
            </span>
          </div>

          {/* Section 3: Segmented Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#131221] rounded-xl border border-white/5 mb-4">
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                setErrorMessage("");
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tab === "signin"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
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
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tab === "signup"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
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

          {/* Section 4: Auth Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5">
            {tab === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#141424] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 block">
                  Email Address
                </label>
                {email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Shield size={10} /> Admin Email Recognized
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#141424] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#141424] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-[#d946ef] via-[#ec4899] to-[#8b5cf6] hover:from-[#c026d3] hover:via-[#db2777] hover:to-[#7c3aed] text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-[0_0_25px_rgba(236,72,153,0.35)] hover:shadow-[0_0_35px_rgba(236,72,153,0.55)] flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Processing…</span>
              ) : (
                <>
                  <span>
                    {tab === "signin" ? "Sign In & Enter" : "Create Account & Enter"}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Section 5: Notice Footer */}
          <p className="mt-4 text-center text-[10.5px] text-slate-400 tracking-wide font-normal">
            Admin dashboard is strictly reserved for authorized administrators.
          </p>
        </div>
      </div>
    </div>
  );
}
