import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/LandingPage';
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
  const { currentUser, isLoading } = useApp();
  const [showLanding, setShowLanding] = useState(true);
  const [authDefaultRegister, setAuthDefaultRegister] = useState(true);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // 0. Show seamless loading splash if session is hydrating
  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#2D5A43] text-[#E5C378] flex items-center justify-center font-black shadow-md border border-[#3D7457] animate-pulse">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-[#1C1E21] tracking-tight">Waste2Carbon</h3>
            <p className="text-xs text-[#828892]">Restoring secure session...</p>
          </div>
        </div>
      </div>
    );
  }

  // 1. If not logged in:
  // Show high-converting landing page first; user can toggle to auth
  if (!currentUser) {
    if (showLanding) {
      return (
        <LandingPage
          onGetStarted={() => {
            setAuthDefaultRegister(true);
            setShowLanding(false);
          }}
          onSignIn={() => {
            setAuthDefaultRegister(false);
            setShowLanding(false);
          }}
        />
      );
    }
    return (
      <AuthScreen
        onBackToLanding={() => setShowLanding(true)}
        defaultIsRegister={authDefaultRegister}
      />
    );
  }

  // 2. If logged in but requested to view landing page
  if (showLanding && !currentUser.onboarded) {
    // New unboarded user visiting landing can proceed directly to onboarding
  }

  // If logged in and explicitly opened landing from Navbar
  if (showLanding && currentUser) {
    return (
      <LandingPage
        onGetStarted={() => setShowLanding(false)}
        onSignIn={() => setShowLanding(false)}
      />
    );
  }

  // 3. If logged in for the first time without completing onboarding -> Show Onboarding Screen (Admin bypasses onboarding)
  if (!currentUser.onboarded && currentUser.role !== 'admin') {
    return <OnboardingScreen />;
  }

  // 4. User is logged in -> Show appropriate dashboard
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1E21] flex flex-col selection:bg-[#2D5A43] selection:text-white relative">
      <Navbar
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
        onOpenLanding={() => setShowLanding(true)}
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

      {/* Floating Quick Voice Assistant FAB (Bottom Right) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30">
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="flex items-center gap-2 sm:gap-2.5 bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold p-3 sm:px-5 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105 border border-[#43755A] cursor-pointer"
          title="Open AI Voice Assistant"
          aria-label="Open AI Voice Assistant"
        >
          <div className="w-6 h-6 rounded-full bg-[#3D7457] flex items-center justify-center text-white shrink-0">
            <Mic className="w-3.5 h-3.5" />
          </div>
          <span className="hidden sm:inline text-xs sm:text-sm font-semibold tracking-tight">AI Voice Assistant</span>
          <span className="w-2 h-2 rounded-full bg-[#E5C378] animate-pulse" />
        </button>
      </div>

      <footer className="border-t border-[#E7E1D7] bg-[#FAF8F5] py-6 text-center text-xs text-[#828892]">
        <p>Waste2Carbon · Circular Carbon Ecosystem · IPCC MRV Standard · India</p>
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
