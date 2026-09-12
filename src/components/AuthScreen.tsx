import React, { useState } from 'react';
import { Leaf, LogIn, UserPlus, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthScreen: React.FC = () => {
  const { registerAccount, loginAccount, allUsers, switchUser } = useApp();
  const [isRegister, setIsRegister] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationModal, setVerificationModal] = useState<{ open: boolean; email: string; requiresVerification: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    if (isRegister) {
      const res = await registerAccount(email, password);
      setIsLoading(false);
      if (res.success) {
        setVerificationModal({
          open: true,
          email,
          requiresVerification: !!res.requiresVerification,
        });
      } else {
        setErrorMessage(res.message);
      }
    } else {
      const res = await loginAccount(email, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute top-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20 font-bold mb-2">
            <Leaf className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">W2C | Waste to Carbon</h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Direct marketplace connecting organic waste generators with biochar & biogas conversion plants.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                isRegister
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Register
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                !isRegister
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Sign In
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-rose-800 bg-rose-950/70 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. farmer@farm.com or plant@biochar.com"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-1"
            >
              <span>{isLoading ? 'Processing...' : isRegister ? 'Register & Verify Email' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Switch to existing Supabase users if created */}
          {allUsers.length > 0 && (
            <div className="pt-3 border-t border-slate-800 text-center space-y-2">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center justify-center gap-1">
                <RefreshCw className="w-3 h-3 text-emerald-400" />
                <span>Existing Database Profiles:</span>
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => switchUser(u.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] font-semibold text-emerald-300 border border-slate-800 transition"
                  >
                    {u.full_name} ({u.role})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explicit Registration Confirmation Modal */}
      {verificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-white">Registration Successful!</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your account for <strong className="text-emerald-400">{verificationModal.email}</strong> has been registered in the Supabase database.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs text-left space-y-2">
              <div className="flex items-start gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Email Verification:</strong> A verification link was dispatched by Supabase. Please check your inbox / spam folder.
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6">
                Next, proceed to complete your one-time onboarding profile (Business Name, Phone Number, and Address).
              </p>
            </div>

            <button
              onClick={() => setVerificationModal(null)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-950 transition text-sm flex items-center justify-center gap-2"
            >
              <span>Continue to Profile Onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
