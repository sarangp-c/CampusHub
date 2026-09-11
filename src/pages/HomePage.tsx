import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Calendar, 
  Clock, 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  Globe 
} from 'lucide-react';
import { NavPage } from '../components/Navbar';
import { mockStudentProfile, mockSubjects } from '../data/mockData';
import { simulateAttendance } from '../utils/attendanceCalculator';
import { getStoredEvents } from '../utils/eventStore';
import { getStoredFacilities } from '../utils/facilityStore';
import { getStoredBorrowItems } from '../utils/borrowStore';
import { CampusEvent, FacilityQueue, BorrowItem } from '../types/campus';

interface HomePageProps {
  onNavigate: (page: NavPage, subjectId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  // Use hero subject (CS301 - 42/50) for the primary demonstration on Home as requested
  const heroSubject = mockSubjects[0]; // Data Structures & Algorithms (42/50)
  const heroSimulation = simulateAttendance(heroSubject.attended, heroSubject.total, 75);

  // Overall semester calculation
  const overallSimulation = simulateAttendance(
    mockStudentProfile.overallAttended,
    mockStudentProfile.overallTotal,
    75
  );

  // Read events dynamically so any external portal sync is reflected on Home
  const [events, setEvents] = useState<CampusEvent[]>(getStoredEvents);
  // Read facilities dynamically so queue telemetry refresh is reflected on Home
  const [facilities, setFacilities] = useState<FacilityQueue[]>(getStoredFacilities);
  // Read borrow items dynamically so checkouts/returns are reflected on Home
  const [borrowItems, setBorrowItems] = useState<BorrowItem[]>(getStoredBorrowItems);

  useEffect(() => {
    const handleEventsUpdate = () => {
      setEvents(getStoredEvents());
    };
    const handleQueuesUpdate = () => {
      setFacilities(getStoredFacilities());
    };
    const handleBorrowUpdate = () => {
      setBorrowItems(getStoredBorrowItems());
    };

    window.addEventListener('campushub_events_updated', handleEventsUpdate);
    window.addEventListener('campushub_queues_updated', handleQueuesUpdate);
    window.addEventListener('campushub_borrow_updated', handleBorrowUpdate);

    return () => {
      window.removeEventListener('campushub_events_updated', handleEventsUpdate);
      window.removeEventListener('campushub_queues_updated', handleQueuesUpdate);
      window.removeEventListener('campushub_borrow_updated', handleBorrowUpdate);
    };
  }, []);

  // Filter 3 events for quick preview
  const previewEvents = events.slice(0, 3);

  // Filter 3 facilities for quick preview
  const previewFacilities = facilities.slice(0, 3);

  // Filter 3 borrow items
  const previewItems = borrowItems.slice(0, 3);

  return (
    <div className="space-y-8 animate-in">
      {/* Hero Welcome & Briefing Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/10 border border-indigo-700/30">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-violet-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>CampusHub Student Portal</span>
              <span className="text-white/40">•</span>
              <span>{mockStudentProfile.semester}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-sans">
              Welcome back, <span className="text-indigo-200">{mockStudentProfile.name}</span>
            </h1>
            <p className="text-sm sm:text-base text-indigo-100/80 max-w-2xl leading-relaxed">
              Consolidated college utilities at your fingertips. All 5 active courses tracked, campus wait times indexed, and today’s activities scheduled.
            </p>
          </div>

          {/* Quick Stat Pill in Hero */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
            <div className="px-3 py-1.5 border-r border-white/15">
              <span className="block text-[11px] uppercase tracking-wider text-indigo-200 font-semibold">
                Overall Attendance
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-emerald-300">
                  {overallSimulation.currentPercentage.toFixed(1)}%
                </span>
                <span className="text-xs text-indigo-200">
                  ({mockStudentProfile.overallAttended}/{mockStudentProfile.overallTotal})
                </span>
              </div>
            </div>
            <div className="px-3 py-1.5">
              <span className="block text-[11px] uppercase tracking-wider text-indigo-200 font-semibold">
                Status
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
                Safely Above 75%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main 4 Feature Cards Grid */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
              Campus Utilities Dashboard
            </h2>
            <p className="text-xs text-slate-500">
              Four unified modules for daily college workflow
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            Real-time Logic • Live Sync
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* CARD 1: ATTENDANCE PREDICTOR */}
          <div className="group rounded-3xl bg-white p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Hero Utility
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      Attendance Predictor
                    </h3>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {heroSimulation.currentPercentage.toFixed(0)}% Attended
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Featured Subject:</span>
                  <span className="text-xs font-bold text-slate-800">{heroSubject.code} • {heroSubject.name}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-xs text-slate-500">Record:</span>
                  <span className="text-sm font-bold font-mono text-slate-800">
                    {heroSubject.attended} / {heroSubject.total} classes attended
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <p className="text-xs font-semibold">
                      You can safely miss{' '}
                      <span className="text-sm font-extrabold font-mono text-emerald-700 underline decoration-emerald-400">
                        {heroSimulation.maxMissableClasses} more classes
                      </span>{' '}
                      and stay above 75%.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('attendance', heroSubject.id)}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all group-hover:gap-3 cursor-pointer"
            >
              <span>Check Attendance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* CARD 2: CAMPUS EVENTS */}
          <div className="group rounded-3xl bg-white p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 group-hover:scale-105 transition-transform">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-violet-600 uppercase tracking-wider">
                      Discovery
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      Campus Events
                    </h3>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                  {events.length} Available
                </span>
              </div>

