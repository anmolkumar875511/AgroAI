/**
 * NEW FILE: src/pages/LoginPage.tsx
 *
 * What changed: New login page. Previously the app had no auth — clicking
 * "Launch Dashboard" on the landing page went straight in. Now users must
 * log in with email + password which calls POST /api/v1/auth/login.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'agent' | 'manager') => {
    if (role === 'agent') {
      setEmail('amit@agroai.com');
      setPassword('password123');
    } else {
      setEmail('manager@agroai.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-deep-forest flex items-center justify-center px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-deep-forest via-dark-surface to-deep-forest" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Leaf className="w-7 h-7 text-lime-green" />
            <span className="text-3xl font-bold text-white tracking-tight">AgroAI</span>
          </div>
          <p className="text-white/50 text-sm">Farmer First · Field Intelligence Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-danger-red/10 border border-danger-red/30 text-danger-red text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@agroai.com"
                className="mt-1 w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm outline-none focus:border-lime-green/50 focus:ring-1 focus:ring-lime-green/30 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm outline-none focus:border-lime-green/50 focus:ring-1 focus:ring-lime-green/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg gradient-primary text-white font-semibold text-sm shadow-glow-green hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-white/40 text-center mb-3">Demo credentials</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fillDemo('agent')}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs hover:bg-white/10 transition-colors text-left"
              >
                <div className="font-semibold text-lime-green">Field Agent</div>
                <div>amit@agroai.com</div>
              </button>
              <button
                onClick={() => fillDemo('manager')}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs hover:bg-white/10 transition-colors text-left"
              >
                <div className="font-semibold text-info-blue">Manager</div>
                <div>manager@agroai.com</div>
              </button>
            </div>
            <p className="text-xs text-white/30 text-center mt-2">Password: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
