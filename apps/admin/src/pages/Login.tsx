import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail, Shield, AlertCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@spellbound.lk');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'OWNER' | 'MANAGER' | 'STAFF'>('OWNER');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in both email and password fields.');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, role);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError('Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 items-center justify-center text-white shadow-xl shadow-indigo-500/30 mb-3">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Spellbound</h1>
          <p className="text-sm text-slate-400 mt-1">Retail Administration & POS Command Center</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl shadow-slate-950">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Sign in to your account</h2>
            <p className="text-xs text-slate-400 mt-1">Enter your staff credentials to access the admin panel.</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="admin@spellbound.lk"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setResetSent(false);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Staff Role (Simulation Mode)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['OWNER', 'MANAGER', 'STAFF'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      role === r
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 shadow-sm'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Spellbound E-Commerce & POS System · Authorized Personnel Only
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2">Reset Password</h3>
            {resetSent ? (
              <div className="text-center py-4">
                <div className="inline-flex h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 items-center justify-center mb-3">
                  <Shield className="h-6 w-6" />
                </div>
                <p className="text-sm text-slate-300">Password reset instructions have been sent to your staff email.</p>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-xs text-slate-400">Enter your registered staff email address to receive reset instructions.</p>
                <input
                  type="email"
                  defaultValue={email}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-3 py-2 bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
