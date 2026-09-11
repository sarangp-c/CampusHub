import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Sparkles, 
  Utensils, 
  BookOpen, 
  Printer, 
  FileCheck2, 
  Dumbbell, 
  Stethoscope, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wifi,
  Sun,
  Sunset,
  Coffee,
  Check
} from 'lucide-react';
import { QueueStatus, FacilityQueue } from '../types/campus';
import { 
  getStoredFacilities, 
  simulateLiveTelemetryRefresh, 
  applyTimeOfDayPreset 
} from '../utils/facilityStore';

export const QueueLessPage: React.FC = () => {
  const [facilities, setFacilities] = useState<FacilityQueue[]>(getStoredFacilities);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now (Live)');
  const [deltas, setDeltas] = useState<Record<string, number>>({});
  const [showRefreshToast, setShowRefreshToast] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>('normal');

  // Sync across components if another page triggers an update
  useEffect(() => {
    const handleUpdate = () => {
      setFacilities(getStoredFacilities());
    };
    window.addEventListener('campushub_queues_updated', handleUpdate);
    return () => window.removeEventListener('campushub_queues_updated', handleUpdate);
  }, []);

  // Handle Refresh Click (The core user request)
  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    // Simulate real network telemetry polling from campus Wi-Fi access points
    setTimeout(() => {
      const { updatedFacilities, deltas: newDeltas } = simulateLiveTelemetryRefresh(facilities);
      setFacilities(updatedFacilities);
      setDeltas(newDeltas);
      setIsRefreshing(false);
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastRefreshed(`Updated at ${timeStr}`);
      
      setShowRefreshToast(true);
      setTimeout(() => setShowRefreshToast(false), 4500);
    }, 700);
  };

  // Handle Time of Day Demo Presets
  const handlePresetSelect = (preset: 'rush' | 'study' | 'evening') => {
    setActivePreset(preset);
    setIsRefreshing(true);
    setTimeout(() => {
      const updated = applyTimeOfDayPreset(preset);
      setFacilities(updated);
      setDeltas({});
      setIsRefreshing(false);
      setLastRefreshed(`Preset applied: ${preset.toUpperCase()}`);
      setShowRefreshToast(true);
      setTimeout(() => setShowRefreshToast(false), 4000);
    }, 400);
  };

  const filteredFacilities = facilities.filter((fac) => {
    if (filterStatus === 'All') return true;
    return fac.status === filterStatus;
  });

  const getStatusColorConfig = (status: QueueStatus) => {
    switch (status) {
      case 'Low':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          dot: 'bg-emerald-500',
          badge: 'Low Traffic',
          barColor: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
        };
      case 'Medium':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          dot: 'bg-amber-500',
          badge: 'Moderate Traffic',
          barColor: 'bg-amber-500',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
        };
      case 'Busy':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
          dot: 'bg-orange-500',
          badge: 'High Traffic',
          barColor: 'bg-orange-500',
          icon: <AlertTriangle className="w-4 h-4 text-orange-600" />,
        };
      case 'Very Busy':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
          dot: 'bg-rose-500',
          badge: 'Peak Rush',
          barColor: 'bg-rose-600',
          icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
        };
    }
  };

  const renderFacilityIcon = (iconName: string) => {
    const className = "w-6 h-6";
    switch (iconName) {
      case 'Utensils':
        return <Utensils className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Printer':
        return <Printer className={className} />;
      case 'FileCheck2':
        return <FileCheck2 className={className} />;
      case 'Dumbbell':
        return <Dumbbell className={className} />;
      case 'Stethoscope':
        return <Stethoscope className={className} />;
      default:
        return <Clock className={className} />;
    }
  };

  return (
    <div className="space-y-8 animate-in relative">
      
      {/* Live Refresh Toast Notification */}
      {showRefreshToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in shadow-2xl rounded-2xl bg-slate-900 text-white px-4 py-3 border border-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Telemetry Refreshed Successfully
            </div>
            <p className="text-[11px] text-slate-300">
              Live occupancy & wait times recomputed across all 6 facilities.
            </p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-2 border border-amber-100">
            <Clock className="w-3.5 h-3.5" />
            <span>Campus Congestion & Facility Queues</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            QueueLess
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Live estimated wait times and facility congestion across campus services. Click "Refresh" to trigger real-time telemetry updates.
          </p>
        </div>

        {/* Refresh button & Live indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-slate-800 font-bold">{lastRefreshed}</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-75 active:scale-95"
            title="Refresh live queue estimates"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
            <span>{isRefreshing ? 'Polling Sensors...' : 'Refresh Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* Quick Demo Time-of-Day Presets */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Simulate College Schedule Scenarios:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handlePresetSelect('rush')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activePreset === 'rush'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Lunch Rush (1:15 PM)</span>
          </button>

          <button
            onClick={() => handlePresetSelect('study')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activePreset === 'study'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Study Hours (4:30 PM)</span>
          </button>

          <button
            onClick={() => handlePresetSelect('evening')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activePreset === 'evening'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Sunset className="w-3.5 h-3.5" />
            <span>Evening Gym (7:30 PM)</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Low', 'Medium', 'Busy', 'Very Busy'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterStatus === st
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {st === 'All' ? `All Facilities (${facilities.length})` : `${st} Wait`}
          </button>
        ))}
      </div>

      {/* Facility Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((fac) => {
          const config = getStatusColorConfig(fac.status);
          const occupancyRate = Math.round((fac.currentOccupancy / fac.capacity) * 100);
          const delta = deltas[fac.id];

          return (
            <div
              key={fac.id}
              className={`rounded-3xl bg-white p-6 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                isRefreshing ? 'opacity-70 scale-[0.99]' : 'opacity-100 scale-100'
              } ${delta !== undefined ? 'ring-2 ring-indigo-200 border-indigo-300' : 'border-slate-200'}`}
            >
              <div>
                {/* Header with Icon and Status badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
                      {renderFacilityIcon(fac.icon)}
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        {fac.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {fac.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Status and Wait Time Highlight Box */}
                <div className={`p-4 rounded-2xl border ${config.bg} ${config.border} mb-4 transition-all`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Estimated Wait:</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-0.5 rounded-full ${config.bg} ${config.text} border ${config.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                      {fac.status}
                    </span>
                  </div>

                  <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                    {fac.waitTime}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Average counter processing time
                  </div>
                </div>

                {/* Occupancy / Busy level meter */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Occupancy Load</span>
                    <div className="flex items-center gap-1.5">
                      {delta !== undefined && delta !== 0 && (
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded flex items-center ${
                            delta > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {delta > 0 ? `▲ +${delta}` : `▼ ${delta}`}
                        </span>
                      )}
                      <span className="font-mono font-bold text-slate-700">
                        {fac.currentOccupancy} / {fac.capacity} ({occupancyRate}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${config.barColor}`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Note / Operator Update */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 mb-3 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{fac.note}</span>
                </div>
              </div>

              {/* Card Footer: Peak Hours */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Peak Rush Hours:</span>
                <span className="font-mono font-semibold text-slate-800">{fac.peakHours}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campus Tips info card */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Campus Pro-Tip</span>
          </div>
          <p className="text-sm font-semibold text-slate-200">
            Canteen queue reaches maximum peak at 1:15 PM. Visit before 12:45 PM or after 1:45 PM for under 5-minute wait times.
          </p>
        </div>
        <span className="shrink-0 text-xs font-mono text-slate-400 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
          Telemetry: Active
        </span>
      </div>
    </div>
  );
};
