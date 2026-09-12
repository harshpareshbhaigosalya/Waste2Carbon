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
      {/* Top Banner with White - Gold - Emerald Styling */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-950 text-rose-200 border border-rose-600 shadow-sm">
              Root Administration
            </span>
            <span className="text-xs text-rose-200 font-medium">
              · System Controller & Regulatory Review
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            W2C National Registry Admin
          </h1>
          <p className="text-xs sm:text-sm text-rose-100/90 max-w-xl">
            Review and approve biomass conversion facilities, inspect compliance documents, and monitor national carbon sequestration ledger.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            title="Refresh database"
            className="p-3 rounded-2xl bg-black/20 hover:bg-black/30 text-rose-200 border border-rose-500/30 transition"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
          </button>
          <div className="bg-white text-slate-900 rounded-2xl px-5 py-3 text-right shadow-lg shrink-0">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">
              Pending Approvals
            </span>
            <span className="text-2xl font-black text-amber-700">
              {pendingProcessors.length}
            </span>
            <span className="text-xs text-slate-500"> Facilities</span>
          </div>
        </div>
      </div>

      {/* KPI Cards in Clean White / Gold Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Waste Diverted</span>
            <Scale className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {totalDiverted.toLocaleString('en-IN')} <span className="text-xs text-slate-500 font-normal">Tons</span>
          </p>
          <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Diverted from open burning / landfills</p>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-semibold">Carbon Credits Issued</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            {totalCredits.toLocaleString('en-IN')} <span className="text-xs text-slate-500 font-normal">tCO2e</span>
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5 font-medium">₹2,500/t standard standard MRV</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Economic Value</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            ₹{totalValueINR.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Generated for Indian rural economy</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Platform Ecosystem</span>
            <Users className="w-4 h-4 text-sky-700" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {allUsers.length} <span className="text-xs text-slate-500 font-normal">Entities</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            {producers.length} Producers · {allUsers.filter((u) => u.role === 'processor').length} Processors
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200 max-w-md">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'verifications'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>Verifications ({pendingProcessors.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'directory'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-700" />
          <span>Entity Directory ({allUsers.length})</span>
        </button>
      </div>

      {/* Tab 1: Verification Queue */}
      {activeTab === 'verifications' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>Conversion Facility Compliance Review Queue</span>
            </h2>
            <span className="text-xs text-slate-500">
              Only verified facilities can accept feedstock from farmers
            </span>
          </div>

          {pendingProcessors.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 opacity-60" />
              <p className="text-sm font-semibold text-slate-700">All conversion facilities are verified!</p>
              <p className="text-xs text-slate-500">No pending compliance review requests in Supabase.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProcessors.map((proc) => (
                <div
                  key={proc.id}
                  className="bg-[#fcfbf7] border-2 border-amber-300 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                        {proc.facility_type === 'biochar' ? 'Biochar Pyrolysis' : 'Biogas Digester'}
                      </span>
                      <h3 className="font-bold text-base text-slate-900">{proc.full_name}</h3>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Pending Admin Action
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{proc.phone || 'No phone'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{proc.formatted_address || `${proc.city}, ${proc.state}`}</span>
                      </div>
                    </div>

                    {/* Document details */}
                    <div className="bg-white border border-amber-200 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>Document: {proc.document_type || 'SPCB Consent to Operate'}</span>
                      </div>
                      <p className="text-slate-600">
                        License No: <strong className="text-slate-900">{proc.document_number || 'N/A'}</strong>
                      </p>
                      {proc.document_name && (
                        <p className="text-slate-500 text-[11px]">
                          Attached file: <code>{proc.document_name}</code>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleReject(proc.id)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-300 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(proc.id)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow transition flex items-center gap-1.5 cursor-pointer"
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
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-black text-slate-900">Registered Platform Entities</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Entity Name</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Credits</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{u.full_name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-rose-100 text-rose-800'
                            : u.role === 'processor'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {u.city ? `${u.city}, ${u.state}` : u.formatted_address || 'India'}
                    </td>
                    <td className="py-3.5 px-3">
                      {u.role === 'processor' ? (
                        u.verified ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="text-amber-700 font-bold">Pending Review</span>
                        )
                      ) : (
                        <span className="text-slate-600 font-medium">Active</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-800">
                      {u.carbon_credits_balance || 0}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {u.role === 'processor' && (
                        <button
                          onClick={() => verifyProcessor(u.id, !u.verified)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                            u.verified
                              ? 'text-rose-700 border-rose-300 hover:bg-rose-50'
                              : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
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
    </div>
  );
};
