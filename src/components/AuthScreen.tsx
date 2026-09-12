import React, { useState } from 'react';
import {
  Leaf,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
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
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center p-4 selection:bg-[#2D5A43] selection:text-white relative">
      {/* Soft warm ambient background blurs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#F4EEDF]/70 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#EDF6F0]/60 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2D5A43] text-white shadow-md font-black mb-2 border border-[#3D7457]">
            <Leaf className="w-7 h-7 text-[#E5C378]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1E21] tracking-tight">
            Waste2Carbon
          </h1>
          <p className="text-xs sm:text-sm text-[#575B62] max-w-xs mx-auto">
            Direct circular marketplace connecting organic waste generators with biochar & biogas conversion plants in India.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          {/* Tabs */}
          <div className="flex rounded-xl bg-[#F8F5EE] p-1 border border-[#E7E1D7]">
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                isRegister
                  ? 'bg-white text-[#1C1E21] shadow-2xs border border-[#E7E1D7]'
                  : 'text-[#828892] hover:text-[#1C1E21]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                !isRegister
                  ? 'bg-white text-[#1C1E21] shadow-2xs border border-[#E7E1D7]'
                  : 'text-[#828892] hover:text-[#1C1E21]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1C1E21] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#828892] absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@example.com"
                  required
                  className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1C1E21] focus:outline-none focus:border-[#2D5A43] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1E21] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#828892] absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1C1E21] focus:outline-none focus:border-[#2D5A43] focus:bg-white transition"
                />
              </div>
              <p className="text-[11px] text-[#828892] mt-1">
                Use at least 6 characters. For demo admin use <code className="text-[#9A6A15] font-bold">admin@gmail.com</code> / <code className="text-[#9A6A15] font-bold">admin123</code>
              </p>
            </div>

            {errorMessage && (
              <div className="bg-[#FBEAE9] border border-[#F5C2C0] text-[#9E2A2B] text-xs p-3 rounded-xl flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold text-xs py-3 rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : isRegister ? (
                <>
                  <span>Create Waste2Carbon Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="border-t border-[#F0ECE4] pt-3 text-center space-y-1.5">
            <span className="text-[10px] text-[#828892] uppercase tracking-widest font-bold block">
              Quick Test Credentials
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@gmail.com');
                  setPassword('admin123');
                  setIsRegister(false);
                }}
                className="bg-[#F8F5EE] hover:bg-[#F2ECE0] text-[#1C1E21] font-semibold px-2.5 py-1 rounded-lg border border-[#E7E1D7] transition cursor-pointer"
              >
                Fill Admin (admin@gmail.com)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {verificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1E21]/40 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white border border-[#E7E1D7] rounded-3xl p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EDF6F0] text-[#1D5E34] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#1C1E21]">Account Created!</h3>
            <p className="text-xs text-[#575B62]">
              Your profile for <strong>{verificationModal.email}</strong> is ready. Let's complete your onboarding profile.
            </p>
            <button
              onClick={() => setVerificationModal(null)}
              className="w-full bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition cursor-pointer"
            >
              Continue to Onboarding
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
