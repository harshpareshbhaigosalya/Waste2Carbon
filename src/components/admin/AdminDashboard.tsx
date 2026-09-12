import React, { useState } from 'react';
import {
  Globe,
  Scale,
  Award,
  Factory,
  TrendingUp,
  MapPin,
  ShieldCheck,
  FileCheck,
  Search,
  CheckCircle2,
  Users,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { MapView } from '../MapView';
import { CarbonLedgerEntry } from '../../types';

interface AdminDashboardProps {
  onOpenCertificate: () => void;
}

const MONTHLY_TREND_DATA = [
  { month: 'Apr', divertedTons: 64, co2Sequestered: 82 },
  { month: 'May', divertedTons: 112, co2Sequestered: 148 },
  { month: 'Jun', divertedTons: 185, co2Sequestered: 242 },
  { month: 'Jul', divertedTons: 260, co2Sequestered: 338 },
  { month: 'Aug', divertedTons: 340, co2Sequestered: 450 },
  { month: 'Sep', divertedTons: 485, co2Sequestered: 630 },
];

const WASTE_DISTRIBUTION_DATA = [
  { name: 'Dry Organic (Crop Residue/Wood)', value: 48, color: '#f59e0b' },
  { name: 'Wet Organic (Food/Manure)', value: 34, color: '#0284c7' },
  { name: 'Industrial Organic (Grain/Pulp)', value: 18, color: '#10b981' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenCertificate }) => {
  const { listings, processors, pickupRequests, ledger, setSelectedCertificate } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Total metrics
  const totalDivertedTons = 485 + listings.reduce((acc, curr) => acc + (curr.status === 'collected' ? curr.quantity_in_tons : 0), 0);
  const totalCO2Sequestered = Number((totalDivertedTons * 1.32).toFixed(1));
  const totalCredits = totalCO2Sequestered;
  const totalEcosystemValue = Number((totalCredits * 42).toFixed(0));

  const filteredLedger = ledger.filter(
    (entry) =>
      entry.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.certificate_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.waste_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">
                Platform Supervisor & MRV Hub
              </span>
              <span className="text-xs text-slate-400">· Global Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 flex items-center gap-2">
              <span>W2C Circular Carbon Ecosystem Monitor</span>
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Track regional waste diversion pipelines, optimize logistics routes, and monitor certified permanent carbon removal ledger in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl px-4 py-2.5 text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Standard</span>
              <span className="text-sm font-bold text-emerald-400">IPCC & Verra MRV</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Feedstock Diverted</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">
            {totalDivertedTons} <span className="text-sm font-normal text-slate-400">Tons</span>
          </p>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +28% this month
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Net CO2 Sequestered</span>
            <Award className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-extrabold text-teal-400 mt-2">
            {totalCO2Sequestered} <span className="text-sm font-normal text-slate-400">tCO2e</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Permanent Biochar & Methane Offsets</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Network Hubs</span>
            <Factory className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 mt-2">
            {processors.length} <span className="text-sm font-normal text-slate-400">Facilities</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">100% Certified Pyrolysis & Biogas</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Circulated Value</span>
            <span className="text-xs font-bold text-indigo-400">$42/credit</span>
          </div>
          <p className="text-2xl font-extrabold text-indigo-400 mt-2">
            ${totalEcosystemValue.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Direct farmer & plant revenues</p>
        </div>
      </div>

      {/* GIS Mapping Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <span>Regional GIS Cluster & Logistics Network</span>
            </h2>
            <p className="text-xs text-slate-400">
              Real-time spatial visualization of waste producers, conversion facilities, cluster radii, and active transport routes
            </p>
          </div>
        </div>

        <MapView heightClass="h-[480px]" />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Sequestration Trend */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            <span>Monthly Sequestration & Diversion Growth</span>
          </h3>
          <p className="text-xs text-slate-400">Tons of organic waste diverted vs. net tCO2e certified</p>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="co2Sequestered" stroke="#10b981" fillOpacity={1} fill="url(#colorCo2)" name="tCO2e Sequestered" />
                <Area type="monotone" dataKey="divertedTons" stroke="#0284c7" fillOpacity={1} fill="url(#colorWaste)" name="Waste Diverted (Tons)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waste Distribution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Feedstock Breakdown by Conversion Pathway</span>
          </h3>
          <p className="text-xs text-slate-400">Distribution of feedstock volume across circular processing methods</p>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={WASTE_DISTRIBUTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {WASTE_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {WASTE_DISTRIBUTION_DATA.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Carbon Credits Ledger */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <span>Permanent Carbon Sequestration Registry (MRV Ledger)</span>
            </h3>
            <p className="text-xs text-slate-400">Verifiable, audit-ready carbon credit issuance logs</p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search certificate or user..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3">Certificate ID</th>
                <th className="p-3">Beneficiary</th>
                <th className="p-3">Role</th>
                <th className="p-3">Feedstock Diverted</th>
                <th className="p-3">Credits Minted</th>
                <th className="p-3">Standard Protocol</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLedger.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono font-bold text-amber-400">{entry.certificate_code}</td>
                  <td className="p-3 font-medium text-white">{entry.user_name}</td>
                  <td className="p-3 capitalize">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      entry.user_role === 'producer'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {entry.user_role}
                    </span>
                  </td>
                  <td className="p-3">{entry.waste_type}</td>
                  <td className="p-3 font-bold text-emerald-400">+{entry.amount_credits} tCO2e</td>
                  <td className="p-3 text-slate-400">{entry.issuer}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedCertificate(entry);
                        onOpenCertificate();
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition font-semibold"
                    >
                      Certificate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
