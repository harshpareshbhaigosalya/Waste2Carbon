import React, { useState } from 'react';
import {
  Leaf,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Truck,
  Layers,
  Cpu,
  Scan,
  ShieldCheck,
  Fuel,
  Receipt,
  Flame,
  Award,
  Users,
  ChevronDown,
  Compass,
  Zap,
  Globe,
  DollarSign,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Clock,
  BarChart3,
  Building2,
  Sprout,
  Check,
  Navigation as NavigationIcon,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  const [activeTab, setActiveTab] = useState<'farmers' | 'buyers' | 'carbon'>('farmers');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    { label: 'Biomass Aggregated', value: '12,450+', unit: 'Metric Tons', icon: Sprout, color: '#2D5A43' },
    { label: 'Direct Farmer Payouts', value: '₹3.18 Cr', unit: 'INR Paid Out', icon: DollarSign, color: '#D4A34F' },
    { label: 'Stubble Burning Abated', value: '18,675', unit: 'Tons CO2e', icon: ShieldCheck, color: '#2D5A43' },
    { label: 'Diesel Logistics Saved', value: '41.2%', unit: 'Fuel Reductions', icon: Fuel, color: '#D4A34F' },
  ];

  const teamMembers = [
    { name: 'Harsh Gosaliya', role: 'Full-Stack Architecture & AI Vision Engine', initials: 'HG' },
    { name: 'Purav Doshi', role: 'GIS Cluster Optimizer & Logistics Algorithms', initials: 'PD' },
    { name: 'Aman Panchal', role: 'IPCC Carbon Ledger & Financial Settlement', initials: 'AP' },
    { name: 'Ummar Mansuri', role: 'UI/UX Design Systems & Frontend Engineering', initials: 'UM' },
  ];

  const faqs = [
    {
      q: 'How does Waste2Carbon eliminate stubble burning in practice?',
      a: 'Instead of burning crop residue during the tight 15-day window between paddy harvest and wheat sowing, farmers take a quick photo of their stubble heaps on Waste2Carbon. Our AI immediately grades moisture and quality, and our GIS engine clusters neighboring farms to dispatch a consolidated 10-ton baler truck, paying farmers ₹2,500 - ₹3,800/ton upfront.',
    },
    {
      q: 'How does the AI Computer Vision Quality Assay work?',
      a: 'When an image is captured or uploaded, our neural assay model analyzes surface reflectance, moisture saturation gradients, and detects non-biodegradable synthetic polymers (plastics/soil inerts). It automatically assigns a standardized Grade A, B, or C certification so industrial plants can price transparently without lab delays.',
    },
    {
      q: 'Why is GIS clustering essential for biomass logistics?',
      a: 'Transporting individual 1-ton or 2-ton farm batches across 30+ km is economically unviable due to high diesel costs. Waste2Carbon groups nearby micro-farms into a single consolidated loop using Traveling Salesperson Problem (TSP) optimization, cutting transit miles by up to 40% and making bulk bio-energy profitable.',
    },
    {
      q: 'How does Waste2Carbon monetize as a business?',
      a: 'We operate on a 4-pillar monetization model: (1) A 2.5%–4% marketplace transaction fee on fulfilled biomass deliveries, (2) SaaS dispatch licenses for Bio-CNG/biorefining fleets, (3) Lab-grade AI quality inspection API subscriptions, and (4) A 15% brokerage commission on IPCC-certified voluntary carbon credits retired by ESG enterprises.',
    },
    {
      q: 'How are carbon credits verified and minted?',
      a: 'Each fulfilled pickup requires an encrypted OTP handshake at the weighbridge. Once the formal Goods Receipt Note (GRN) is signed, our smart carbon ledger calculates net avoided emissions (IPCC Tier-1/Tier-2 agricultural residue baseline) and issues a cryptographically stamped, downloadable carbon offset certificate.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1E21] selection:bg-[#2D5A43] selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* 1. STICKY TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E7E1D7] transition duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onGetStarted}>
            <div className="w-11 h-11 rounded-2xl bg-[#2D5A43] text-[#E5C378] flex items-center justify-center font-black shadow-sm border border-[#3D7457]">
              <Leaf className="w-6 h-6 text-[#E5C378]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-xl text-[#1C1E21] tracking-tight">
                  Waste2Carbon
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#EDF6F0] text-[#1D5E34] border border-[#BCE1C8]">
                  v2.5
                </span>
              </div>
              <p className="text-[10px] text-[#828892] tracking-wide font-medium hidden sm:block">
                Circular Biomass & Verified Carbon Network
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-[#575B62]">
            <a href="#problem" className="hover:text-[#2D5A43] transition">
              The Crisis
            </a>
            <a href="#how-it-works" className="hover:text-[#2D5A43] transition">
              How It Works
            </a>
            <a href="#technology" className="hover:text-[#2D5A43] transition">
              AI Vision & GIS
            </a>
            <a href="#monetization" className="hover:text-[#2D5A43] transition">
              Monetization
            </a>
            <a href="#team" className="hover:text-[#2D5A43] transition">
              Team
            </a>
            <a href="#faq" className="hover:text-[#2D5A43] transition">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onSignIn}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#1C1E21] hover:bg-[#F2ECE0] border border-[#E7E1D7] transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2D5A43] hover:bg-[#1E4330] text-white shadow-sm hover:shadow-md transition flex items-center gap-1.5 cursor-pointer transform hover:scale-[1.02]"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E5C378]" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 overflow-hidden">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#2D5A43]/10 via-[#D4A34F]/10 to-[#2D5A43]/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-40 right-10 w-80 h-80 bg-[#E5C378]/15 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Hackathon Honor Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#D6CEC2] shadow-2xs text-xs font-semibold text-[#1C1E21]">
              <span className="flex h-2 w-2 rounded-full bg-[#25D366] animate-ping" />
              <span className="font-bold text-[#2D5A43]">HackOut 2024 Solution</span>
              <span className="text-[#828892]">·</span>
              <span className="text-[#9A6A15] font-mono">Team CockroachJantaParty</span>
            </div>

            {/* Main Punchy Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-[#1C1E21] tracking-tight leading-[1.12]">
              Transforming Crop Residue into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2D5A43] via-[#3E7D5C] to-[#9A6A15]">
                Verifiable Carbon Wealth
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base lg:text-lg text-[#575B62] leading-relaxed max-w-2xl mx-auto font-normal">
              India’s first circular bio-economy network connecting stubble-burning farmers directly with green biorefineries.
              Powered by <strong className="text-[#1C1E21]">AI Computer Vision QC</strong>,{' '}
              <strong className="text-[#1C1E21]">Dynamic GIS Village Clustering</strong>, and{' '}
              <strong className="text-[#1C1E21]">Audited IPCC Carbon Ledgers</strong>.
            </p>

            {/* CTA Button Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Get Started — It's Free</span>
                <ArrowRight className="w-4 h-4 text-[#E5C378]" />
              </button>

              <button
                onClick={onSignIn}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-[#F2ECE0] text-[#1C1E21] border border-[#D6CEC2] font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <span>Explore Live Platform</span>
                <Compass className="w-4 h-4 text-[#9A6A15]" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-[#828892]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" />
                <span>Zero Stubble Burning</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2D5A43]" />
                <span>IPCC Tier-1/Tier-2 MRV</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#9A6A15]" />
                <span>UPI Handshake Payouts</span>
              </span>
            </div>

          </div>

          {/* 3. HERO LIVE DASHBOARD PREVIEW TEASER */}
          <div className="mt-14 relative rounded-3xl p-3 sm:p-4 bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] border-2 border-[#D6CEC2] shadow-2xl overflow-hidden max-w-5xl mx-auto">
            <div className="bg-[#1C1E21] rounded-2xl overflow-hidden text-white p-4 sm:p-6 space-y-6">
              
              {/* Simulated OS Window Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                  <span className="text-xs text-[#828892] font-mono pl-2">
                    waste2carbon.platform/terminal/live-mrv
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#E5C378]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>NETWORK OPERATIONAL · 24 GREEN CBG REFINERIES CONNECTED</span>
                </div>
              </div>

              {/* Three Interactive Feature Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1: AI Vision Scanning HUD */}
                <div className="bg-[#24272B] p-4 rounded-xl border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#E5C378] tracking-wider flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-[#E5C378]" />
                      <span>AI Vision QC</span>
                    </span>
                    <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                      Grade A Verified
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">Multi-Spectral Texture Assay</h4>
                  <div className="space-y-1 text-xs text-[#D7DFD8] font-mono">
                    <div className="flex justify-between">
                      <span>Surface Moisture:</span>
                      <strong className="text-white">13.8% (Optimal)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Plastic Polymers:</span>
                      <strong className="text-emerald-400">0.4% (Ultra-Low)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Calorific Yield:</span>
                      <strong className="text-[#E5C378]">14.6 MJ/kg</strong>
                    </div>
                  </div>
                </div>

                {/* 2: Dynamic GIS Aggregation */}
                <div className="bg-[#24272B] p-4 rounded-xl border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#E5C378] tracking-wider flex items-center gap-1">
                      <NavigationIcon className="w-3 h-3 text-[#E5C378]" />
                      <span>GIS Logistics Hub</span>
                    </span>
                    <span className="text-[10px] font-black bg-[#9A6A15]/40 text-[#E5C378] px-2 py-0.5 rounded">
                      TSP Optimized
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">10km Village Aggregation</h4>
                  <div className="space-y-1 text-xs text-[#D7DFD8] font-mono">
                    <div className="flex justify-between">
                      <span>Stops Sequenced:</span>
                      <strong className="text-white">5 Micro-Farms</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Payload Mass:</span>
                      <strong className="text-emerald-400">10.0 Tons (Full)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Diesel Saved:</span>
                      <strong className="text-[#E5C378]">48 Liters (~₹4,416)</strong>
                    </div>
                  </div>
                </div>

                {/* 3: Verified Carbon Ledger */}
                <div className="bg-[#24272B] p-4 rounded-xl border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#E5C378] tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#E5C378]" />
                      <span>Carbon Ledger</span>
                    </span>
                    <span className="text-[10px] font-black bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                      IPCC Registry
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">Cryptographic Certificate</h4>
                  <div className="space-y-1 text-xs text-[#D7DFD8] font-mono">
                    <div className="flex justify-between">
                      <span>Avoided Methane:</span>
                      <strong className="text-white">15.0 Tons CO2e</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Farmer UPI Pay:</span>
                      <strong className="text-emerald-400">₹32,500 Direct</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Verification OTP:</span>
                      <strong className="text-[#E5C378]">784-912 (Signed)</strong>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* 4. REAL-WORLD IMPACT STATS RIBBON */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, idx) => {
              const IconComp = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E7E1D7] rounded-3xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition text-center space-y-1.5"
                >
                  <div
                    className="w-10 h-10 rounded-2xl mx-auto flex items-center justify-center font-bold mb-2 shadow-2xs"
                    style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-[#1C1E21] tracking-tight block">
                    {stat.value}
                  </span>
                  <span className="text-xs font-bold text-[#1C1E21] block">
                    {stat.label}
                  </span>
                  <span className="text-[11px] text-[#828892] block font-medium">
                    {stat.unit}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. THE CRISIS: WHY STATUS QUO FAILS */}
      <section id="problem" className="py-16 sm:py-24 bg-[#FAF8F5] border-t border-[#E7E1D7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-[#9E2A2B] bg-[#FDF0ED] px-3 py-1 rounded-full border border-[#F5C2B8]">
              The Agricultural Dilemma
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#1C1E21] tracking-tight">
              Why Farmers Burn Stubble & Why Existing Solutions Failed
            </h2>
            <p className="text-xs sm:text-sm text-[#575B62] leading-relaxed">
              Every October, 20 Million+ tons of paddy straw are incinerated across Punjab, Haryana, and Western UP, choking North India in toxic smog.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* The Broken Traditional Reality */}
            <div className="bg-[#FFFFFF] border-2 border-[#E7E1D7] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FDF0ED] text-[#9E2A2B] flex items-center justify-center font-bold">
                  <Flame className="w-5 h-5 text-[#9E2A2B]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#9E2A2B]">The Broken Status Quo</h3>
                  <p className="text-xs text-[#828892]">Unorganized, Penalising & Fragmented</p>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-[#575B62]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9E2A2B] font-bold shrink-0">✕</span>
                  <span><strong>15-Day Time Pressure:</strong> Farmers must clear land immediately for wheat sowing; burning takes 2 hours vs days of manual clearing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9E2A2B] font-bold shrink-0">✕</span>
                  <span><strong>Prohibitive Transport Cost:</strong> Trucking a 1-ton or 2-ton farm batch costs more in diesel than the biomass itself is worth.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9E2A2B] font-bold shrink-0">✕</span>
                  <span><strong>Middlemen Exploitation:</strong> Informal local aggregators delay payments, reject wet biomass arbitrarily, and offer unfair rates.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9E2A2B] font-bold shrink-0">✕</span>
                  <span><strong>Zero Carbon Compensation:</strong> Farmers receive zero economic share of international carbon offset credits.</span>
                </li>
              </ul>
            </div>

            {/* The Waste2Carbon Breakthrough */}
            <div className="bg-[#EDF6F0] border-2 border-[#BCE1C8] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2D5A43] text-[#E5C378] flex items-center justify-center font-bold shadow-2xs">
                  <Leaf className="w-5 h-5 text-[#E5C378]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1D5E34]">The Waste2Carbon Solution</h3>
                  <p className="text-xs text-[#2D5A43]/80">Guaranteed Income, AI Quality & Clustered Logistics</p>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-[#1C1E21]">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#1D5E34] shrink-0 mt-0.5" />
                  <span><strong>Guaranteed Cash Revenue:</strong> Farmers earn ₹2,500 – ₹3,800 per ton directly deposited via instant bank/UPI transfer.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#1D5E34] shrink-0 mt-0.5" />
                  <span><strong>Automated GIS Route Clustering:</strong> Our algorithm aggregates neighboring micro-farms into full 10-ton truck payloads, saving 40% fuel.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#1D5E34] shrink-0 mt-0.5" />
                  <span><strong>Camera AI Quality Grading:</strong> Machine vision scans moisture luminescence and polymer contamination in seconds, eliminating unfair disputes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#1D5E34] shrink-0 mt-0.5" />
                  <span><strong>Audited Carbon Payouts:</strong> Every ton of avoided open burning mints verified IPCC-standard carbon credits shared with producers.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 6. HOW IT WORKS: 3-STEP CIRCULAR PIPELINE */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-t border-[#E7E1D7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-[#2D5A43] bg-[#EDF6F0] px-3 py-1 rounded-full border border-[#BCE1C8]">
              Seamless Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#1C1E21] tracking-tight">
              From Farm Stubble to Bio-Fuel in 3 Steps
            </h2>
            <p className="text-xs sm:text-sm text-[#575B62] leading-relaxed">
              Designed for simple mobile use in rural villages, with industrial precision for corporate buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xs hover:border-[#2D5A43] transition">
              <div className="w-12 h-12 rounded-2xl bg-[#2D5A43] text-white flex items-center justify-center font-mono font-black text-lg shadow-sm">
                01
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1C1E21]">Snap & AI Spectral Inspection</h3>
              <p className="text-xs text-[#575B62] leading-relaxed">
                Farmer snaps a smartphone photo of their stubble or bagasse pile. Our AI neural scanner evaluates moisture saturation, calculates calorific value, and certifies Grade A/B/C quality instantly.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#2D5A43]">
                <Scan className="w-4 h-4 text-[#E5C378]" />
                <span>Instant Quality Certificate</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xs hover:border-[#2D5A43] transition">
              <div className="w-12 h-12 rounded-2xl bg-[#9A6A15] text-white flex items-center justify-center font-mono font-black text-lg shadow-sm">
                02
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1C1E21]">GIS Village Clustering & Smart Bidding</h3>
              <p className="text-xs text-[#575B62] leading-relaxed">
                Our spatial engine aggregates nearby farm listings within a 10km radius into bulk multi-stop routes. Bio-CNG refineries bid transparently or counter-offer rates directly inside structured chat.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#9A6A15]">
                <NavigationIcon className="w-4 h-4 text-[#9A6A15]" />
                <span>40% Transport Fuel Saved</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xs hover:border-[#2D5A43] transition">
              <div className="w-12 h-12 rounded-2xl bg-[#1E4330] text-white flex items-center justify-center font-mono font-black text-lg shadow-sm">
                03
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1C1E21]">OTP Handshake, Invoice & Carbon Minting</h3>
              <p className="text-xs text-[#575B62] leading-relaxed">
                At pickup, driver and farmer verify with a 6-digit OTP. An automated GST Goods Receipt Note is generated with WhatsApp dispatch, funds clear immediately, and IPCC carbon credits are minted.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#1E4330]">
                <Receipt className="w-4 h-4 text-[#2D5A43]" />
                <span>Instant GRN & Carbon Credits</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. HIGH-LEVEL TECHNOLOGY SHOWCASE */}
      <section id="technology" className="py-16 sm:py-24 bg-[#FAF8F5] border-t border-[#E7E1D7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#9A6A15] bg-[#FDF6E2] px-3 py-1 rounded-full border border-[#EED99E]">
              Next-Gen Engineering
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#1C1E21] tracking-tight">
              Enterprise Grade Logistics & Computer Vision
            </h2>
            <p className="text-xs sm:text-sm text-[#575B62] leading-relaxed">
              Cutting-edge proprietary algorithms engineered to handle messy agricultural reality.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Tech Pillar 1: Dynamic GIS Logistics Map */}
            <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EDF6F0] text-[#1D5E34] flex items-center justify-center font-bold">
                  <NavigationIcon className="w-5 h-5 text-[#2D5A43]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1C1E21]">Interactive GIS Logistics & Cluster Maps</h3>
                  <p className="text-xs text-[#828892]">Leaflet Spatial Density & TSP Routing</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#575B62] leading-relaxed">
                Biomass is inherently low-density and high-bulk. Our spatial solver computes regional cluster radiuses, draws glowing aggregation rings, and creates an optimized Traveling Salesperson route from factory depot to multi-stop farm gates.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E7E1D7] space-y-1">
                  <span className="text-[10px] text-[#828892] uppercase font-bold block">Geofenced Radii</span>
                  <strong className="text-sm font-black text-[#1C1E21]">5 – 15 km Hubs</strong>
                </div>
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E7E1D7] space-y-1">
                  <span className="text-[10px] text-[#828892] uppercase font-bold block">Consolidated Payloads</span>
                  <strong className="text-sm font-black text-[#2D5A43]">10 Metric Tons</strong>
                </div>
              </div>
            </div>

            {/* Tech Pillar 2: Computer Vision Quality Scanner */}
            <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FDF6E2] text-[#9A6A15] flex items-center justify-center font-bold">
                  <Cpu className="w-5 h-5 text-[#9A6A15]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1C1E21]">AI Multi-Spectral Quality Assay</h3>
                  <p className="text-xs text-[#828892]">Laser HUD Scanning & Inerts Classification</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#575B62] leading-relaxed">
                Factory buyers reject stubble when moisture exceeds 20% or soil contamination damages boilers. Our camera neural net estimates moisture content, flags non-biodegradable synthetic plastic impurities, and outputs certified calorific values.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E7E1D7] space-y-1">
                  <span className="text-[10px] text-[#828892] uppercase font-bold block">Moisture Precision</span>
                  <strong className="text-sm font-black text-[#1C1E21]">±1.2% Assay Curve</strong>
                </div>
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E7E1D7] space-y-1">
                  <span className="text-[10px] text-[#828892] uppercase font-bold block">Contaminant Threshold</span>
                  <strong className="text-sm font-black text-[#9A6A15]">Polymer & Sand Detection</strong>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 8. MONETIZATION MODEL: HOW WE MAKE MONEY */}
      <section id="monetization" className="py-16 sm:py-24 bg-white border-t border-[#E7E1D7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-[#2D5A43] bg-[#EDF6F0] px-3 py-1 rounded-full border border-[#BCE1C8]">
              Business Model
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#1C1E21] tracking-tight">
              4 Sustainable Revenue Streams
            </h2>
            <p className="text-xs sm:text-sm text-[#575B62] leading-relaxed">
              Addressing the judges' core economic question: How does Waste2Carbon monetize while creating massive social value?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Stream 1 */}
            <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-3xl p-6 space-y-3 shadow-2xs hover:border-[#2D5A43] transition">
              <div className="w-10 h-10 rounded-xl bg-[#2D5A43] text-[#E5C378] flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-[#828892] uppercase font-bold block">Revenue Stream 1</span>
              <h3 className="font-bold text-base text-[#1C1E21]">Marketplace Take-Rate</h3>
              <p className="text-xs text-[#575B62] leading-relaxed">
                2.5% to 4.0% transaction fee charged on every fulfilled biomass tonnage delivery between farmers and bio-refineries.
              </p>
              <span className="text-xs font-bold text-[#2D5A43] block pt-1">High recurring transaction volume</span>
            </div>

            {/* Stream 2 */}
            <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-3xl p-6 space-y-3 shadow-2xs hover:border-[#2D5A43] transition">
              <div className="w-10 h-10 rounded-xl bg-[#9A6A15] text-white flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-[#828892] uppercase font-bold block">Revenue Stream 2</span>
              <h3 className="font-bold text-base text-[#1C1E21]">Fleet Dispatch SaaS</h3>
              <p className="text-xs text-[#575B62] leading-relaxed">
                Tiered monthly software subscription (₹15,000–₹45,000/mo) for industrial plants to utilize our GIS dynamic clustering & TSP route optimization engine.
              </p>
              <span className="text-xs font-bold text-[#9A6A15] block pt-1">Enterprise B2B Recurring MRR</span>
            </div>

            {/* Stream 3 */}
            <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-3xl p-6 space-y-3 shadow-2xs hover:border-[#2D5A43] transition">
              <div className="w-10 h-10 rounded-xl bg-[#1E4330] text-[#E5C378] flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-[#828892] uppercase font-bold block">Revenue Stream 3</span>
              <h3 className="font-bold text-base text-[#1C1E21]">AI Vision QC API</h3>
              <p className="text-xs text-[#575B62] leading-relaxed">
                Per-scan API billing (₹25/scan) for off-platform biomass traders and mandi weighbridges to run instant camera-based moisture & purity audits.
              </p>
              <span className="text-xs font-bold text-[#1E4330] block pt-1">Scalable API Usage</span>
            </div>

            {/* Stream 4 */}
            <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-3xl p-6 space-y-3 shadow-2xs hover:border-[#2D5A43] transition">
              <div className="w-10 h-10 rounded-xl bg-[#2D5A43] text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-[#E5C378]" />
              </div>
              <span className="text-[10px] text-[#828892] uppercase font-bold block">Revenue Stream 4</span>
              <h3 className="font-bold text-base text-[#1C1E21]">Carbon Credit Spread</h3>
              <p className="text-xs text-[#575B62] leading-relaxed">
                15% facilitation margin on verified voluntary carbon offsets minted from avoided open stubble fires, sold to Fortune 500 corporate buyers.
              </p>
              <span className="text-xs font-bold text-[#2D5A43] block pt-1">High-Margin ESG Market</span>
            </div>

          </div>

        </div>
      </section>

      {/* 9. HACKATHON TEAM SHOWCASE */}
      <section id="team" className="py-16 sm:py-24 bg-[#FAF8F5] border-t border-[#E7E1D7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-[#9A6A15] bg-[#FDF6E2] px-3 py-1 rounded-full border border-[#EED99E]">
              Builders & Innovators
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#1C1E21] tracking-tight">
              Team CockroachJantaParty
            </h2>
            <p className="text-xs sm:text-sm text-[#575B62] leading-relaxed">
              Crafted with passion for HackOut 2024 to solve India's air quality crisis through software and economic incentives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E7E1D7] rounded-3xl p-6 text-center space-y-3 shadow-2xs hover:shadow-md transition"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2D5A43] to-[#1E4330] text-[#E5C378] font-mono font-black text-xl flex items-center justify-center mx-auto shadow-sm border border-[#3D7457]">
                  {member.initials}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1C1E21]">{member.name}</h3>
                  <p className="text-xs text-[#828892] mt-0.5 font-medium">{member.role}</p>
                </div>
                <div className="pt-2 border-t border-[#E7E1D7]">
                  <span className="text-[10px] font-bold text-[#2D5A43] bg-[#EDF6F0] px-2.5 py-0.5 rounded-full">
                    HackOut 2024
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-16 sm:py-24 bg-white border-t border-[#E7E1D7]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#2D5A43] bg-[#EDF6F0] px-3 py-1 rounded-full border border-[#BCE1C8]">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#1C1E21] tracking-tight">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-2xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#1C1E21] cursor-pointer hover:text-[#2D5A43]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#828892] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-[#2D5A43]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[#575B62] leading-relaxed border-t border-[#E7E1D7]/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 11. BOTTOM CALL TO ACTION BANNER */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#1E4330] via-[#244E39] to-[#2D5A43] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E5C378]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-[#E5C378] flex items-center justify-center mx-auto border border-white/20 shadow-md">
            <Sparkles className="w-7 h-7" />
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white">
            Ready to Monetize Clean Biomass & End Stubble Burning?
          </h2>

          <p className="text-xs sm:text-base text-emerald-100 max-w-xl mx-auto leading-relaxed">
            Join thousands of progressive farmers and industrial green refineries operating on the Waste2Carbon circular network.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#E5C378] hover:bg-[#D4A34F] text-[#1C1E21] font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer transform hover:scale-105"
            >
              <span>Launch Platform Now</span>
              <ArrowRight className="w-4 h-4 text-[#1C1E21]" />
            </button>

            <button
              onClick={onSignIn}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In to Your Dashboard</span>
            </button>
          </div>
        </div>
      </section>

      {/* 12. CLEAN FOOTER */}
      <footer className="bg-[#FAF8F5] border-t border-[#E7E1D7] py-10 text-xs text-[#828892]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#2D5A43] text-white flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-[#E5C378]" />
            </div>
            <span className="font-serif font-black text-[#1C1E21]">Waste2Carbon</span>
            <span>· Built for HackOut 2024 by Team CockroachJantaParty</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-[#1C1E21] transition cursor-pointer" onClick={onGetStarted}>
              Platform App
            </span>
            <span className="hover:text-[#1C1E21] transition cursor-pointer" onClick={onSignIn}>
              Sign In
            </span>
            <span className="text-[#828892]">IPCC Tier-1/Tier-2 MRV Protocol Compliant</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
