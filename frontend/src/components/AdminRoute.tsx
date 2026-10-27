import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingState from './LoadingState';

export const ADMIN_EMAIL = 'kirankirankumarr15@gmail.com';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message="Checking administrator privileges…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#161622] border-2 border-rose-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xl">
            ✕
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
              403 Forbidden
            </span>
            <h2 className="text-xl font-bold text-white">Admin Privileges Required</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Admin tools are reserved exclusively for authorized administrators. Your current account ({user?.email}) is not authorized.
            </p>
          </div>
          <a
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all shadow-md shadow-purple-600/30"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
