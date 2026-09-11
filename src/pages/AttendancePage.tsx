import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  RotateCcw, 
  Play, 
  ArrowDown, 
  TrendingDown, 
  Sparkles, 
  BookOpen, 
  Check, 
  HelpCircle,
  TrendingUp,
  Info,
  CalendarCheck
} from 'lucide-react';
import { mockSubjects, mockStudentProfile } from '../data/mockData';
import { simulateAttendance } from '../utils/attendanceCalculator';
import { AttendanceGauge } from '../components/AttendanceGauge';
import { SubjectAttendance } from '../types/campus';

interface AttendancePageProps {
  initialSubjectId?: string;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({ initialSubjectId }) => {
  // Selection: "overall" or subject id
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId || 'cs301');

  // Input states
  const [attendedInput, setAttendedInput] = useState<number>(42);
  const [totalInput, setTotalInput] = useState<number>(50);
  const [thresholdInput, setThresholdInput] = useState<number>(75);

  // Result state
  const [simulation, setSimulation] = useState(() => simulateAttendance(42, 50, 75));
  const [calculatedAtLeastOnce, setCalculatedAtLeastOnce] = useState<boolean>(true);

  // When initialSubjectId changes or user selects subject dropdown
  useEffect(() => {
    if (selectedSubjectId === 'overall') {
      setAttendedInput(mockStudentProfile.overallAttended);
      setTotalInput(mockStudentProfile.overallTotal);
      setSimulation(simulateAttendance(mockStudentProfile.overallAttended, mockStudentProfile.overallTotal, thresholdInput));
    } else {
      const subject = mockSubjects.find(s => s.id === selectedSubjectId);
      if (subject) {
        setAttendedInput(subject.attended);
        setTotalInput(subject.total);
        setSimulation(simulateAttendance(subject.attended, subject.total, thresholdInput));
      }
    }
  }, [selectedSubjectId]);

  // Handle Calculate button click
  const handleCalculate = () => {
    const safeAttended = Math.max(0, Number(attendedInput) || 0);
    const safeTotal = Math.max(safeAttended, Number(totalInput) || 0);
    const safeThreshold = Math.min(Math.max(1, Number(thresholdInput) || 75), 99);

    const result = simulateAttendance(safeAttended, safeTotal, safeThreshold);
    setSimulation(result);
    setCalculatedAtLeastOnce(true);
  };

