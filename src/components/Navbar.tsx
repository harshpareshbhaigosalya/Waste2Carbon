import React, { useState } from 'react';
import { Leaf, Award, User, LogOut, ChevronDown, PlusCircle, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { currentUser, allUsers, switchUser, signOut } = useApp();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white font-mono tracking-tight">W2C</span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline ml-2">
              Waste to Carbon Platform
            </span>
          </div>
        </div>

        {/* User Account Bar */}
        <div className="flex items-center gap-3">
          {/* Carbon Credit Balance Pill */}
          <div className="bg-emerald-950/80 border border-emerald-800/80 px-3 py-1.5 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-inner">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>{currentUser.carbon_credits_balance}</span>
            <span className="text-[10px] text-emerald-400/80 font-normal hidden sm:inline">Credits</span>
          </div>

          {/* Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="max-w-[130px] truncate">{currentUser.full_name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 uppercase font-bold">
                {currentUser.role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in duration-100">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
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
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-white truncate max-w-[140px]">{u.full_name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{u.role}</p>
                    </div>
                    {currentUser.id === u.id && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </button>
                ))}

                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <button
                    onClick={() => {
                      signOut();
                      setAccountMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <span>Create / Log In Another User</span>
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setAccountMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-rose-400 hover:bg-rose-950/40 transition"
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
