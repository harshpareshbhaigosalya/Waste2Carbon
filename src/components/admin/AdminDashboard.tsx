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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { allUsers, listings, pickupRequests, ledger, verifyProcessor, refreshData } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'verifications' | 'directory' | 'activity'>('verifications');

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
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">
              Administrator Hub · Verification Authority
            </span>
            <span className="text-xs text-slate-400">· admin@gmail.com</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5 flex items-center gap-2">
            <span>W2C Platform Administration</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Inspect processor compliance documents, approve industrial facilities, and monitor circular carbon transactions.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Pending Verifications</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">
            {pendingProcessors.length}{' '}
            <span className="text-xs font-normal text-slate-400">Facilities</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Require document review</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Verified Facilities</span>
            <Factory className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            {verifiedProcessors.length}{' '}
            <span className="text-xs font-normal text-slate-400">Approved</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active buyers in marketplace</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Registered Producers</span>
            <Sprout className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-sky-400 mt-2">
            {producers.length}{' '}
            <span className="text-xs font-normal text-slate-400">Farmers/Generators</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Supply pipeline</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Carbon Credits Issued</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-400 mt-2">
            {totalCredits.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-400">tCO2e</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">~₹{totalValueINR.toLocaleString('en-IN')} Value</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'verifications'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Facility Verifications Queue ({pendingProcessors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'directory'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Platform User Directory ({allUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'activity'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Waste Batches & Pickups</span>
          </button>
        </div>

        {/* Tab 1: Pending Verifications Queue */}
        {activeTab === 'verifications' && (
          <div className="space-y-4">
            {pendingProcessors.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <ShieldCheck className="w-12 h-12 text-emerald-500/50 mx-auto" />
                <h3 className="text-sm font-bold text-white">All Facility Applications Verified!</h3>
                <p className="text-xs text-slate-400">
                  There are no pending processor accounts waiting for compliance verification.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingProcessors.map((proc) => (
                  <div
                    key={proc.id}
                    className="bg-slate-950 border border-amber-500/40 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                        <h3 className="text-base font-extrabold text-white">{proc.full_name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 uppercase">
                          Pending Review
                        </span>
                        <span className="text-xs text-slate-400 capitalize">
                          · {proc.facility_type === 'biochar' ? 'Biochar Pyrolysis' : 'Biogas Digester'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          {proc.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {proc.formatted_address || `${proc.city}, ${proc.state}`}
                        </span>
                        <span className="text-amber-400 font-bold">
                          Buying Offer: ₹{proc.price_per_ton ? proc.price_per_ton.toLocaleString('en-IN') : '2,500'} / ton
                        </span>
                      </div>

                      {/* Submitted Verification Document Box */}
                      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1 mt-1 max-w-xl">
                        <div className="flex items-center gap-2 text-slate-200 font-bold">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span>{proc.document_type || 'State Pollution Control Board (SPCB) CTO License'}</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          Registration / License Number: <strong className="text-amber-300 font-mono">{proc.document_number || 'N/A'}</strong>
                        </p>
                        {proc.document_name && (
                          <p className="text-slate-400 text-[11px]">
                            Attached Document: <span className="text-emerald-400 underline">{proc.document_name}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => handleReject(proc.id)}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApprove(proc.id)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition flex items-center gap-1.5"
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

        {/* Tab 2: All Users Directory */}
        {activeTab === 'directory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Organization / Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Email & Phone</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Verification Status</th>
                  <th className="p-3 text-right">Toggle Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-950/40">
                    <td className="p-3 font-bold text-white">{u.full_name}</td>
                    <td className="p-3 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          : u.role === 'processor'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">
                      <div>{u.email}</div>
                      <div>{u.phone}</div>
                    </td>
                    <td className="p-3 text-slate-300">{u.city ? `${u.city}, ${u.state}` : 'N/A'}</td>
                    <td className="p-3">
                      {u.verified ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {u.role === 'processor' && (
                        <button
                          onClick={() => verifyProcessor(u.id, !u.verified)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                            u.verified
                              ? 'bg-slate-900 text-rose-400 border-slate-800 hover:border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
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
        )}

        {/* Tab 3: All Listings & Transactions */}
        {activeTab === 'activity' && (
          <div className="space-y-3">
            {listings.length === 0 ? (
              <p className="py-12 text-center text-slate-500 text-xs">No waste listings in Supabase yet.</p>
            ) : (
              listings.map((l) => (
                <div key={l.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white text-sm block">{l.title}</span>
                    <span className="text-slate-400">
                      Generator: {l.producer_name} · Buyer: {l.assigned_processor_name || 'Open'} · Status: {l.status}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-amber-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                    OTP: {l.verification_otp}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
