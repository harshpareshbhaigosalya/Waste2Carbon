import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { Navbar } from './components/Navbar';
import { ProducerDashboard } from './components/producer/ProducerDashboard';
import { ProcessorDashboard } from './components/processor/ProcessorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CertificateModal } from './components/CertificateModal';
import { ProfileModal } from './components/ProfileModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { Sparkles, Mic } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser } = useApp();
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // 1. If not logged in -> Show Clean Auth Screen
  if (!currentUser) {
    return <AuthScreen />;
  }

  // 2. If logged in for the first time without completing onboarding -> Show Onboarding Screen (Admin bypasses onboarding)
  if (!currentUser.onboarded && currentUser.role !== 'admin') {
    return <OnboardingScreen />;
  }

  // 3. User is logged in -> Show appropriate dashboard
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-600 selection:text-white relative">
      <Navbar
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentUser.role === 'admin' ? (
          <AdminDashboard />
        ) : currentUser.role === 'producer' ? (
          <ProducerDashboard
            onOpenCertificate={() => setIsCertificateOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
          />
        ) : (
          <ProcessorDashboard
            onOpenCertificate={() => setIsCertificateOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
          />
        )}
      </main>

      {/* Floating Hero Quick Voice Assistant FAB (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-black px-5 py-3.5 rounded-full shadow-2xl hover:shadow-amber-400/40 transition transform hover:scale-105 border-2 border-white cursor-pointer pulse-glow"
        >
          <Mic className="w-5 h-5 text-emerald-950" />
          <span className="text-xs sm:text-sm">AgriCarbon AI Voice</span>
          <span className="w-2 h-2 rounded-full bg-emerald-700 animate-ping" />
        </button>
      </div>

      <footer className="border-t border-amber-200/60 bg-white/70 py-6 text-center text-xs text-slate-500">
        <p>W2C | Circular Carbon Ecosystem · IPCC MRV Standard · India</p>
      </footer>

      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
