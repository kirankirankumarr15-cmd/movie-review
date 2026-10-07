import { useState } from 'react';
import { motion } from 'framer-motion';
import { Film, LogIn, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <main className={cn('min-h-screen flex items-center justify-center py-20 px-4', isDark ? 'bg-[#0a0a0f]' : 'bg-slate-50')}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600 shadow-glow mb-4 hover:scale-105 transition-transform">
            <Film size={24} className="text-white" />
          </Link>
          <h1 className={cn('font-display text-3xl font-bold mb-2', isDark ? 'text-white' : 'text-slate-900')}>
            Welcome back
          </h1>
          <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Log in to access your dashboard and history
          </p>
        </div>

        <div className={cn(
          'rounded-2xl border p-8 shadow-xl',
          isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200'
        )}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2"
            >
              {isLoading ? 'Logging in...' : <><LogIn size={18} /> Log in</>}
            </button>
          </form>
          
          <div className="divider"></div>
          
          <Link to="/analyzer" className={cn(
            'flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium rounded-lg transition-colors',
            isDark ? 'text-slate-300 hover:bg-[#2a2a3d]' : 'text-slate-600 hover:bg-slate-100'
          )}>
            Continue as Guest <ArrowRight size={16} />
          </Link>
        </div>

        <p className={cn('text-center text-sm mt-8', isDark ? 'text-slate-400' : 'text-slate-500')}>
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-500 hover:text-purple-400 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
