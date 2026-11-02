import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Film, LayoutDashboard, Menu, X, User, LogOut, LogIn, ShieldCheck,
  Globe, ChevronDown, Home, Search, Scale, Calendar, BarChart2, Users
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from './ThemeToggle';
import { cn } from '../lib/utils';
import { ADMIN_EMAIL } from './AdminRoute';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/explore', label: 'Explore', icon: Search },
  { to: '/explore?tab=compare', label: 'Compare', icon: Scale },
  { to: '/upcoming', label: 'Calendar', icon: Calendar },
  { to: '/analyzer', label: 'Analyze Review', icon: BarChart2 },
  { to: '/dashboard', label: 'Community', icon: Users, protected: true },
  { to: '/history', label: 'History', icon: BarChart2, protected: true },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const visibleLinks = NAV_LINKS.filter((l) => !l.protected || isAuthenticated);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const isDark = theme === 'dark';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-16 border-b transition-colors duration-300',
        isDark
          ? 'bg-[rgba(10,10,15,0.92)] border-[#2a2a3d]/60 backdrop-blur-md'
          : 'bg-white/95 border-purple-100/70 backdrop-blur-md shadow-sm'
      )}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0" aria-label="CineSense home">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6332c9] via-[#7c3aed] to-[#8b5cf6] flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-all">
            <Film size={18} className="text-white" aria-hidden />
          </div>
          <div className="flex flex-col leading-none">
            <span className={cn('font-display font-extrabold text-lg tracking-tight', isDark ? 'text-white' : 'text-slate-900')}>
              Sandalwood
            </span>
            <span className="text-[10px] font-medium text-slate-500 -mt-0.5">AI Movie Sentiment Analytics</span>
          </div>
        </Link>

        {/* ── Desktop nav links ── */}
        <div className="hidden md:flex items-center gap-1">
          {visibleLinks.map((link) => {
            const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to.split('?')[0]));
            const Icon = link.icon;
            return (
              <Link
                key={link.to + link.label}
                to={link.to}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#6332c9] text-white shadow-sm shadow-purple-500/25'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-white/5'
                    : 'text-slate-700 hover:text-purple-700 hover:bg-purple-50/80'
                )}
              >
                <Icon size={14} className={isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* ── Desktop right actions ── */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Language selector */}
          <button
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border shadow-sm',
              isDark
                ? 'text-slate-300 bg-white/5 border-white/10 hover:bg-white/10'
                : 'text-slate-700 bg-white border-slate-200 hover:bg-purple-50/60 hover:border-purple-200'
            )}
          >
            <Globe size={13} className="text-slate-500" />
            <span>English</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>

          <ThemeToggle />

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all border shadow-sm',
                  isDark
                    ? 'text-slate-200 bg-white/5 hover:bg-white/10 border-white/10'
                    : 'text-slate-700 bg-white hover:bg-purple-50/60 border-slate-200 hover:border-purple-200'
                )}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                id="user-menu-button"
              >
                <div className="w-6 h-6 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <span className="max-w-[100px] truncate font-medium">{user?.name || 'Chinnayhegde'}</span>
                <span className={cn('text-[11px] font-medium text-slate-500')}>
                  100 pts
                </span>
                <ChevronDown size={12} className={cn('text-slate-400 transition-transform', userMenuOpen ? 'rotate-180' : '')} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      'absolute right-0 top-full mt-2 w-52 rounded-2xl border shadow-xl py-2',
                      isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200'
                    )}
                    role="menu"
                    aria-labelledby="user-menu-button"
                  >
                    {/* user info header */}
                    <div className={cn('px-4 py-2 mb-1 border-b', isDark ? 'border-[#2a2a3d]' : 'border-slate-100')}>
                      <p className={cn('text-sm font-semibold truncate', isDark ? 'text-white' : 'text-slate-800')}>{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className={cn('flex items-center gap-2 px-4 py-2 text-sm transition-colors', isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-50')}
                      role="menuitem"
                    >
                      <User size={14} /> Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className={cn('flex items-center gap-2 px-4 py-2 text-sm transition-colors', isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-50')}
                      role="menuitem"
                    >
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    {user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && (
                      <Link
                        to="/admin/diagnostics"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        role="menuitem"
                      >
                        <ShieldCheck size={14} /> Admin Diagnostics
                      </Link>
                    )}
                    <hr className={cn('my-1', isDark ? 'border-[#2a2a3d]' : 'border-slate-100')} />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors"
                      role="menuitem"
                    >
                      <LogOut size={14} /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className={cn(
                  'text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors border shadow-sm',
                  isDark ? 'text-slate-300 border-white/10 hover:bg-white/5' : 'text-slate-700 bg-white border-slate-200 hover:bg-purple-50/60'
                )}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#6332c9] via-[#7c3aed] to-[#8b5cf6] hover:opacity-95 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-all shadow-sm shadow-purple-500/25"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'
            )}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'md:hidden overflow-hidden border-b',
              isDark ? 'bg-[#0d0d14] border-[#2a2a3d]' : 'bg-white border-slate-200'
            )}
          >
            <div className="px-4 py-4 space-y-1">
              {visibleLinks.map((link) => (
                <Link
                  key={link.to + link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    (location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to.split('?')[0])))
                      ? 'text-purple-500 bg-purple-50 dark:bg-purple-500/10'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-white/5'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t mt-3 space-y-1" style={{ borderColor: isDark ? '#2a2a3d' : '#e2e8f0' }}>
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={cn('text-sm font-medium', isDark ? 'text-slate-200' : 'text-slate-800')}>{user?.name}</p>
                        <p className="text-xs text-slate-400">100 pts</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className={cn('flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors', isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100')}
                    >
                      <User size={14} /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors"
                    >
                      <LogOut size={14} /> Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className={cn('flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors', isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100')}
                    >
                      <LogIn size={14} /> Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm w-full mt-1"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
