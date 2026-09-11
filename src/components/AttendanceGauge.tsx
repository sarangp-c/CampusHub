import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface AttendanceGaugeProps {
  percentage: number;
  attended: number;
  total: number;
  threshold?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export const AttendanceGauge: React.FC<AttendanceGaugeProps> = ({
  percentage,
  attended,
  total,
  threshold = 75,
  size = "md",
  label = "Overall Attendance",
}) => {
  // SVG circle calculations
  const radius = size === "lg" ? 64 : size === "md" ? 52 : 38;
  const strokeWidth = size === "lg" ? 10 : size === "md" ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  // 75% threshold position for dash marker
  const thresholdDashoffset = circumference - (threshold / 100) * circumference;

  // Determine status & color scheme
  let color = "text-emerald-600";
  let strokeColor = "#059669"; // emerald-600
  let bgColor = "bg-emerald-50";
  let borderColor = "border-emerald-200";
  let badgeText = "Safe";
  let icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;

  if (percentage < 70) {
    color = "text-rose-600";
    strokeColor = "#e11d48"; // rose-600
    bgColor = "bg-rose-50";
    borderColor = "border-rose-200";
    badgeText = "Critical Deficit";
    icon = <AlertCircle className="w-4 h-4 text-rose-600" />;
  } else if (percentage < threshold) {
    color = "text-amber-600";
    strokeColor = "#d97706"; // amber-600
    bgColor = "bg-amber-50";
    borderColor = "border-amber-200";
    badgeText = "Borderline";
    icon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
  }

  const svgDimensions = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={svgDimensions}
          height={svgDimensions}
          viewBox={`0 0 ${svgDimensions} ${svgDimensions}`}
          className="rotate-[-90deg] transform drop-shadow-xs"
        >
          {/* Background Track Circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* 75% Threshold Marker Line */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="transparent"
            stroke="#94a3b8"
            strokeWidth={strokeWidth + 2}
            strokeDasharray={`2 ${circumference - 2}`}
            strokeDashoffset={thresholdDashoffset}
            className="opacity-70"
          />

          {/* Active Percentage Circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className={`font-mono font-extrabold tracking-tight ${
              size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-lg"
            } ${color}`}
          >
            {percentage.toFixed(1)}%
          </span>
          <span className="text-[11px] font-semibold text-slate-500 font-mono mt-0.5">
            {attended}/{total}
          </span>
        </div>
      </div>

      {/* Label and Badge below */}
      <div className="mt-3 flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${bgColor} ${color} border ${borderColor}`}
        >
          {icon}
          {badgeText} ({percentage >= threshold ? ">=75%" : "<75%"})
        </span>
      </div>
      {label && <span className="text-xs text-slate-500 mt-1 font-medium">{label}</span>}
    </div>
  );
};
