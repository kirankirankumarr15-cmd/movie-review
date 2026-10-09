import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, MessageSquare, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast.error(err?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0f] font-sans overflow-y-auto overflow-x-hidden">
      {/* Background Image & Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop)' }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent" />
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-80" />

      {/* Main Container */}
      <div className="relative z-10 w-full min-h-screen max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-24">
        
        {/* Left Side: Branding */}
        <div className="flex-1 w-full flex flex-col justify-center items-start pt-10 md:pt-0">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 md:mb-16">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 relative overflow-hidden">
              <MessageSquare size={20} className="text-white absolute z-10" />
              <div className="flex gap-[3px] absolute z-20 mt-1">
                <div className="w-1 h-1 bg-white rounded-sm" />
                <div className="w-1 h-1 bg-white rounded-sm" />
                <div className="w-1 h-1 bg-white rounded-sm" />
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Sense</span>
            </h1>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-[1.1] mb-6">
              Understand what audiences <br className="hidden md:block" />
              really feel.
            </h2>
            <p className="text-lg text-slate-300 mb-12 max-w-xl">
              AI-powered sentiment analysis for movie reviews.
            </p>

            <div className="flex items-center gap-6 text-sm font-medium">
              <div className="flex items-center gap-2.5 text-slate-200">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                Positive
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-600" />
              <div className="flex items-center gap-2.5 text-slate-200">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                Neutral
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-600" />
              <div className="flex items-center gap-2.5 text-slate-200">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                Negative
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-[420px] relative mt-10 md:mt-0 flex-shrink-0">
          <Link to="/" className="absolute -top-12 lg:-top-16 right-0 text-slate-400 hover:text-white flex items-center gap-2 text-sm transition-colors font-medium">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#0f0f16]/95 backdrop-blur-xl border border-white/5 rounded-[24px] p-8 shadow-2xl"
          >
            <div className="mb-8">
              <h3 className="text-[28px] font-bold text-white mb-2 font-display">Welcome back</h3>
              <p className="text-slate-400 text-sm">Sign in to continue to CineSense.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#161622] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-[#161622] border border-white/5 rounded-xl py-3 pl-10 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only" 
                    />
                    <div className="w-4 h-4 rounded border border-slate-600 bg-[#161622] peer-checked:bg-purple-600 peer-checked:border-purple-600 transition-colors flex items-center justify-center">
                      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-[#f43f5e] via-[#d946ef] to-[#8b5cf6] hover:from-[#e11d48] hover:via-[#c026d3] hover:to-[#7c3aed] text-white rounded-xl font-medium text-sm transition-all shadow-[0_0_20px_rgba(217,70,239,0.25)] hover:shadow-[0_0_25px_rgba(217,70,239,0.4)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
                {!isLoading && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/5"></div>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">OR</span>
              <div className="flex-1 h-px bg-white/5"></div>
            </div>

            <Link 
              to="/analyzer" 
              className="w-full py-3.5 px-4 bg-[#161622] hover:bg-[#1a1a28] border border-white/5 rounded-xl text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <User size={16} className="text-slate-400" />
              Continue as Guest
            </Link>

            <p className="mt-8 text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Create account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
