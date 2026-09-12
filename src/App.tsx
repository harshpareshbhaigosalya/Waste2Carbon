import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ProducerDashboard } from './components/producer/ProducerDashboard';
import { ProcessorDashboard } from './components/processor/ProcessorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { CertificateModal } from './components/CertificateModal';
import { Sprout, Factory, ShieldCheck, Leaf, Globe, ArrowUpRight } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, switchRole } = useApp();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Role Navigation Bar for Fast Switching & Layperson Clarity */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 sticky top-[61px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider hidden sm:inline">
              Active Dashboard:
            </span>
            <button
              onClick={() => switchRole('producer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                currentUser?.role === 'producer'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>1. Waste Producer / Seller</span>
            </button>

            <button
              onClick={() => switchRole('processor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                currentUser?.role === 'processor'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Factory className="w-4 h-4" />
              <span>2. Conversion Facility</span>
            </button>

            <button
              onClick={() => switchRole('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                currentUser?.role === 'admin'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>3. GIS & MRV Registry</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>IPCC Emission Model Active · Supabase Connected</span>
          </div>
        </div>
      </div>

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentUser?.role === 'producer' && (
          <ProducerDashboard onOpenCertificate={() => setIsCertificateOpen(true)} />
        )}
        {currentUser?.role === 'processor' && (
          <ProcessorDashboard onOpenCertificate={() => setIsCertificateOpen(true)} />
        )}
        {currentUser?.role === 'admin' && (
          <AdminDashboard onOpenCertificate={() => setIsCertificateOpen(true)} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-8 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              <Leaf className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white text-sm">W2C | Waste-to-Carbon</span>
            <span className="text-slate-500">· Circular Carbon Ecosystem</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
            <span>Standard: IPCC Guidelines & European Biochar Certificate (EBC)</span>
            <span>Database: Supabase PostgreSQL</span>
            <a
              href="https://github.com/harshpareshbhaigosalya/Waste2Carbon.git"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:underline font-semibold"
            >
              <span>GitHub Repository</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} W2C Protocol. Built for climate impact.
          </p>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

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
