import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Film, LayoutDashboard, History, Info, Menu, X, User, LogOut, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from './ThemeToggle';
import { cn } from '../lib/utils';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/analyzer', label: 'Analyzer' },
  { to: '/dashboard', label: 'Dashboard', protected: true },
  { to: '/history', label: 'History', protected: true },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const visibleLinks = NAV_LINKS.filter(l => !l.protected || isAuthenticated);

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
        'fixed top-0 left-0 right-0 z-50 h-16 border-b glass-dark transition-colors duration-300',
        isDark
          ? 'bg-[rgba(10,10,15,0.85)] border-[#2a2a3d]/60'
          : 'bg-white/90 border-slate-200/80 backdrop-blur-md'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between" aria-label="Main navigation">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="CineSense home">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-glow group-hover:bg-purple-500 transition-colors">
            <Film size={16} className="text-white" aria-hidden />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            <span className={isDark ? 'text-white' : 'text-slate-900'}>Cine</span>
            <span className="text-purple-400">Sense</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {visibleLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'nav-link px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                location.pathname === link.to
                  ? 'text-purple-400 bg-purple-500/10'
                  : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'
                )}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                id="user-menu-button"
              >
                <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user?.name}</span>
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      'absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-xl py-1.5',
                      isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200'
                    )}
                    role="menu"
                    aria-labelledby="user-menu-button"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm transition-colors',
                        isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-50'
                      )}
                      role="menuitem"
                    >
                      <User size={14} /> Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm transition-colors',
                        isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-50'
                      )}
                      role="menuitem"
                    >
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <hr className={cn('my-1', isDark ? 'border-[#2a2a3d]' : 'border-slate-200')} />
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
              <Link to="/login" className={cn(
                'text-sm font-medium px-3 py-1.5 rounded-lg transition-colors',
                isDark ? 'text-slate-300 hover:text-white hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'
              )}>
                Log in
              </Link>
              <Link to="/analyzer" className="btn-primary text-sm px-4 py-2">
                Analyze Review
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(v => !v)}
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

      {/* Mobile menu */}
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
              {visibleLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === link.to
                      ? 'text-purple-400 bg-purple-500/10'
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
                      <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={cn('text-sm font-medium', isDark ? 'text-slate-200' : 'text-slate-800')}>{user?.name}</span>
                    </div>
                    <Link to="/profile" onClick={() => setMobileOpen(false)}
                      className={cn('flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors', isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100')}>
                      <User size={14} /> Profile
                    </Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors">
                      <LogOut size={14} /> Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)}
                      className={cn('flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors', isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100')}>
                      <LogIn size={14} /> Log in
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)}
                      className="btn-primary w-full justify-center mt-1">
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
