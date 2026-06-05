/**
 * Password Reset Page
 * FEATURE: Complete password reset flow as per audit recommendation
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';

export default function PasswordResetPage() {
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/password-reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        toast.success('Reset link sent!');
        // For demo: show token directly (in production, sent via email)
        if (data.reset_token) {
          setToken(data.reset_token);
          setStep('confirm');
        }
      }
    } catch {
      toast.error('Failed to send reset request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/password-reset-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setIsSuccess(true);
        toast.success('Password updated successfully!');
      } else {
        toast.error(data.detail || 'Failed to reset password');
      }
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-deep-forest via-charcoal-black to-deep-forest p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-lime-green/20 mb-4">
            <KeyRound className="w-7 h-7 text-lime-green" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-sage-green mt-1">AgroAI Field Intelligence</p>
        </div>

        {isSuccess ? (
          <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-16 h-16 text-lime-green mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Password Updated!</h2>
              <p className="text-sage-green mb-6">
                Your password has been reset successfully.
              </p>
              <Link to="/login">
                <Button className="w-full bg-lime-green hover:bg-lime-green/90 text-deep-forest">
                  Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : step === 'request' ? (
          <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Forgot Password?</CardTitle>
              <CardDescription className="text-sage-green">
                Enter your email to receive a password reset link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sage-green">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/[0.05] border-white/10 text-white placeholder:text-sage-green/50"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-lime-green hover:bg-lime-green/90 text-deep-forest"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-lime-green hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-white/5 bg-white/[0.03] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Set New Password</CardTitle>
              <CardDescription className="text-sage-green">
                Enter your new password below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConfirmReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token" className="text-sage-green">Reset Token</Label>
                  <Input
                    id="token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="bg-white/[0.05] border-white/10 text-white"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sage-green">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-white/[0.05] border-white/10 text-white placeholder:text-sage-green/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sage-green">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/[0.05] border-white/10 text-white placeholder:text-sage-green/50"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-lime-green hover:bg-lime-green/90 text-deep-forest"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setStep('request')}
                  className="text-sm text-lime-green hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Request again
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
