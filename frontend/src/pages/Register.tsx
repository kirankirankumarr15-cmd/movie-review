import { useState } from 'react';
import { motion } from 'framer-motion';
import { Film, UserPlus, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }
    
    setIsLoading(true);
    try {
      await register(name, email, password, confirmPassword);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      if (err.data?.errors) {
        setErrors(err.data.errors);
      } else {
        toast.error(err?.message || 'Registration failed.');
      }
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
            Create an account
          </h1>
          <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Start tracking and analyzing movie sentiment
          </p>
        </div>

        <div className={cn(
          'rounded-2xl border p-8 shadow-xl',
          isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200'
        )}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="label">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className={cn('input', errors.name && 'error')}
                placeholder="John Doe"
                required
                disabled={isLoading}
              />
              {errors.name && <p className="text-xs text-red-400 mt-1.5">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={cn('input', errors.email && 'error')}
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
              {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={cn('input', errors.password && 'error')}
                placeholder="Min. 8 characters"
                required
                disabled={isLoading}
                minLength={8}
              />
              {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirm" className="label">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={cn('input', errors.confirmPassword && 'error')}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              {errors.confirmPassword && <p className="text-xs text-red-400 mt-1.5">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2"
            >
              {isLoading ? 'Creating account...' : <><UserPlus size={18} /> Sign up</>}
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
          Already have an account?{' '}
          <Link to="/login" className="text-purple-500 hover:text-purple-400 font-medium transition-colors">
            Log in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
