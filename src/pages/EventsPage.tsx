import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Search, 
  Sparkles, 
  Share2, 
  Check, 
  RefreshCw, 
  Globe, 
  CheckCircle2, 
  X, 
  Radio, 
  RotateCcw,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { EventCategory, CampusEvent } from '../types/campus';
import { getStoredEvents, saveStoredEvents, resetStoredEvents, externalPortalMockPool } from '../utils/eventStore';

interface ToastState {
  visible: boolean;
  message: string;
  sourceUrl: string;
  newCount: number;
}

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<CampusEvent[]>(getStoredEvents);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // External sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    sourceUrl: '',
    newCount: 0,
  });

  // Active Organizer Contact Modal state
  const [activeContactEvent, setActiveContactEvent] = useState<CampusEvent | null>(null);

  // Listen for storage updates across tabs or components
  useEffect(() => {
    const handleUpdate = () => {
      setEvents(getStoredEvents());
    };
    window.addEventListener('campushub_events_updated', handleUpdate);
    return () => window.removeEventListener('campushub_events_updated', handleUpdate);
  }, []);

  const categories: EventCategory[] = [
    'All',
    'Workshops',
    'Clubs',
    'Cultural',
    'Sports',
    'Academic',
  ];

  // External portal sync simulation logic (fetching from university portal)
  const handleSimulateSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);

    setTimeout(() => {
      const currentIds = new Set(events.map(e => e.id));
      const unaddedFromPool = externalPortalMockPool.filter(e => !currentIds.has(e.id));

      let newEventsToAdd: CampusEvent[] = [];

      if (unaddedFromPool.length > 0) {
        newEventsToAdd = unaddedFromPool.slice(0, 2).map(e => ({
          ...e,
          contactPerson: e.contactPerson || 'Central Senate Coordinator',
          contactPhone: e.contactPhone || '+91 98450 99887',
          contactEmail: e.contactEmail || 'events@campushub.edu',
        }));
      } else {
        const dynamicId = `ext-${Date.now()}`;
        newEventsToAdd = [
          {
            id: dynamicId,
            title: `Live Student Notice: Campus HackSprint #${Math.floor(Math.random() * 90 + 10)}`,
            category: 'Academic',
            date: 'Incoming Feed, Today',
            time: '5:00 PM - 7:00 PM',
            venue: 'Innovation Sandbox Hub',
            description: 'Automated push notification ingested from university intranet notice board. Team registrations open on arrival.',
            organizer: 'Central Student Senate',
            badgeText: 'Synced from Portal',
            isFeatured: true,
            contactPerson: 'Aditya Rao (Senate Tech Lead)',
            contactPhone: '+91 98765 11223',
            contactEmail: 'senate@campushub.edu',
          },
        ];
      }

      const updated = [...newEventsToAdd, ...events];
      setEvents(updated);
      saveStoredEvents(updated);
      setIsSyncing(false);

      setToast({
        visible: true,
        message: `Successfully ingested ${newEventsToAdd.length} new event${newEventsToAdd.length > 1 ? 's' : ''}`,
        sourceUrl: 'https://portal.university.edu/api/v2/events',
        newCount: newEventsToAdd.length,
      });

      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 6000);
    }, 1200);
  };

  const handleReset = () => {
    const defaultList = resetStoredEvents();
    setEvents(defaultList);
    setToast(prev => ({ ...prev, visible: false }));
  };

  const filteredEvents = events.filter((evt) => {
    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;
    const matchesSearch = 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.contactPerson && evt.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleShare = (evt: CampusEvent) => {
    navigator.clipboard?.writeText?.(`${evt.title} at ${evt.venue} on ${evt.date}`);
    setCopiedId(evt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Workshops':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Clubs':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cultural':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Sports':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Academic':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in relative">
      
      {/* LIVE SYNC TOAST NOTIFICATION */}
      {toast.visible && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-in shadow-2xl rounded-2xl bg-slate-900 text-white p-4 border border-slate-700 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Ingestion Stream
              </span>
              <button
                onClick={() => setToast(prev => ({ ...prev, visible: false }))}
                className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h4 className="text-sm font-bold text-slate-100 mt-0.5">
              {toast.message}
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 font-mono truncate">
              Source: {toast.sourceUrl}
            </p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold mb-2 border border-violet-100">
            <Radio className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
            <span>Campus Life & Live Feeds</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Campus Events
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Explore workshops, hackathons, and sports meets. Automatically synchronized from the central university notice board and club feeds.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events, venues, contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* SIMULATE EXTERNAL PORTAL SYNC BUTTON */}
          <button
            onClick={handleSimulateSync}
            disabled={isSyncing}
            title="Simulates fetching new events from an external university portal/API"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm shadow-indigo-200 transition-all cursor-pointer shrink-0 disabled:opacity-75"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Syncing External Portal...</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 text-indigo-200" />
                <span>Simulate External Portal Sync</span>
              </>
            )}
          </button>

          {/* Reset button if events were modified */}
          {events.length !== 8 && (
            <button
              onClick={handleReset}
              title="Reset events back to original 8 mock events"
              className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          const count = cat === 'All' 
            ? events.length 
            : events.filter(e => e.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const isSynced = evt.badgeText === 'Synced from Portal';

            return (
              <div
                key={evt.id}
                className={`rounded-3xl bg-white p-6 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                  isSynced ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Card Top: Category and optional badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getCategoryBadgeClass(
                        evt.category
                      )}`}
                    >
                      {evt.category}
                    </span>

                    {evt.badgeText && (
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                          isSynced
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isSynced ? <Globe className="w-3 h-3 text-emerald-600" /> : <Sparkles className="w-3 h-3" />}
                        {evt.badgeText}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug mb-2.5">
                    {evt.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {evt.description}
                  </p>

                  {/* Details List */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{evt.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{evt.time}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>

                  {/* Organizer & Contact Info Box */}
                  <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Organizer</span>
                      <span className="text-[11px] font-semibold text-slate-800 truncate block">
                        {evt.organizer}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveContactEvent(evt)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Contact</span>
                    </button>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px]">Free Student Walk-in</span>

                  <button
                    onClick={() => handleShare(evt)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors p-1 cursor-pointer"
                    title="Copy event details"
                  >
                    {copiedId === evt.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold text-[11px]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Share</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-12 border border-slate-200 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No events found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No events match "{searchQuery}" under category "{selectedCategory}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ORGANIZER CONTACT POPUP */}
      {/* ========================================================= */}
      {activeContactEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in">
          <div className="rounded-3xl bg-white p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Organizer Contact Details
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-[240px]">
                    {activeContactEvent.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveContactEvent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-violet-600 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Coordinator</span>
                    <span className="text-sm font-bold text-slate-900">
                      {activeContactEvent.contactPerson || 'Student Club Lead'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60">
                  <Phone className="w-4 h-4 text-violet-600 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Coordinator Phone</span>
                    <a
                      href={`tel:${activeContactEvent.contactPhone || '+919876543210'}`}
                      className="text-sm font-bold text-indigo-600 hover:underline font-mono"
                    >
                      {activeContactEvent.contactPhone || '+91 98765 43210'}
                    </a>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-violet-50 text-violet-700 border border-violet-200">
                    Call
                  </span>
                </div>

                <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60">
                  <Mail className="w-4 h-4 text-violet-600 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Inquiries Email</span>
                    <a
                      href={`mailto:${activeContactEvent.contactEmail || 'events@campushub.edu'}`}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      {activeContactEvent.contactEmail || 'events@campushub.edu'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-violet-50/50 border border-violet-100 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-violet-900">
                  <MapPin className="w-3.5 h-3.5 text-violet-600" />
                  <span>{activeContactEvent.venue}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Scheduled for {activeContactEvent.date} ({activeContactEvent.time}). Free entry with student ID.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveContactEvent(null)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
            >
              Close Contact Card
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
