import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Factory,
  Sprout,
  FileText,
  RefreshCw,
  Award,
  Scale,
  DollarSign,
  Users,
  MapPin,
  Phone,
  Layers,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { allUsers, listings, pickupRequests, ledger, verifyProcessor, refreshData } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'verifications' | 'directory' | 'activity' | 'monetization'>('verifications');

  // Filter unverified processors
  const pendingProcessors = allUsers.filter(
    (u) => u.role === 'processor' && !u.verified
  );

  const verifiedProcessors = allUsers.filter(
    (u) => u.role === 'processor' && u.verified
  );

  const producers = allUsers.filter((u) => u.role === 'producer');

  // Total diverted
  const totalDiverted = listings
    .filter((l) => l.status === 'collected')
    .reduce((acc, curr) => acc + curr.quantity_in_tons, 0);

  const totalCredits = ledger.reduce((acc, curr) => acc + curr.amount_credits, 0);
  const totalValueINR = totalCredits * 2500;

  // Compute category breakdown from real listings
  const categoryMap: Record<string, number> = {};
  listings.forEach((l) => {
    const cat = l.waste_subcategory || l.waste_category || 'Organic Biomass';
    categoryMap[cat] = (categoryMap[cat] || 0) + l.quantity_in_tons;
  });
  const totalListingsTons = Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1;
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Facility technology breakdown
  const biocharCount = allUsers.filter(
    (u) => u.role === 'processor' && u.facility_type === 'biochar'
  ).length;
  const biogasCount = allUsers.filter(
    (u) => u.role === 'processor' && u.facility_type !== 'biochar'
  ).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const handleApprove = async (id: string) => {
    await verifyProcessor(id, true);
  };

  const handleReject = async (id: string) => {
    await verifyProcessor(id, false);
  };

  return (
    <div className="space-y-6">
      {/* Operations Center Header Banner */}
      <div className="bg-gradient-to-r from-[#1E4330] via-[#2D5A43] to-[#1E4330] rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D4A34F] text-[#1C1E21] shadow-xs">
              National MRV Registry
            </span>
            <span className="text-xs text-emerald-200 font-medium">
              Administrative & Compliance Oversight Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Waste2Carbon Operations Command
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
            Audit industrial pyrolysis & bio-methanation facilities, inspect regulatory licenses, and verify real-time carbon sequestration transactions.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            title="Refresh database records"
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition cursor-pointer"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="bg-[#FAF8F5] text-[#1C1E21] border border-[#E7E1D7] rounded-2xl px-5 py-3 text-right shadow-sm shrink-0">
            <span className="text-[10px] text-[#828892] uppercase tracking-wider font-bold block">
              Pending Audits
            </span>
            <span className="text-2xl font-black text-[#9A6A15] font-mono">
              {pendingProcessors.length}
            </span>
            <span className="text-xs text-[#828892]"> Facilities</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E7E1D7] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#828892]">
            <span className="text-xs font-semibold">Total Waste Diverted</span>
            <Scale className="w-4 h-4 text-[#2D5A43]" />
          </div>
          <p className="text-2xl font-black text-[#1C1E21] font-mono mt-2">
            {totalDiverted.toLocaleString('en-IN')}{' '}
            <span className="text-xs text-[#828892] font-normal">Tons</span>
          </p>
          <p className="text-[11px] text-[#2D5A43] mt-1 font-medium">Prevented from stubble open burning</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E7E1D7] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#828892]">
            <span className="text-xs font-semibold">Carbon Credits Issued</span>
            <Award className="w-4 h-4 text-[#9A6A15]" />
          </div>
          <p className="text-2xl font-black text-[#2D5A43] font-mono mt-2">
            {totalCredits.toLocaleString('en-IN')}{' '}
            <span className="text-xs text-[#828892] font-normal">tCO2e</span>
          </p>
          <p className="text-[11px] text-[#9A6A15] mt-1 font-medium">100% IPCC MRV Verified Baseline</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E7E1D7] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#828892]">
            <span className="text-xs font-semibold">Rural Value Generated</span>
            <DollarSign className="w-4 h-4 text-[#2D5A43]" />
          </div>
          <p className="text-2xl font-black text-[#1C1E21] font-mono mt-2">
            ₹{totalValueINR.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#828892] mt-1 font-medium">Direct farmer & plant economics</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E7E1D7] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#828892]">
            <span className="text-xs font-semibold">Registered Entities</span>
            <Users className="w-4 h-4 text-[#2D5A43]" />
          </div>
          <p className="text-2xl font-black text-[#1C1E21] font-mono mt-2">
            {allUsers.length}{' '}
            <span className="text-xs text-[#828892] font-normal">Active</span>
          </p>
          <p className="text-[11px] text-[#828892] mt-1 font-medium">
            {producers.length} Producers · {allUsers.filter((u) => u.role === 'processor').length} Plants
          </p>
        </div>
      </div>

      {/* Operations Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Feedstock Volume Diversion Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E7E1D7] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#828892]">
                Feedstock Flow Distribution
              </span>
              <h3 className="font-serif font-bold text-base text-[#1C1E21]">
                Top Agricultural Biomass Streams
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#2D5A43]">
              {listings.length} Active Batches
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {topCategories.length > 0 ? (
              topCategories.map(([catName, tons], idx) => {
                const pct = Math.round((tons / totalListingsTons) * 100);
                const colors = ['bg-[#2D5A43]', 'bg-[#9A6A15]', 'bg-[#D4A34F]', 'bg-[#828892]'];
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1C1E21]">{catName}</span>
                      <span className="font-mono text-[#828892]">
                        {tons.toFixed(1)} tons · <strong className="text-[#1C1E21]">{pct}%</strong>
                      </span>
                    </div>
                    <div className="w-full bg-[#E7E1D7]/60 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[idx % colors.length]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#828892] py-4 text-center">No listings recorded yet.</p>
            )}
          </div>
        </div>

        {/* Conversion Technology Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E7E1D7] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#828892]">
              Industrial Processing Hubs
            </span>
            <h3 className="font-serif font-bold text-base text-[#1C1E21]">
              Technology Allocation
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-2xl p-4 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-[#F4EDE2] text-[#9A6A15] flex items-center justify-center mx-auto mb-1">
                <Factory className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-[#828892] uppercase font-bold block">
                Biochar Pyrolysis
              </span>
              <span className="text-xl font-black text-[#1C1E21] font-mono">{biocharCount}</span>
              <span className="text-[10px] text-[#2D5A43] block font-medium">3.0x Sequestration</span>
            </div>

            <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-2xl p-4 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] text-[#2D5A43] flex items-center justify-center mx-auto mb-1 border border-[#E7E1D7]">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-[#828892] uppercase font-bold block">
                Biogas Digesters
              </span>
              <span className="text-xl font-black text-[#1C1E21] font-mono">{biogasCount}</span>
              <span className="text-[10px] text-[#9A6A15] block font-medium">CBG & Bio-CNG</span>
            </div>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl p-3 text-xs text-[#828892] flex items-center justify-between">
            <span>Verified Facilities:</span>
            <span className="font-mono font-bold text-[#2D5A43]">
              {verifiedProcessors.length} / {verifiedProcessors.length + pendingProcessors.length}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap rounded-2xl bg-[#F4EDE2]/80 p-1 border border-[#E7E1D7] max-w-2xl">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`flex-1 min-w-[130px] py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'verifications'
              ? 'bg-[#FFFFFF] text-[#1C1E21] shadow-xs'
              : 'text-[#828892] hover:text-[#1C1E21]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#9A6A15]" />
          <span>Verifications ({pendingProcessors.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'directory'
              ? 'bg-[#FFFFFF] text-[#1C1E21] shadow-xs'
              : 'text-[#828892] hover:text-[#1C1E21]'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#2D5A43]" />
          <span>Directory ({allUsers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 min-w-[130px] py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-[#FFFFFF] text-[#1C1E21] shadow-xs'
              : 'text-[#828892] hover:text-[#1C1E21]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#9A6A15]" />
          <span>MRV Ledger ({ledger.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('monetization')}
          className={`flex-1 min-w-[140px] py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'monetization'
              ? 'bg-[#2D5A43] text-white shadow-xs'
              : 'text-[#828892] hover:text-[#1C1E21]'
          }`}
        >
          <Wallet className="w-3.5 h-3.5 text-[#E5C378]" />
          <span>Monetization & Economics</span>
        </button>
      </div>

      {/* Tab 1: Verification Queue */}
      {activeTab === 'verifications' && (
        <div className="bg-[#FFFFFF] border border-[#E7E1D7] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-base text-[#1C1E21] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#9A6A15]" />
              <span>Conversion Facility Compliance Review Queue</span>
            </h2>
            <span className="text-xs text-[#828892]">
              Unverified facilities cannot accept producer listings
            </span>
          </div>

          {pendingProcessors.length === 0 ? (
            <div className="py-12 text-center text-[#828892] space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-[#2D5A43] opacity-60" />
              <p className="font-serif font-bold text-base text-[#1C1E21]">All conversion facilities are verified!</p>
              <p className="text-xs text-[#828892]">No pending compliance review requests in Supabase.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProcessors.map((proc) => (
                <div
                  key={proc.id}
                  className="bg-[#FAF8F5] border border-[#D4A34F]/50 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#F4EDE2] text-[#9A6A15] border border-[#E7E1D7]">
                        {proc.facility_type === 'biochar' ? 'Biochar Pyrolysis' : 'Biogas Digester'}
                      </span>
                      <h3 className="font-serif font-bold text-base text-[#1C1E21]">{proc.full_name}</h3>
                      <span className="text-xs font-bold text-[#9A6A15] bg-[#F4EDE2] px-2.5 py-0.5 rounded-md border border-[#E7E1D7]">
                        Pending Regulatory Audit
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#828892]">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#828892]" />
                        <span className="text-[#1C1E21]">{proc.phone || 'No phone registered'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#828892]" />
                        <span className="truncate text-[#1C1E21]">{proc.formatted_address || `${proc.city}, ${proc.state}`}</span>
                      </div>
                    </div>

                    {/* Document details */}
                    <div className="bg-[#FFFFFF] border border-[#E7E1D7] rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center gap-2 font-bold text-[#1C1E21]">
                        <FileText className="w-3.5 h-3.5 text-[#9A6A15]" />
                        <span>Document: {proc.document_type || 'SPCB Consent to Operate'}</span>
                      </div>
                      <p className="text-[#828892]">
                        License No: <strong className="text-[#1C1E21] font-mono">{proc.document_number || 'N/A'}</strong>
                      </p>
                      {proc.document_name && (
                        <p className="text-[#828892] text-[11px]">
                          Attached file: <code className="bg-[#FAF8F5] px-1.5 py-0.5 rounded text-[#1C1E21]">{proc.document_name}</code>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleReject(proc.id)}
                      className="px-4 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-rose-50 text-rose-700 border border-[#E7E1D7] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(proc.id)}
                      className="px-5 py-2.5 rounded-xl bg-[#2D5A43] hover:bg-[#1E4330] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Verify Facility</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Entity Directory */}
      {activeTab === 'directory' && (
        <div className="bg-[#FFFFFF] border border-[#E7E1D7] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-base text-[#1C1E21]">Registered Platform Entities</h2>
            <span className="text-xs text-[#828892]">Full roster across India</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E7E1D7] text-[#828892] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Entity Name</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Credits Balance</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E1D7]/60">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAF8F5] transition">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#1C1E21]">{u.full_name}</div>
                      <div className="text-[11px] text-[#828892] font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-rose-100 text-rose-800'
                            : u.role === 'processor'
                            ? 'bg-[#F4EDE2] text-[#9A6A15] border border-[#E7E1D7]'
                            : 'bg-[#FAF8F5] text-[#2D5A43] border border-[#E7E1D7]'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[#1C1E21]">
                      {u.city ? `${u.city}, ${u.state}` : u.formatted_address || 'India'}
                    </td>
                    <td className="py-3.5 px-3">
                      {u.role === 'processor' ? (
                        u.verified ? (
                          <span className="text-[#2D5A43] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="text-[#9A6A15] font-bold">Pending Review</span>
                        )
                      ) : (
                        <span className="text-[#828892] font-medium">Active User</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#1C1E21]">
                      {u.carbon_credits_balance || 0} tCO2e
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {u.role === 'processor' && (
                        <button
                          onClick={() => verifyProcessor(u.id, !u.verified)}
                          className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition cursor-pointer ${
                            u.verified
                              ? 'text-rose-700 border-rose-200 hover:bg-rose-50'
                              : 'text-[#2D5A43] border-[#2D5A43]/40 hover:bg-[#FAF8F5]'
                          }`}
                        >
                          {u.verified ? 'Revoke' : 'Verify'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: MRV National Ledger Activity */}
      {activeTab === 'activity' && (
        <div className="bg-[#FFFFFF] border border-[#E7E1D7] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-base text-[#1C1E21]">IPCC MRV Sequestration Ledger</h2>
              <p className="text-xs text-[#828892]">Immutable environmental attribute records & certificates</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#2D5A43]">
              {ledger.length} Block Entries
            </span>
          </div>

          {ledger.length === 0 ? (
            <div className="py-10 text-center text-[#828892] text-xs">
              No carbon issuance transactions recorded on the ledger yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E7E1D7] text-[#828892] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Certificate Code</th>
                    <th className="py-3 px-3">Beneficiary</th>
                    <th className="py-3 px-3">Waste / Feedstock</th>
                    <th className="py-3 px-3">Tons Diverted</th>
                    <th className="py-3 px-3">Credits Awarded</th>
                    <th className="py-3 px-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E1D7]/60">
                  {ledger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-[#FAF8F5] transition">
                      <td className="py-3.5 px-3 font-mono font-bold text-[#9A6A15]">
                        {entry.certificate_code}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-[#1C1E21]">{entry.user_name}</div>
                        <div className="text-[10px] text-[#828892] uppercase">{entry.user_role}</div>
                      </td>
                      <td className="py-3.5 px-3 text-[#1C1E21]">{entry.waste_type}</td>
                      <td className="py-3.5 px-3 font-mono font-semibold text-[#1C1E21]">
                        {entry.tons_diverted} t
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-black text-[#2D5A43]">
                          +{entry.amount_credits} tCO2e
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right text-[#828892] text-[11px]">
                        {new Date(entry.created_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Platform Monetization & Business Economics */}
      {activeTab === 'monetization' && (
        <div className="space-y-6">
          {/* Revenue Overview Card */}
          <div className="bg-gradient-to-r from-[#1E4330] via-[#244E39] to-[#2D5A43] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E5C378] text-[#1E4330]">
                  HackOut 2026 Commercial Model
                </span>
                <span className="text-xs text-emerald-200">
                  Dual B2B SaaS + Carbon Registry Commission Architecture
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                Waste2Carbon Platform Monetization Engine
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                Waste2Carbon monetizes through a self-reinforcing flywheel: feedstock trade commissions, voluntary carbon credit registry brokerage, enterprise fleet SaaS subscriptions, and digital MRV certification fees.
              </p>
            </div>
          </div>

          {/* 4 Core Monetization Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E7E1D7] rounded-3xl p-5 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EDF6F0] text-[#1D5E34] flex items-center justify-center border border-[#BCE1C8]">
                <Scale className="w-5 h-5 text-[#2D5A43]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#828892] tracking-wider block">Pillar 01</span>
                <h3 className="text-base font-bold text-[#1C1E21]">Trade Commission</h3>
              </div>
              <p className="text-xs text-[#575B62] leading-relaxed">
                <strong>2.5% transaction brokerage</strong> charged to industrial buyers on every settled biomass shipment.
              </p>
              <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E7E1D7] text-xs space-y-1">
                <div className="flex justify-between text-[#828892]">
                  <span>Fee Rate:</span>
                  <span className="font-bold text-[#2D5A43]">2.5% or ₹62.5/t</span>
                </div>
                <div className="flex justify-between text-[#828892]">
                  <span>Current Volume:</span>
                  <span className="font-bold text-[#1C1E21]">{totalDiverted} Tons</span>
                </div>
                <div className="flex justify-between font-bold text-[#1C1E21] pt-1 border-t border-[#E7E1D7]">
                  <span>Platform Fee Accrued:</span>
                  <span className="text-[#2D5A43] font-mono">₹{Math.round(totalDiverted * 2500 * 0.025).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E7E1D7] rounded-3xl p-5 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FDF6E2] text-[#9A6A15] flex items-center justify-center border border-[#EED99E]">
                <Award className="w-5 h-5 text-[#9A6A15]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#828892] tracking-wider block">Pillar 02</span>
                <h3 className="text-base font-bold text-[#1C1E21]">Carbon Registry Brokerage</h3>
              </div>
              <p className="text-xs text-[#575B62] leading-relaxed">
                <strong>10% fee</strong> when minted tCO2e certificates are sold to ESG corporations (₹2,500/tCO2e market price).
              </p>
              <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E7E1D7] text-xs space-y-1">
                <div className="flex justify-between text-[#828892]">
                  <span>Brokerage Cut:</span>
                  <span className="font-bold text-[#9A6A15]">10% (₹250/credit)</span>
                </div>
                <div className="flex justify-between text-[#828892]">
                  <span>Issued Credits:</span>
                  <span className="font-bold text-[#1C1E21]">{totalCredits} tCO2e</span>
                </div>
                <div className="flex justify-between font-bold text-[#1C1E21] pt-1 border-t border-[#E7E1D7]">
                  <span>Registry Revenue Pool:</span>
                  <span className="text-[#9A6A15] font-mono">₹{Math.round(totalCredits * 250).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E7E1D7] rounded-3xl p-5 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EDF6F0] text-[#2D5A43] flex items-center justify-center border border-[#BCE1C8]">
                <Layers className="w-5 h-5 text-[#2D5A43]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#828892] tracking-wider block">Pillar 03</span>
                <h3 className="text-base font-bold text-[#1C1E21]">AI Logistics SaaS</h3>
              </div>
              <p className="text-xs text-[#575B62] leading-relaxed">
                <strong>₹14,999/month</strong> recurring enterprise subscription for commercial plants for automated cluster dispatch & fleet route optimization.
              </p>
              <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E7E1D7] text-xs space-y-1">
                <div className="flex justify-between text-[#828892]">
                  <span>Active Plants:</span>
                  <span className="font-bold text-[#1C1E21]">{allUsers.filter((u) => u.role === 'processor').length} Facilities</span>
                </div>
                <div className="flex justify-between text-[#828892]">
                  <span>Avg. Fuel Saved:</span>
                  <span className="font-bold text-[#2D5A43]">~38% / trip</span>
                </div>
                <div className="flex justify-between font-bold text-[#1C1E21] pt-1 border-t border-[#E7E1D7]">
                  <span>Annualized ARR:</span>
                  <span className="text-[#2D5A43] font-mono">₹{(allUsers.filter((u) => u.role === 'processor').length * 15000 * 12).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E7E1D7] rounded-3xl p-5 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F8F5EE] text-[#1C1E21] flex items-center justify-center border border-[#E7E1D7]">
                <ShieldCheck className="w-5 h-5 text-[#2D5A43]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#828892] tracking-wider block">Pillar 04</span>
                <h3 className="text-base font-bold text-[#1C1E21]">MRV Fast-Track Audit</h3>
              </div>
              <p className="text-xs text-[#575B62] leading-relaxed">
                <strong>₹5,000 per facility audit</strong> for accredited laboratory verification, moisture testing, and tamper-proof IPCC compliance stamps.
              </p>
              <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E7E1D7] text-xs space-y-1">
                <div className="flex justify-between text-[#828892]">
                  <span>Audit Fee:</span>
                  <span className="font-bold text-[#1C1E21]">₹5,000 / plant</span>
                </div>
                <div className="flex justify-between text-[#828892]">
                  <span>Verified Units:</span>
                  <span className="font-bold text-[#2D5A43]">{verifiedProcessors.length} Verified</span>
                </div>
                <div className="flex justify-between font-bold text-[#1C1E21] pt-1 border-t border-[#E7E1D7]">
                  <span>Compliance Revenue:</span>
                  <span className="text-[#1C1E21] font-mono">₹{(verifiedProcessors.length * 5000).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Unit Economics Breakdown Table */}
          <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1C1E21]">
              Unit Economics per 10-Ton Paddy Straw Batch
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E7E1D7] text-[#828892] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-3">Stakeholder</th>
                    <th className="py-3 px-3">Traditional Baseline (No W2C)</th>
                    <th className="py-3 px-3">With Waste2Carbon Platform</th>
                    <th className="py-3 px-3 text-right">Net Value Uplift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E1D7]/60">
                  <tr className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-3 font-bold text-[#1C1E21]">🌾 Farmer / Producer</td>
                    <td className="py-3 px-3 text-rose-700">₹0 (Burns stubble, risk of ₹5,000 fine)</td>
                    <td className="py-3 px-3 text-[#2D5A43] font-bold">Earns ₹25,000 feedstock + 3.0 tCO2e</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#2D5A43]">+₹25,000 Cash</td>
                  </tr>
                  <tr className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-3 font-bold text-[#1C1E21]">🏭 Industrial Processor</td>
                    <td className="py-3 px-3 text-[#828892]">Unreliable brokers (₹3,200/ton + 30% empty miles)</td>
                    <td className="py-3 px-3 text-[#1C1E21]">Direct buying at ₹2,500/t + clustered routes</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#2D5A43]">-₹7,000 Raw Material</td>
                  </tr>
                  <tr className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-3 font-bold text-[#1C1E21]">⚡ Waste2Carbon Platform</td>
                    <td className="py-3 px-3 text-[#828892]">₹0</td>
                    <td className="py-3 px-3 text-[#9A6A15] font-bold">2.5% trade fee (₹625) + 10% credit fee (₹750)</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#9A6A15]">+₹1,375 / 10 Tons</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
