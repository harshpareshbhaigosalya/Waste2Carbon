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
  Globe,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  onOpenProfile?: () => void;
  onOpenVoiceAssistant?: () => void;
  onOpenLanding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProfile, onOpenVoiceAssistant, onOpenLanding }) => {
  const { currentUser, allUsers, switchUser, signOut } = useApp();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  return (
    <nav className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7E1D7] px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D5A43] text-white flex items-center justify-center font-black shadow-xs border border-[#3D7457]">
            <Leaf className="w-5 h-5 text-[#E5C378]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-[#1C1E21] tracking-tight">Waste2Carbon</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EDF6F0] text-[#1D5E34] border border-[#BCE1C8]">
                Circular Carbon
              </span>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FBEAE9] text-[#9E2A2B] border border-[#F5C2C0]">
                  Admin
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#828892] font-medium hidden sm:inline">
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
              className="flex items-center gap-2 bg-[#F8F5EE] hover:bg-[#F2ECE0] text-[#2D5A43] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold border border-[#D6CEC2] shadow-2xs transition transform hover:-translate-y-0.5 cursor-pointer"
              title="Speak in Hindi / English / Any language"
            >
              <Sparkles className="w-4 h-4 text-[#9A6A15]" />
              <span className="hidden md:inline">AI Voice Assistant</span>
              <span className="md:hidden">Voice</span>
            </button>
          )}

          {/* Carbon Credit Balance Pill */}
          {!isAdmin && (
            <div className="bg-white border border-[#E7E1D7] px-3 py-1.5 rounded-xl text-[#1C1E21] text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <Award className="w-4 h-4 text-[#9A6A15]" />
              <span className="font-black text-[#2D5A43] tabular-nums">{currentUser.carbon_credits_balance}</span>
              <span className="text-[10px] text-[#828892] font-medium hidden sm:inline">Credits</span>
            </div>
          )}

          {/* Profile Trigger Button */}
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 bg-white hover:bg-[#F8F5EE] border border-[#E7E1D7] px-3 py-1.5 rounded-xl text-xs font-bold text-[#575B62] transition cursor-pointer"
              title="View & Edit Profile"
            >
              <User className="w-3.5 h-3.5 text-[#2D5A43]" />
              <span className="hidden sm:inline">Profile</span>
            </button>
          )}

          {/* Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-2 bg-white hover:bg-[#F8F5EE] border border-[#E7E1D7] px-3 py-1.5 rounded-xl text-xs font-bold text-[#1C1E21] transition shadow-2xs cursor-pointer"
            >
              <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-[#9E2A2B]' : 'bg-[#2D5A43]'}`} />
              <span className="max-w-[110px] sm:max-w-[140px] truncate">{currentUser.full_name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${isAdmin ? 'bg-[#FBEAE9] text-[#9E2A2B]' : 'bg-[#F4F0E8] text-[#575B62]'}`}>
                {currentUser.role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#828892]" />
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E7E1D7] rounded-2xl shadow-xl p-2 z-50 text-xs space-y-1 animate-in fade-in duration-100">
                <div className="px-3 py-1.5 text-[10px] uppercase font-extrabold tracking-wider text-[#828892]">
                  Switch Account (Demo Flow)
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
                        ? 'bg-[#EDF6F0] text-[#1D5E34] border border-[#BCE1C8] font-bold'
                        : 'hover:bg-[#F8F5EE] text-[#575B62]'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-[#1C1E21] truncate max-w-[160px]">{u.full_name}</p>
                      <p className="text-[10px] text-[#828892] capitalize">{u.role}</p>
                    </div>
                    {currentUser.id === u.id && <div className="w-1.5 h-1.5 rounded-full bg-[#2D5A43]" />}
                  </button>
                ))}

                <div className="pt-2 border-t border-[#F0ECE4] space-y-1">
                  {onOpenLanding && (
                    <button
                      onClick={() => {
                        onOpenLanding();
                        setAccountMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[#2D5A43] hover:bg-[#EDF6F0] font-semibold transition cursor-pointer"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Platform Overview / Landing</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setAccountMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[#575B62] hover:text-[#1C1E21] hover:bg-[#F8F5EE] transition cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-[#2D5A43]" />
                    <span>Create / Log In Another User</span>
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setAccountMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[#9E2A2B] hover:bg-[#FBEAE9] transition font-bold cursor-pointer"
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
