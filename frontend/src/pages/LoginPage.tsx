import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password recovery states
  const [viewMode, setViewMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState('');
  const [developerToken, setDeveloperToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setRecoveryStatus('');
    setDeveloperToken('');
    try {
      const res = await fetch(`${BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail || 'Recovery request failed.');
      }
      const data = await res.json();
      if (data.developer_token) {
        setDeveloperToken(data.developer_token);
      }
      setRecoveryStatus('Verification code has been successfully generated.');
      setTimeout(() => {
        setViewMode('reset');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to send recovery request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setRecoveryStatus('');
    try {
      const res = await fetch(`${BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          token: resetToken,
          new_password: newPassword
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail || 'Reset password failed.');
      }
      setRecoveryStatus('Password updated successfully! Redirecting...');
      setTimeout(() => {
        setViewMode('login');
        setError('');
        setRecoveryStatus('');
        setForgotEmail('');
        setResetToken('');
        setNewPassword('');
        setDeveloperToken('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
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
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl transition-all duration-300">
          
          {viewMode === 'login' && (
            <>
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
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Password</label>
                    <button type="button" onClick={() => setViewMode('forgot')}
                      className="text-xs text-lime-green hover:underline focus:outline-none">
                      Forgot Password?
                    </button>
                  </div>
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
            </>
          )}

          {viewMode === 'forgot' && (
            <>
              <div className="flex items-center gap-2 mb-6">
                <button type="button" onClick={() => setViewMode('login')} className="text-white/60 hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-white">Recover Password</h2>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-danger-red/10 border border-danger-red/30 text-danger-red text-sm">
                  {error}
                </div>
              )}
              {recoveryStatus && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-lime-green/10 border border-lime-green/30 text-lime-green text-sm">
                  {recoveryStatus}
                </div>
              )}

              <p className="text-xs text-white/60 mb-5 leading-relaxed">
                Enter your registered account email address. We will generate a secure verification token to reset your password.
              </p>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="e.g. amit@agroai.com"
                    className="mt-1 w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm outline-none focus:border-lime-green/50 focus:ring-1 focus:ring-lime-green/30 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg gradient-primary text-white font-semibold text-sm shadow-glow-green hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  {loading ? 'Sending Request…' : 'Generate Recovery Token'}
                </button>
              </form>
            </>
          )}

          {viewMode === 'reset' && (
            <>
              <div className="flex items-center gap-2 mb-6">
                <button type="button" onClick={() => setViewMode('forgot')} className="text-white/60 hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-white">Reset Password</h2>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-danger-red/10 border border-danger-red/30 text-danger-red text-sm">
                  {error}
                </div>
              )}
              {recoveryStatus && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-lime-green/10 border border-lime-green/30 text-lime-green text-sm">
                  {recoveryStatus}
                </div>
              )}

              {developerToken && (
                <div className="mb-4 p-4 rounded-lg bg-info-blue/10 border border-info-blue/30 text-info-blue text-xs font-mono space-y-1">
                  <div className="font-semibold uppercase text-[10px] tracking-wider text-white/70">Developer Demo Mode:</div>
                  <div>VERIFICATION TOKEN: <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded text-sm">{developerToken}</span></div>
                </div>
              )}

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Verification Token</label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={e => setResetToken(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="mt-1 w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm outline-none focus:border-lime-green/50 focus:ring-1 focus:ring-lime-green/30 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">New Password</label>
                  <div className="relative mt-1">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-12 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm outline-none focus:border-lime-green/50 focus:ring-1 focus:ring-lime-green/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg gradient-primary text-white font-semibold text-sm shadow-glow-green hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? 'Updating Password…' : 'Update Password'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
