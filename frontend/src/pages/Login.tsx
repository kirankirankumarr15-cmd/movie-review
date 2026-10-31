import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface LoginProps {
  defaultTab?: 'signin' | 'signup';
}

export default function Login({ defaultTab }: LoginProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'signin' | 'signup') || defaultTab || 'signin';
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'signin' || tabParam === 'signup') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const switchTab = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setSearchParams(tab === 'signup' ? { tab: 'signup' } : {});
  };

  // 1-Click Fast Access handler
  const handleFastLogin = async (role: 'reviewer' | 'admin') => {
    setIsLoading(true);
    try {
      if (role === 'admin') {
        const adminEmail = 'kirankirankumarr15@gmail.com';
        const adminPass = '12345678';
        setEmail(adminEmail);
        setPassword(adminPass);
        toast.info('Authenticating as Super Admin…');
        await login(adminEmail, adminPass);
        toast.success('Welcome back, Super Admin!');
        const dest = from === '/login' || from === '/register' ? '/admin/diagnostics' : from;
        navigate(dest, { replace: true });
      } else {
        const reviewerEmail = 'chinnu123@gmail.com';
        const reviewerPass = '12345678';
        setEmail(reviewerEmail);
        setPassword(reviewerPass);
        toast.info('Authenticating as Reviewer…');
        await login(reviewerEmail, reviewerPass);
        toast.success('Welcome back, Reviewer!');
        const dest = from === '/login' || from === '/register' ? '/dashboard' : from;
        navigate(dest, { replace: true });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Fast login failed. Please verify backend service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'signin') {
      if (!email || !password) {
        toast.error('Please enter both email and password.');
        return;
      }

      setIsLoading(true);
      try {
        await login(email, password);
        toast.success('Successfully logged in!');
        navigate(from, { replace: true });
      } catch (err: any) {
        toast.error(err?.message || 'Login failed. Invalid credentials.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Sign up flow
      if (!name.trim()) {
        toast.error('Please enter your full name.');
        return;
      }
      if (!email) {
        toast.error('Please enter a valid email address.');
        return;
      }
      if (password.length < 8) {
        toast.error('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }

      setIsLoading(true);
      try {
        await register(name, email, password, confirmPassword);
        toast.success('Account created successfully! Welcome to CineSense.');
        navigate('/dashboard', { replace: true });
      } catch (err: any) {
        toast.error(err?.message || 'Registration failed.');
      } finally {
        setIsLoading(false);
      }
    }
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
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center mb-4"
        >
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
        </motion.div>

        {/* Center Interactive Glassmorphic Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[460px] bg-[#0c0b16]/85 backdrop-blur-2xl border border-purple-500/30 rounded-[28px] p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(168,85,247,0.18)] text-white relative"
        >
          {/* Section 1: FAST 1-CLICK ACCESS */}
          <div className="text-center text-[10px] font-bold tracking-[0.22em] text-slate-400 uppercase mb-3">
            FAST 1-CLICK ACCESS
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Reviewer 1-Click Button */}
            <button
              type="button"
              onClick={() => handleFastLogin('reviewer')}
              disabled={isLoading}
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
              onClick={() => handleFastLogin('admin')}
              disabled={isLoading}
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
              onClick={() => switchTab('signin')}
              className={cn(
                'py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                activeTab === 'signin'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchTab('signup')}
              className={cn(
                'py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Create Account
            </button>
          </div>

          {/* Section 4: Auth Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5">
            <AnimatePresence mode="wait">
              {activeTab === 'signup' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5"
                >
                  <label className="text-xs font-medium text-slate-300 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon size={16} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-[#141424] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      required={activeTab === 'signup'}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#141424] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  required
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={activeTab === 'signup' ? 'Min. 8 characters' : '••••••••'}
                  className="w-full bg-[#141424] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  required
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

            {/* Confirm Password (only on signup) */}
            <AnimatePresence mode="wait">
              {activeTab === 'signup' && (
                <motion.div
                  key="confirm-password-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5"
                >
                  <label className="text-xs font-medium text-slate-300 block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#141424] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      required={activeTab === 'signup'}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-[#d946ef] via-[#ec4899] to-[#8b5cf6] hover:from-[#c026d3] hover:via-[#db2777] hover:to-[#7c3aed] text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-[0_0_25px_rgba(236,72,153,0.35)] hover:shadow-[0_0_35px_rgba(236,72,153,0.55)] flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <span>Processing…</span>
              ) : (
                <>
                  <span>
                    {activeTab === 'signin' ? 'Sign In & Enter' : 'Create Account & Enter'}
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

          {/* Section 6: Guest & Home Navigation */}
          <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <Link
              to="/"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ArrowLeft size={13} /> Back to Home
            </Link>
            <Link
              to="/analyzer"
              className="hover:text-purple-300 font-medium transition-colors"
            >
              Continue as Guest →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
