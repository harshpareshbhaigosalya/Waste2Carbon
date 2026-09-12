import React, { useState } from 'react';
import {
  Leaf,
  Award,
  User,
  LogOut,
  ChevronDown,
  PlusCircle,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  onOpenProfile?: () => void;
  onOpenVoiceAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProfile, onOpenVoiceAssistant }) => {
  const { currentUser, allUsers, switchUser, signOut } = useApp();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20">
            <Leaf className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight font-mono">W2C</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Circular Carbon
              </span>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                  Admin
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              Waste to Carbon Ecosystem · India
            </span>
          </div>
        </div>

        {/* Action Controls & User Account Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hero Feature: Voice AI Assistant Trigger */}
          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-500 hover:to-amber-400 text-slate-950 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 border border-amber-300 cursor-pointer"
              title="Speak in Hindi / English / Any language"
            >
              <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
              <span className="hidden md:inline">AgriCarbon AI Voice</span>
              <span className="md:hidden">AI Voice</span>
            </button>
          )}

          {/* Carbon Credit Balance Pill */}
          {!isAdmin && (
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <Award className="w-4 h-4 text-amber-600" />
              <span className="font-black text-emerald-700">{currentUser.carbon_credits_balance}</span>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">Credits</span>
            </div>
          )}

          {/* Profile Trigger Button */}
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 transition"
              title="View & Edit Profile"
            >
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Profile</span>
            </button>
          )}

          {/* Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 transition shadow-2xs"
            >
              <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-rose-500' : 'bg-emerald-600'}`} />
              <span className="max-w-[110px] sm:max-w-[140px] truncate">{currentUser.full_name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-extrabold ${isAdmin ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                {currentUser.role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs space-y-1 animate-in fade-in duration-100">
                <div className="px-3 py-1.5 text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                  Switch Account (Test Flow)
                </div>

                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setAccountMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition ${
                      currentUser.id === u.id
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900 truncate max-w-[160px]">{u.full_name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{u.role}</p>
                    </div>
                    {currentUser.id === u.id && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                  </button>
                ))}

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <button
                    onClick={() => {
                      signOut();
                      setAccountMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-700" />
                    <span>Create / Log In Another User</span>
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setAccountMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-rose-600 hover:bg-rose-50 transition font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
