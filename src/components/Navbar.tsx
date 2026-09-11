import React, { useState } from "react";
import { 
  GraduationCap, 
  Menu, 
  X, 
  Calculator, 
  Calendar, 
  Clock, 
  Package, 
  Home, 
  ChevronRight
} from "lucide-react";

export type NavPage = "home" | "attendance" | "events" | "queueless" | "borrowbox";

interface NavbarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage, subjectId?: string) => void;
  overallPercentage: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  overallPercentage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavPage; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Home", icon: <Home className="w-4 h-4" /> },
    { id: "attendance", label: "Attendance", icon: <Calculator className="w-4 h-4" /> },
    { id: "events", label: "Events", icon: <Calendar className="w-4 h-4" /> },
    { id: "queueless", label: "QueueLess", icon: <Clock className="w-4 h-4" /> },
    { id: "borrowbox", label: "BorrowBox", icon: <Package className="w-4 h-4" /> },
  ];

  const handleNavClick = (id: NavPage) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const isSafe = overallPercentage >= 75;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Tagline */}
          <div 
            onClick={() => handleNavClick("home")}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                  Campus<span className="text-indigo-600">Hub</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Competition Prototype
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium tracking-tight">
                Everything you need to navigate college life
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-indigo-600 shadow-xs shadow-slate-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Header Widget & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Quick Live Attendance Pill */}
            <button
              onClick={() => handleNavClick("attendance")}
              title="Click to open Attendance Predictor"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs font-semibold cursor-pointer"
            >
              <span className="text-slate-500 hidden sm:inline">Overall:</span>
              <span className={`font-mono font-bold ${isSafe ? "text-emerald-600" : "text-rose-600"}`}>
                {overallPercentage.toFixed(1)}%
              </span>
              <span className={`w-2 h-2 rounded-full ${isSafe ? "bg-emerald-500" : "bg-rose-500"} animate-pulse`} />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-lg px-4 pt-2 pb-5 space-y-1 shadow-lg animate-in">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            CampusHub Navigation
          </div>
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-indigo-600" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            );
          })}
          <div className="pt-2">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Target Attendance Threshold:</span>
              <span className="font-bold font-mono text-indigo-700">75% Mandatory</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
