import React, { useState } from 'react';
import { Leaf, ShieldCheck, Award, User, RefreshCw, LogIn, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenOnboarding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenOnboarding }) => {
  const { currentUser, switchRole } = useApp();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'producer':
        return 'Waste Producer / Seller';
      case 'processor':
        return 'Conversion Facility / Processor';
      case 'admin':
        return 'Platform Supervisor / Admin';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'producer':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'processor':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'admin':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-900/30">
            <Leaf className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white font-mono">W2C</span>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Waste-to-Carbon
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden md:block">
              Circular Carbon Ecosystem & MRV Tracker
            </p>
          </div>
        </div>

        {/* Right Section: Role Switcher & User Stats */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Role Switcher for Demo / Testing */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
                currentUser ? getRoleColor(currentUser.role) : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-current opacity-80" />
              <span className="hidden sm:inline text-xs text-slate-400">View as:</span>
              <span className="font-semibold">{currentUser ? currentUser.role.toUpperCase() : 'Select Role'}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  Switch User Perspective
                </div>
                <button
                  onClick={() => {
                    switchRole('producer');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                    currentUser?.role === 'producer' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-100">Waste Producer / Seller</p>
                    <p className="text-[10px] text-slate-400">Farms, food industries, municipalities</p>
                  </div>
                  {currentUser?.role === 'producer' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
                <button
                  onClick={() => {
                    switchRole('processor');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 mt-1 rounded-lg text-left transition-all ${
                    currentUser?.role === 'processor' ? 'bg-amber-950/60 text-amber-300 border border-amber-800' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-100">Waste Processor</p>
                    <p className="text-[10px] text-slate-400">Biochar pyrolysis & biogas plants</p>
                  </div>
                  {currentUser?.role === 'processor' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </button>
                <button
                  onClick={() => {
                    switchRole('admin');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 mt-1 rounded-lg text-left transition-all ${
                    currentUser?.role === 'admin' ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-100">Platform Admin</p>
                    <p className="text-[10px] text-slate-400">GIS network map & carbon credit ledger</p>
                  </div>
                  {currentUser?.role === 'admin' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Carbon Credit Balance */}
          {currentUser && (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-700/60 px-3 py-1.5 rounded-lg text-emerald-300 text-xs sm:text-sm font-semibold shadow-inner">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>{currentUser.carbon_credits_balance.toFixed(1)}</span>
              <span className="text-[11px] text-emerald-400/80 font-normal hidden sm:inline">tCO2e Credits</span>
            </div>
          )}

          {/* User Account / Profile Button */}
          {currentUser ? (
            <button
              onClick={onOpenOnboarding}
              title="Edit Profile"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-200 text-xs transition"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span className="max-w-[110px] truncate hidden md:inline font-medium">
                {currentUser.full_name}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-lg shadow-emerald-900/40"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
