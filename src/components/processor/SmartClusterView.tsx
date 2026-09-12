import React, { useState } from 'react';
import {
  Layers,
  MapPin,
  Calendar,
  Truck,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Fuel,
  Send,
  Navigation,
  Sparkles,
  Users,
  ChevronRight,
  Clock,
  ArrowRight,
  Check,
} from 'lucide-react';
import { WasteCluster, ClusterPoint } from '../../lib/clusteringOptimizer';

interface SmartClusterViewProps {
  clusters: WasteCluster[];
  facilityLocation: { lat: number; lng: number; name: string };
  onScheduleCluster: (cluster: WasteCluster, date: string) => Promise<void>;
}

export const SmartClusterView: React.FC<SmartClusterViewProps> = ({
  clusters,
  facilityLocation,
  onScheduleCluster,
}) => {
  const [selectedCluster, setSelectedCluster] = useState<WasteCluster | null>(
    clusters.length > 0 ? clusters[0] : null
  );
  const [scheduleDate, setScheduleDate] = useState<string>(
    clusters[0]?.recommendedDate ||
      new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
  );
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState('');

  if (clusters.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-base text-slate-900">No Waste Clusters Detected Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          As soon as nearby farmers list biomass batches, our GIS clustering algorithm will automatically
          group them into high-efficiency multi-stop pickup routes.
        </p>
      </div>
    );
  }

  const currentActiveCluster = selectedCluster || clusters[0];

  const handleConfirmSchedule = async (cluster: WasteCluster) => {
    setIsScheduling(true);
    setScheduleSuccess('');
    await onScheduleCluster(cluster, scheduleDate);
    setIsScheduling(false);
    setScheduleSuccess(
      `Cluster pickup locked for ${scheduleDate}! Automated dispatch alerts sent to all ${cluster.producersCount} sellers.`
    );
    setTimeout(() => {
      setScheduleSuccess('');
    }, 4000);
  };

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-emerald-50 to-white border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-emerald-950 shadow-xs">
              AI Logistics Cluster Engine
            </span>
            <span className="text-xs font-bold text-emerald-800">
              {clusters.length} Optimized Clusters Discovered
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-900">
            Bulk Village Clustering & Route Sequencing
          </h2>
          <p className="text-xs text-slate-600 max-w-xl">
            Solves fragmented pickups: Pick up waste in bulk from multiple nearby farms in a single route.
            Save up to 40% on diesel logistics while offering higher purchase rates to local farmers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white border border-amber-200 rounded-2xl px-4 py-2.5 text-right shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              Total Bulk Feedstock Available
            </span>
            <span className="text-xl font-black text-emerald-800">
              {clusters.reduce((acc, c) => acc + c.totalQuantityTons, 0).toFixed(1)} Tons
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Clusters Selection List & Route Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Cluster Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block px-1">
            Available Aggregation Hubs
          </span>

          {clusters.map((cluster) => {
            const isSelected = currentActiveCluster?.id === cluster.id;
            return (
              <div
                key={cluster.id}
                onClick={() => {
                  setSelectedCluster(cluster);
                  setScheduleDate(cluster.recommendedDate);
                }}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer relative shadow-xs ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-amber-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                      {cluster.radiusKm} km radius hub
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{cluster.name}</h3>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-emerald-700 translate-x-0.5' : 'text-slate-400'}`} />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/80 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Biomass</span>
                    <span className="font-black text-slate-900">{cluster.totalQuantityTons} t</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Gross Value</span>
                    <span className="font-black text-emerald-800">
                      ₹{(cluster.totalEconomicValueINR / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Generators</span>
                    <span className="font-black text-amber-700">{cluster.producersCount} Farms</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2.5 pt-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-emerald-600" />
                    <span>~{cluster.dieselSavedLiters} L Diesel Saved</span>
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Earliest: {cluster.recommendedDate}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Cluster Route Detail & Scheduling (7 cols) */}
        {currentActiveCluster && (
          <div className="lg:col-span-7 bg-white border-2 border-amber-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Optimized TSP Delivery Sequence
                </span>
                <h3 className="font-black text-lg text-slate-900 mt-1">
                  {currentActiveCluster.name}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl font-bold">
                  {currentActiveCluster.estimatedTotalRouteDistanceKm} km Round Trip
                </span>
              </div>
            </div>

            {/* Smart Route Multi-Stop Sequence */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                <span>Multi-Stop Collection Route (Door-to-Door Waypoints)</span>
              </span>

              <div className="space-y-2 relative pl-6 border-l-2 border-emerald-400 ml-3 py-1">
                {/* Starting Point (Plant) */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-700 border-2 border-white shadow-xs" />
                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs flex items-center justify-between border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900">Start: Your Conversion Plant</span>
                      <p className="text-[10px] text-slate-500">{facilityLocation.name}</p>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                      Depot (0 km)
                    </span>
                  </div>
                </div>

                {/* Waypoints */}
                {currentActiveCluster.optimizedRouteSequence.map((point, idx) => (
                  <div key={point.id} className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-xs" />
                    <div className="bg-[#fcfbf7] p-2.5 rounded-xl text-xs flex items-center justify-between border border-amber-200/80 hover:border-amber-400 transition">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-900">{point.producer_name}</span>
                          <span className="text-[10px] text-slate-400">· {point.producer_phone}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-xs">
                          {point.location_name}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-emerald-800 block text-xs">
                          +{point.quantity_tons} Tons
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {point.waste_subcategory}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Return Point (Plant) */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-700 border-2 border-white shadow-xs" />
                  <div className="bg-slate-50 p-2 rounded-xl text-xs flex items-center justify-between border border-slate-200 text-slate-600">
                    <span>Return to Facility & Unload</span>
                    <span className="text-[10px] font-bold">
                      Total: {currentActiveCluster.totalQuantityTons} Tons Collected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule & Dispatch Action */}
            <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-amber-900 block">
                    Lock Date & Dispatch Cluster Alert
                  </span>
                  <p className="text-[11px] text-amber-800/90">
                    Notifies all {currentActiveCluster.producersCount} sellers simultaneously with your truck arrival date.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    onClick={() => handleConfirmSchedule(currentActiveCluster)}
                    disabled={isScheduling}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isScheduling ? 'Scheduling...' : 'Confirm Date & Notify All'}</span>
                  </button>
                </div>
              </div>

              {scheduleSuccess && (
                <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs p-2.5 rounded-xl font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{scheduleSuccess}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
