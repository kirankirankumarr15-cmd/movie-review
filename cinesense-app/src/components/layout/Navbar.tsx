"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User, LogIn, LogOut, ShieldCheck, Sparkles, ChevronDown, Award, Menu, X } from "lucide-react";
import AuthModal, { AuthUser } from "@/components/auth/AuthModal";

export default function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check saved session on client mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedUser = localStorage.getItem("cinesense_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to parse saved user", e);
    }
  }, []);

  // Close user dropdown menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("cinesense_user");
    setUser(null);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <span className="text-xl font-display font-bold text-white tracking-tight">
              Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Sense</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/explore" className="text-slate-300 hover:text-white transition-colors">
              Explore
            </Link>
            <Link href="/compare" className="text-slate-300 hover:text-white transition-colors">
              Compare
            </Link>
            <Link href="/calendar" className="text-slate-300 hover:text-white transition-colors">
              Calendar
            </Link>
            <Link href="/analyze-review" className="text-slate-300 hover:text-white transition-colors">
              Analyze Review
            </Link>
            <Link href="/community" className="text-slate-300 hover:text-white transition-colors">
              Community
            </Link>
            <Link
              href="/hub/kn"
              className="text-amber-400 hover:text-amber-300 transition-colors font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Sandalwood
            </Link>
          </nav>

          {/* Actions: Admin, Profile & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin"
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            >
              Admin
            </Link>

            {isMounted && user ? (
              /* Signed In Profile Button & Dropdown */
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161625] border border-purple-500/30 hover:border-purple-500/60 transition-all text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-white leading-tight truncate max-w-[100px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-purple-300 leading-tight">
                      {user.points} pts
                    </p>
                  </div>
                  <ChevronDown size={14} className="text-slate-400 ml-0.5" />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#131320] border border-white/15 rounded-2xl shadow-2xl py-2 z-50 text-left">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-amber-400 font-semibold">
                        <Award size={12} />
                        <span>{user.badge}</span>
                      </div>
                    </div>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                      >
                        <ShieldCheck size={14} className="text-emerald-400" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/community"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                    >
                      <User size={14} className="text-purple-400" />
                      My Profile & Watchlist
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 border-t border-white/10 mt-1 cursor-pointer"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Sign In Button */
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {isMobileNavOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0c0c14]/98 backdrop-blur-2xl px-4 py-4 shadow-2xl animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-1 text-sm font-medium">
              <Link
                href="/"
                onClick={() => setIsMobileNavOpen(false)}
                className="px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-between"
              >
                <span>Home</span>
              </Link>
              <Link
                href="/explore"
                onClick={() => setIsMobileNavOpen(false)}
                className="px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-between"
              >
                <span>Explore Movies</span>
              </Link>
              <Link
                href="/compare"
                onClick={() => setIsMobileNavOpen(false)}
                className="px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-between"
              >
                <span>Compare Films</span>
              </Link>
              <Link
                href="/calendar"
                onClick={() => setIsMobileNavOpen(false)}
                className="px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-between"
              >
                <span>Release Calendar</span>
              </Link>
              <Link
                href="/analyze-review"
                onClick={() => setIsMobileNavOpen(false)}
                className="px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-between"
              >
                <span>Analyze Review (AI)</span>
              </Link>
              <Link
                href="/community"
                onClick={() => setIsMobileNavOpen(false)}
                className="px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-between"
              >
                <span>Community Hub</span>
              </Link>
              <Link
                href="/hub/kn"
                onClick={() => setIsMobileNavOpen(false)}
                className="px-3 py-2.5 rounded-xl text-amber-300 font-semibold flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 mt-2"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Sandalwood (Kannada Cinema)</span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Interactive Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(signedInUser) => {
          setUser(signedInUser);
        }}
      />
    </>
  );
}
