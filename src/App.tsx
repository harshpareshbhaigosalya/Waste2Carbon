import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { Navbar } from './components/Navbar';
import { ProducerDashboard } from './components/producer/ProducerDashboard';
import { ProcessorDashboard } from './components/processor/ProcessorDashboard';
import { CertificateModal } from './components/CertificateModal';

const MainLayout: React.FC = () => {
  const { currentUser } = useApp();
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  // 1. If not logged in -> Show Clean Auth Screen
  if (!currentUser) {
    return <AuthScreen />;
  }

  // 2. If logged in for the first time without completing onboarding -> Show Onboarding Screen
  if (!currentUser.onboarded) {
    return <OnboardingScreen />;
  }

  // 3. User is fully onboarded -> Show dedicated dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentUser.role === 'producer' ? (
          <ProducerDashboard onOpenCertificate={() => setIsCertificateOpen(true)} />
        ) : (
          <ProcessorDashboard onOpenCertificate={() => setIsCertificateOpen(true)} />
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>W2C | Circular Carbon Ecosystem · IPCC MRV Standard</p>
      </footer>

      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
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