  // Quick pre-fill handler for subject row
  const handlePreFillSubject = (subject: SubjectAttendance) => {
    setSelectedSubjectId(subject.id);
    setAttendedInput(subject.attended);
    setTotalInput(subject.total);
    setSimulation(simulateAttendance(subject.attended, subject.total, thresholdInput));
    
    // Smooth scroll up to predictor panel
    const element = document.getElementById('predictor-panel');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Reset to default
  const handleReset = () => {
    setSelectedSubjectId('cs301');
    setAttendedInput(42);
    setTotalInput(50);
    setThresholdInput(75);
    setSimulation(simulateAttendance(42, 50, 75));
  };

  const isSafe = simulation.isCurrentlySafe;
  const currentSubjectObj = mockSubjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="space-y-8 animate-in" id="predictor-panel">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2 border border-indigo-100">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Simulation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Attendance Predictor
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Simulate your attendance trajectory with exact mathematical precision. Instantly find out how many classes you can afford to miss without falling below the 75% threshold.
          </p>
        </div>

        {/* Quick Demo Pre-sets */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 hidden sm:inline">Try Preset:</span>
          <button
            onClick={() => {
              setSelectedSubjectId('cs301');
              setAttendedInput(42);
              setTotalInput(50);
              setSimulation(simulateAttendance(42, 50, 75));
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            42/50 (Hero: 84%)
          </button>
          <button
            onClick={() => {
              setSelectedSubjectId('cs305');
              setAttendedInput(18);
              setTotalInput(24);
              setSimulation(simulateAttendance(18, 24, 75));
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            18/24 (Edge: 75%)
          </button>
          <button
            onClick={() => {
              setSelectedSubjectId('cs303');
              setAttendedInput(28);
              setTotalInput(38);
              setSimulation(simulateAttendance(28, 38, 75));
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            28/38 (Deficit)
          </button>
        </div>
      </div>

      {/* Hero Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Controls & Subject Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontalIcon className="w-4 h-4 text-indigo-600" />
                <span>Simulation Parameters</span>
              </h2>
              <button
                onClick={handleReset}
                title="Reset to 42/50 default"
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Subject Selector Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Subject or Aggregate
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="cs301">CS301 — Data Structures & Algorithms (42/50)</option>
                <option value="cs302">CS302 — Operating Systems (31/40)</option>
                <option value="cs303">CS303 — Database Management Systems (28/38)</option>
                <option value="cs304">CS304 — Computer Networks (45/52)</option>
                <option value="cs305">CS305 — Software Engineering (18/24)</option>
                <option value="overall">Overall Semester Aggregate (164/195)</option>
              </select>
              {currentSubjectObj && (
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <span>Instructor: {currentSubjectObj.faculty}</span>
                  <span>•</span>
                  <span>Room: {currentSubjectObj.room}</span>
                </p>
              )}
            </div>

            {/* Input: Attended Classes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Attended Classes
                </label>
                <span className="text-xs font-semibold text-indigo-600 font-mono">
                  {attendedInput} attended
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={totalInput}
                  value={attendedInput}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAttendedInput(val);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setAttendedInput(Math.max(0, attendedInput - 1))}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => setAttendedInput(Math.min(totalInput, attendedInput + 1))}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>

            {/* Input: Total Classes Conducted */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Total Classes Conducted
                </label>
                <span className="text-xs font-semibold text-slate-500 font-mono">
                  {totalInput} conducted
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={attendedInput}
                  value={totalInput}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTotalInput(val);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setTotalInput(Math.max(attendedInput, totalInput - 1))}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => setTotalInput(totalInput + 1)}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>

            {/* Input: Minimum Required % (Threshold) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Minimum Required % (Threshold)
                </label>
                <span className="text-xs font-bold text-indigo-600 font-mono">
                  {thresholdInput}% Required
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="60"
                  max="90"
                  step="5"
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="shrink-0 w-12 text-center font-mono font-bold text-sm text-slate-800 bg-slate-100 py-1 rounded-lg border border-slate-200">
                  {thresholdInput}%
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 px-1">
                <span>60%</span>
                <span className="font-bold text-indigo-600">75% (Standard)</span>
                <span>90%</span>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Calculate Dynamic Simulation</span>
            </button>

            {/* Live Progress Indicator Widget */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
              <AttendanceGauge
                percentage={simulation.currentPercentage}
                attended={attendedInput}
                total={totalInput}
                threshold={thresholdInput}
                size="md"
                label="Current Attendance Level"
              />
            </div>

          </div>
        </div>

        {/* Right Column: Prominent Results & What-If Visualization (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* ========================================================= */}
          {/* LARGE PROMINENT RESULT BANNER */}
          {/* ========================================================= */}
          {isSafe ? (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 sm:p-7 shadow-lg shadow-emerald-600/15 border border-emerald-400">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider text-emerald-50">
                    Safe Attendance Zone
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    You can miss <span className="underline decoration-white/60 font-mono text-2xl sm:text-3xl">{simulation.maxMissableClasses}</span> more classes and remain at or above {thresholdInput}%.
                  </h3>
                  <p className="text-sm text-emerald-100 font-medium">
                    Missing <span className="font-bold text-white font-mono">{simulation.maxMissableClasses + 1} classes</span> would bring your attendance below {thresholdInput}% (down to <span className="font-mono font-bold text-white">{simulation.nextMissPercentage}%</span>).
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white/10 rounded-xl p-2">
                  <span className="block text-emerald-100 text-[10px] uppercase font-semibold">Current</span>
                  <span className="font-mono font-bold text-base">{simulation.currentPercentage.toFixed(1)}%</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <span className="block text-emerald-100 text-[10px] uppercase font-semibold">After {simulation.maxMissableClasses} Misses</span>
                  <span className="font-mono font-bold text-base">{simulation.percentageAfterMaxMiss.toFixed(1)}%</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <span className="block text-emerald-100 text-[10px] uppercase font-semibold">Threshold</span>
                  <span className="font-mono font-bold text-base">{thresholdInput}.0%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-red-600 text-white p-6 sm:p-7 shadow-lg shadow-rose-600/15 border border-rose-400">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider text-rose-50">
                    Deficit Zone Alert
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    You cannot miss any classes. Current attendance is <span className="font-mono">{simulation.currentPercentage.toFixed(1)}%</span>.
                  </h3>
                  <p className="text-sm text-rose-100 font-medium">
                    You must attend <span className="font-mono font-bold text-white underline decoration-white/60">{simulation.requiredClassesToRecover} consecutive classes</span> to recover back to {thresholdInput}%.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* "WHAT-IF" STEP-BY-STEP VISUALIZATION TIMELINE */}
          {/* ========================================================= */}
          <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-indigo-600" />
                  <span>"What-If" Step-by-Step Simulation Timeline</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Step-by-step projection: CURRENT → Miss 1 → Miss 2... showing the exact drop point
                </p>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                Formula: attended / (total + N)
              </span>
            </div>

            {/* Timeline Steps Display */}
            <div className="space-y-2.5 pt-2">
              {simulation.timeline.map((step) => {
                const isCurrent = step.stepNumber === 0;
                const isDropPoint = step.isDropPoint;
                const isAbove = step.percentage >= thresholdInput;

                return (
                  <div
                    key={step.stepNumber}
                    className={`relative p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-indigo-50/70 border-indigo-200 ring-1 ring-indigo-200'
                        : isDropPoint
                        ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-200 shadow-xs'
                        : isAbove
                        ? 'bg-slate-50/80 border-slate-200'
                        : 'bg-red-50/40 border-red-200 opacity-80'
                    }`}
                  >
                    {/* Left: Step label and equation */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          isCurrent
                            ? 'bg-indigo-600 text-white'
                            : isDropPoint
                            ? 'bg-rose-600 text-white animate-pulse'
                            : isAbove
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isCurrent ? 'NOW' : `+${step.classesMissed}`}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 font-sans">
                            {isCurrent
                              ? 'CURRENT ATTENDANCE'
                              : `Miss ${step.classesMissed} class${step.classesMissed > 1 ? 'es' : ''}`}
                          </span>
                          
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                              Baseline
                            </span>
                          )}

                          {isDropPoint && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white uppercase tracking-wider flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Drops Below {thresholdInput}%
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-mono text-slate-500">
                          {step.attended} / {step.total} classes attended
                        </span>
                      </div>
                    </div>

                    {/* Right: Percentage and Status badge */}
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      {/* Mini bar indicator */}
                      <div className="w-24 hidden md:block">
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isAbove ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(step.percentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`font-mono font-bold text-base ${
                            isAbove ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {step.percentage.toFixed(2)}%
                        </div>
                        <div className="text-[10px] font-medium text-slate-400">
                          {step.deltaFromThreshold >= 0
                            ? `+${step.deltaFromThreshold.toFixed(2)}% margin`
                            : `${step.deltaFromThreshold.toFixed(2)}% deficit`}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isAbove ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3" />
                            Safe
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            Critical
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Note on math verification */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5 text-xs text-slate-500">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Exact Mathematical Simulation:</strong> Every row computes <code className="text-indigo-700 font-mono">attended / (total + N) * 100</code> on the fly in pure TypeScript. For 42/50, N=6 yields exactly 75.00%, while N=7 drops to 73.68%.
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* SUBJECT-WISE ATTENDANCE TABLE */}
      {/* ========================================================= */}
      <section className="rounded-3xl bg-white p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Subject-Wise Attendance Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500">
              Click "Predict" on any subject to instantly load its record into the simulation engine
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            5 Registered Courses
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3 px-3">Subject & Code</th>
                <th className="py-3 px-3">Attended</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Attendance %</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockSubjects.map((sub) => {
                const subSimulation = simulateAttendance(sub.attended, sub.total, 75);
                const isSubSafe = subSimulation.isCurrentlySafe;
                const isSelected = selectedSubjectId === sub.id;

                return (
                  <tr
                    key={sub.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-indigo-50/50 font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{sub.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-semibold text-indigo-600">{sub.code}</span>
                        <span>•</span>
                        <span>{sub.faculty}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-800">
                      {sub.attended}
                    </td>

                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-600">
                      {sub.total}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isSubSafe ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {subSimulation.currentPercentage.toFixed(1)}%
                        </span>
                        {subSimulation.currentPercentage >= 75 ? (
                          <span className="text-[11px] text-emerald-600 font-medium hidden sm:inline">
                            (+{subSimulation.maxMissableClasses} safe)
                          </span>
                        ) : (
                          <span className="text-[11px] text-rose-600 font-medium hidden sm:inline">
                            (Deficit)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {isSubSafe ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" />
                          Safe
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          Deficit
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handlePreFillSubject(sub)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700'
                        }`}
                      >
                        {isSelected ? 'Loaded in Simulator' : 'Predict'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

function SlidersHorizontalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <line x1="4" x2="14" y1="21" y2="21" />
      <line x1="4" x2="10" y1="14" y2="14" />
      <line x1="4" x2="6" y1="7" y2="7" />
      <line x1="18" x2="20" y1="21" y2="21" />
      <line x1="14" x2="20" y1="14" y2="14" />
      <line x1="10" x2="20" y1="7" y2="7" />
      <circle cx="16" cy="21" r="2" />
      <circle cx="12" cy="14" r="2" />
      <circle cx="8" cy="7" r="2" />
    </svg>
  );
}
