import React, { useState } from 'react';
import { Leaf, LogIn, UserPlus, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthScreen: React.FC = () => {
  const { registerAccount, loginAccount, allUsers, switchUser } = useApp();
  const [isRegister, setIsRegister] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    setIsLoading(true);

    if (isRegister) {
      const res = await registerAccount(email, password);
      setIsLoading(false);
      if (res.success) {
        setNotification({
          type: 'success',
          text: res.message,
        });
      } else {
        setNotification({ type: 'error', text: res.message });
      }
    } else {
      const res = await loginAccount(email, password);
      setIsLoading(false);
      if (!res.success) {
        setNotification({ type: 'error', text: res.message });
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
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20 font-bold mb-2">
            <Leaf className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">W2C | Waste to Carbon</h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Connect waste generators with conversion plants and earn certified carbon credits.
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
                setNotification(null);
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
                setNotification(null);
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

          {/* Alert Message */}
          {notification && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                notification.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/70 border-rose-800 text-rose-300'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              )}
              <span className="leading-relaxed">{notification.text}</span>
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
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <span>{isLoading ? 'Processing...' : isRegister ? 'Create Account & Continue' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Account Switcher if accounts already exist on machine */}
          {allUsers.length > 0 && (
            <div className="pt-3 border-t border-slate-800 text-center space-y-2">
              <span className="text-[11px] text-slate-500 font-medium block">
                Accounts created on this device:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => switchUser(u.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 border border-slate-700 transition"
                  >
                    {u.full_name} ({u.role})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
