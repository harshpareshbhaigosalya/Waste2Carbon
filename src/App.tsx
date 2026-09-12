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

const MainLayout: React.FC = () => {
  const { currentUser } = useApp();
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar onOpenProfile={() => setIsProfileOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentUser.role === 'admin' ? (
          <AdminDashboard />
        ) : currentUser.role === 'producer' ? (
          <ProducerDashboard
            onOpenCertificate={() => setIsCertificateOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
          />
        ) : (
          <ProcessorDashboard
            onOpenCertificate={() => setIsCertificateOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
          />
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
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
