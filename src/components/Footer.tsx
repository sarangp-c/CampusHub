import React from "react";
import { GraduationCap, ShieldAlert } from "lucide-react";
import { NavPage } from "./Navbar";

interface FooterProps {
  onNavigate: (page: NavPage) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-200 bg-white/70 backdrop-blur-xs text-slate-600 text-xs py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-slate-900 font-sans tracking-tight">
                Campus<span className="text-indigo-600">Hub</span>
              </span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed">
              Consolidated daily campus utilities into one clean dashboard: attendance simulation, real-time queues, upcoming campus events, and hardware borrowing.
            </p>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span>Demo Prototype • B.Tech Batch 2022-2026</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-slate-900 font-semibold mb-3 text-xs tracking-wider uppercase">Quick Utilities</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onNavigate("attendance")} 
                  className="hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  Attendance Predictor (Hero)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("events")} 
                  className="hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  Campus Events Discovery
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("queueless")} 
                  className="hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  QueueLess Wait Times
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate("borrowbox")} 
                  className="hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  BorrowBox Campus Items
                </button>
              </li>
            </ul>
          </div>

          {/* Campus Helpline Notice */}
          <div>
            <h4 className="text-slate-900 font-semibold mb-3 text-xs tracking-wider uppercase">Campus Notice</h4>
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>Mandatory 75% Rule</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Academic council requires a minimum 75% aggregate to qualify for end-semester examinations.
              </p>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <div>
            &copy; 2026 CampusHub &bull; "Everything you need to navigate college life."
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-500 font-medium">Competition Rapid Prototype</span>
            <span>&bull;</span>
            <span className="text-emerald-600 font-medium">Zero-Latency Client Calculations</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
