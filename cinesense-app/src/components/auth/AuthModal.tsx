"use client";

import { useState } from "react";
import { X, Lock, Mail, User, ShieldCheck, Sparkles, CheckCircle2, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ADMIN_EMAIL, AuthUser } from "./AuthContext";

export type { AuthUser };

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim();
      const isSuperAdmin = cleanEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      let cleanName = name.trim();
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

      const user: AuthUser = {
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
          ? `Welcome back, Administrator!`
          : `Signed in successfully!`
      );
      setIsLoading(false);
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 500);
    }, 400);
  };

  const handleQuickLogin = (role: "reviewer" | "admin") => {
    setIsLoading(true);
    setTimeout(() => {
      let user: AuthUser;
      if (role === "admin") {
        user = {
          id: "user-admin",
          name: "Administrator",
          email: ADMIN_EMAIL,
          username: "admin",
          role: "admin",
          badge: "Super Admin",
          points: 2500,
        };
      } else {
        user = {
          id: "user-demo",
          name: "Guest Critic",
          email: "guest@cinesense.app",
          username: "guest_critic",
          role: "user",
          badge: "Verified Reviewer",
          points: 100,
        };
      }

      setSuccessMessage(`Welcome back, ${user.name}!`);
      setIsLoading(false);
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 400);
    }, 300);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-[#12121e] border-2 border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black text-left overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-md">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-display font-bold text-white">
                {tab === "signin" ? "Sign In to CineSense" : "Create CineSense Account"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Sign In / Sign Up Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#181826] border border-white/10 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setTab("signin")}
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
              onClick={() => setTab("signup")}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tab === "signup"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* 1-Click Fast Logins */}
          <div className="space-y-2 mb-6">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              1-Click Instant Fast Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("reviewer")}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-2 group hover:border-purple-500/40 cursor-pointer"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>Demo Reviewer</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("admin")}
                className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-200 transition-all flex items-center justify-center gap-2 group hover:border-emerald-400 cursor-pointer"
              >
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#12121e] px-3 text-[11px] text-slate-500 uppercase font-mono tracking-widest shrink-0">
              or continue with email
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Your Name / Display Name {tab === "signin" && <span className="text-slate-500 font-normal">(Optional)</span>}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  required={tab === "signup"}
                  placeholder="e.g. Alex Morgan / Film Buff"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#181826] border border-white/10 focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Email Address</label>
                {email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Shield size={10} /> Admin Email Recognized
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#181826] border border-white/10 focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#181826] border border-white/10 focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50"
            >
              {isLoading
                ? "Verifying..."
                : tab === "signin"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