              <div className="space-y-2.5 mb-4">
                {previewEvents.map((evt) => {
                  const isSynced = evt.badgeText === 'Synced from Portal';

                  return (
                    <div
                      key={evt.id}
                      className={`p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border transition-colors ${
                        isSynced ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {evt.title}
                        </h4>
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-white text-violet-700 border border-slate-200">
                          {evt.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                        <span className="font-medium text-indigo-600">{evt.date}</span>
                        <span>•</span>
                        <span className="truncate">{evt.venue}</span>
                        {isSynced && (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <Globe className="w-3 h-3" />
                            Live
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => onNavigate('events')}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all group-hover:gap-3 cursor-pointer"
            >
              <span>View Events</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* CARD 3: QUEUELESS */}
          <div className="group rounded-3xl bg-white p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                      Wait Times
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      QueueLess
                    </h3>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Status
                </span>
              </div>

              <div className="space-y-2.5 mb-4">
                {previewFacilities.map((fac) => {
                  let badge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (fac.status === 'Busy' || fac.status === 'Very Busy') {
                    badge = 'bg-rose-50 text-rose-700 border-rose-200';
                  } else if (fac.status === 'Medium') {
                    badge = 'bg-amber-50 text-amber-700 border-amber-200';
                  }

                  return (
                    <div
                      key={fac.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {fac.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Est. wait: <span className="font-semibold text-slate-700">{fac.waitTime}</span>
                        </div>
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold border ${badge}`}>
                        {fac.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => onNavigate('queueless')}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all group-hover:gap-3 cursor-pointer"
            >
              <span>Check Queues</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* CARD 4: BORROWBOX */}
          <div className="group rounded-3xl bg-white p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 group-hover:scale-105 transition-transform">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                      Hardware & Gear
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      BorrowBox
                    </h3>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                  {borrowItems.filter(i => i.availability === 'Available').length} Ready to Borrow
                </span>
              </div>

              <div className="space-y-2.5 mb-4">
                {previewItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {item.location}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        item.availability === 'Available'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}
                    >
                      {item.availability === 'Available' ? `${item.availableQuantity} Left` : 'Borrowed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigate('borrowbox')}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all group-hover:gap-3 cursor-pointer"
            >
              <span>Browse Items</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Quick Semester At-a-Glance Table snippet */}
      <section className="rounded-3xl bg-white p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Quick Subject Summary
            </h3>
            <p className="text-xs text-slate-500">
              Instant snapshot of your active courses this semester
            </p>
          </div>
          <button
            onClick={() => onNavigate('attendance')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            <span>Open Full Attendance Simulation Engine</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {mockSubjects.map((sub) => {
            const subSim = simulateAttendance(sub.attended, sub.total, 75);
            const isSafe = subSim.isCurrentlySafe;
            return (
              <div
                key={sub.id}
                onClick={() => onNavigate('attendance', sub.id)}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/70 hover:border-indigo-200 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800">{sub.code}</span>
                  <span className={`font-mono font-bold ${isSafe ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {subSim.currentPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-slate-500 truncate mb-2">
                  {sub.name}
                </div>
                <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                  <span>{sub.attended}/{sub.total} classes</span>
                  <span className={isSafe ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    {isSafe ? `+${subSim.maxMissableClasses} safe` : 'Deficit'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
