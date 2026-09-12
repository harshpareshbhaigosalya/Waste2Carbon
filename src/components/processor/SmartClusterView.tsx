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
      <div className="bg-[#FFFFFF] border border-[#E7E1D7] rounded-3xl p-10 text-center space-y-3 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-[#F4EDE2] text-[#9A6A15] flex items-center justify-center mx-auto border border-[#E7E1D7]">
          <Layers className="w-7 h-7" />
        </div>
        <h3 className="font-serif font-bold text-lg text-[#1C1E21]">No Waste Clusters Detected Yet</h3>
        <p className="text-xs text-[#828892] max-w-md mx-auto leading-relaxed">
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
    <div className="space-y-5">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-[#1E4330] via-[#2D5A43] to-[#1E4330] rounded-3xl p-6 sm:p-7 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D4A34F] text-[#1C1E21] shadow-xs">
              AI Logistics Cluster Engine
            </span>
            <span className="text-xs font-medium text-emerald-200">
              {clusters.length} Optimized Clusters Discovered
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
            Bulk Village Clustering & Route Sequencing
          </h2>
          <p className="text-xs text-emerald-100/90 max-w-xl leading-relaxed">
            Eliminates fragmented single-batch trips. Aggregates neighboring farms into consolidated bulk payloads,
            saving up to 40% on diesel logistics while boosting farmer payouts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="bg-[#FAF8F5] text-[#1C1E21] border border-[#E7E1D7] rounded-2xl px-5 py-3 text-right shadow-sm">
            <span className="text-[10px] text-[#828892] uppercase font-bold tracking-wider block">
              Total Bulk Feedstock
            </span>
            <span className="text-2xl font-black text-[#2D5A43] font-mono">
              {clusters.reduce((acc, c) => acc + c.totalQuantityTons, 0).toFixed(1)}{' '}
              <span className="text-xs font-normal text-[#828892]">Tons</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Clusters Selection List & Route Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cluster Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#828892]">
              Aggregation Hubs ({clusters.length})
            </span>
            <span className="text-[11px] text-[#9A6A15] font-semibold">Select hub to inspect route</span>
          </div>

          {clusters.map((cluster) => {
            const isSelected = currentActiveCluster?.id === cluster.id;
            const targetPayload = 10;
            const payloadPct = Math.min(100, Math.round((cluster.totalQuantityTons / targetPayload) * 100));

            return (
              <div
                key={cluster.id}
                onClick={() => {
                  setSelectedCluster(cluster);
                  setScheduleDate(cluster.recommendedDate);
                }}
                className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer relative shadow-xs ${
                  isSelected
                    ? 'border-[#2D5A43] bg-[#FAF8F5] ring-2 ring-[#2D5A43]/15 shadow-sm'
                    : 'border-[#E7E1D7] bg-[#FFFFFF] hover:border-[#D4A34F]/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#F4EDE2] text-[#9A6A15] border border-[#E7E1D7]">
                        {cluster.radiusKm} km radius hub
                      </span>
                      <span className="text-[11px] font-medium text-[#828892]">
                        {cluster.producersCount} farm stop{cluster.producersCount > 1 ? 's' : ''}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#1C1E21] mt-1.5">
                      {cluster.name}
                    </h3>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition ${
                      isSelected ? 'text-[#2D5A43] translate-x-1' : 'text-[#828892]'
                    }`}
                  />
                </div>

                {/* Payload Volume Progress Bar */}
                <div className="mt-3 pt-3 border-t border-[#E7E1D7]/70 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-[#828892]">Payload Capacity:</span>
                    <span className="font-mono text-xs font-bold text-[#1C1E21]">
                      {cluster.totalQuantityTons.toFixed(1)} / {targetPayload}.0 tons ·{' '}
                      <span className="text-[#2D5A43]">{payloadPct}%</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#E7E1D7] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        payloadPct >= 80 ? 'bg-[#2D5A43]' : payloadPct >= 50 ? 'bg-[#9A6A15]' : 'bg-[#D4A34F]'
                      }`}
                      style={{ width: `${payloadPct}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#E7E1D7]/70 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#828892] block">Biomass</span>
                    <span className="font-black text-[#1C1E21] font-mono">{cluster.totalQuantityTons} t</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#828892] block">Gross Value</span>
                    <span className="font-black text-[#2D5A43] font-mono">
                      ₹{(cluster.totalEconomicValueINR / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#828892] block">Fuel Saved</span>
                    <span className="font-black text-[#9A6A15] font-mono">{cluster.dieselSavedLiters} L</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2.5 pt-2 text-[11px] text-[#828892]">
                  <span className="flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-[#2D5A43]" />
                    <span>~₹{(cluster.dieselSavedLiters * 92).toFixed(0)} Saved</span>
                  </span>
                  <span className="flex items-center gap-1 font-medium text-[#1C1E21]">
                    <Clock className="w-3.5 h-3.5 text-[#828892]" />
                    <span>Target Date: {cluster.recommendedDate}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Cluster Route Detail & Scheduling (7 cols) */}
        {currentActiveCluster && (
          <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E7E1D7] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E1D7] pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#9A6A15] bg-[#F4EDE2] px-2.5 py-0.5 rounded-full border border-[#E7E1D7]">
                  Optimized TSP Waypoint Sequence
                </span>
                <h3 className="font-serif font-bold text-xl text-[#1C1E21] mt-1.5">
                  {currentActiveCluster.name}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="bg-[#FAF8F5] text-[#2D5A43] border border-[#E7E1D7] px-3.5 py-1.5 rounded-xl font-bold font-mono">
                  {currentActiveCluster.estimatedTotalRouteDistanceKm} km Round Trip
                </span>
              </div>
            </div>

            {/* Smart Route Multi-Stop Sequence */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-[#2D5A43]" />
                <span>Door-to-Door Waypoints ({currentActiveCluster.optimizedRouteSequence.length} Stops)</span>
              </span>

              <div className="space-y-2.5 relative pl-6 border-l-2 border-[#2D5A43]/40 ml-3 py-1">
                {/* Starting Point (Plant) */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#2D5A43] border-2 border-white shadow-xs" />
                  <div className="bg-[#FAF8F5] p-3 rounded-2xl text-xs flex items-center justify-between border border-[#E7E1D7]">
                    <div>
                      <span className="font-bold text-[#1C1E21]">Start: Your Processing Facility</span>
                      <p className="text-[11px] text-[#828892] mt-0.5">{facilityLocation.name}</p>
                    </div>
                    <span className="text-[10px] bg-[#E7E1D7] text-[#1C1E21] px-2.5 py-0.5 rounded-full font-bold">
                      Depot (0 km)
                    </span>
                  </div>
                </div>

                {/* Waypoints */}
                {currentActiveCluster.optimizedRouteSequence.map((point, idx) => (
                  <div key={point.id} className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#D4A34F] border-2 border-white shadow-xs" />
                    <div className="bg-[#FAF8F5] p-3 rounded-2xl text-xs flex items-center justify-between border border-[#E7E1D7] hover:border-[#D4A34F] transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#F4EDE2] text-[#9A6A15] text-[10px] font-black flex items-center justify-center border border-[#E7E1D7]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-[#1C1E21]">{point.producer_name}</span>
                          <span className="text-[10px] text-[#828892]">· {point.producer_phone}</span>
                        </div>
                        <p className="text-[11px] text-[#828892] mt-1 truncate max-w-xs sm:max-w-sm">
                          {point.location_name}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-black text-[#2D5A43] block text-xs font-mono">
                          +{point.quantity_tons} Tons
                        </span>
                        <span className="text-[10px] text-[#828892]">
                          {point.waste_subcategory}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Return Point (Plant) */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#2D5A43] border-2 border-white shadow-xs" />
                  <div className="bg-[#FAF8F5] p-3 rounded-2xl text-xs flex items-center justify-between border border-[#E7E1D7] text-[#828892]">
                    <div>
                      <span className="font-bold text-[#1C1E21]">Return: Facility Unloading Bay</span>
                      <p className="text-[11px] text-[#828892]">Direct weighbridge intake & moisture verification</p>
                    </div>
                    <span className="text-[11px] font-bold text-[#2D5A43] font-mono">
                      {currentActiveCluster.totalQuantityTons} Tons Payload
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule & Dispatch Action */}
            <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-2xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#1C1E21] block">
                    Lock Collection Date & Dispatch Route Notice
                  </span>
                  <p className="text-[11px] text-[#828892] mt-0.5">
                    Notifies all {currentActiveCluster.producersCount} sellers simultaneously with your verified pickup schedule.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="bg-[#FFFFFF] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold text-[#1C1E21] focus:outline-none focus:border-[#2D5A43]"
                  />
                  <button
                    onClick={() => handleConfirmSchedule(currentActiveCluster)}
                    disabled={isScheduling}
                    className="bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isScheduling ? 'Scheduling...' : 'Lock & Notify'}</span>
                  </button>
                </div>
              </div>

              {scheduleSuccess && (
                <div className="bg-[#F4EDE2] border border-[#D4A34F] text-[#1C1E21] text-xs p-3 rounded-xl font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#2D5A43] shrink-0" />
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
