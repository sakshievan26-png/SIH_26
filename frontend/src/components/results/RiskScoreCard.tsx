// src/components/results/RiskScoreCard.tsx
import { AlertTriangle, TrendingDown, BarChart3, Info } from "lucide-react";
import { StatusBadge } from "../shared/StatusBadge";
import type { RiskViewModel } from "../../adapters/riskScore.adapter";
import { cn } from "../../lib/utils";

interface RiskScoreCardProps {
  data: RiskViewModel;
}

function scoreColor(score: number) {
  if (score <= 25) return { text: "text-emerald-400", ring: "#34d399", bg: "bg-emerald-500" };
  if (score <= 60) return { text: "text-amber-400", ring: "#fbbf24", bg: "bg-amber-500" };
  return { text: "text-red-400", ring: "#f87171", bg: "bg-red-500" };
}

export function RiskScoreCard({ data }: RiskScoreCardProps) {
  const { text, ring, bg } = scoreColor(data.score);

  // Circular score ring
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (data.score / 100) * circumference;

  return (
    <div className="card animate-slide-up">
      <div className="card-header">
        <div className="card-icon bg-blue-500/10">
          <TrendingDown className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Risk Assessment</h3>
          <p className="text-xs text-slate-500">Aggregated from all modules</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
        {/* Score ring */}
        <div className="relative flex-shrink-0 mx-auto sm:mx-0">
          <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
            <circle cx="64" cy="64" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={ring}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-3xl font-black tabular-nums", text)}>{data.score}</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">/ 100</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-4 w-full">
          {/* Decision badge */}
          <div className="flex items-center gap-3">
            <StatusBadge decision={data.decision} size="lg" />
            <span className="text-xs text-slate-500">Final decision</span>
          </div>

          {/* Summary */}
          <div className="flex gap-2">
            <Info className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300 leading-relaxed">{data.summary}</p>
          </div>

          {/* Per-module breakdown */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <BarChart3 className="h-3 w-3" /> Risk Breakdown
            </p>
            <div className="space-y-2">
              {data.breakdown.map(({ label, value, max }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-36 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", bg)}
                      style={{ width: `${(value / max) * 100}%` }}
                    />
                  </div>
                  <span className={cn("text-xs font-mono flex-shrink-0 w-8 text-right", text)}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {data.decision !== "accept" && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300">
            {data.decision === "flag"
              ? "This document requires manual review by a senior officer before clearance."
              : "This document has been rejected. Detain for further investigation."}
          </p>
        </div>
      )}
    </div>
  );
}
