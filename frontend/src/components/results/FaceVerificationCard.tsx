// src/components/results/FaceVerificationCard.tsx
import { UserCheck, UserX, Eye, Activity, AlertOctagon } from "lucide-react";
import type { FaceViewModel } from "../../adapters/faceVerification.adapter";
import { cn } from "../../lib/utils";

interface FaceVerificationCardProps {
  data: FaceViewModel;
}

export function FaceVerificationCard({ data }: FaceVerificationCardProps) {
  // SVG circular progress ring
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progressFraction = Math.max(0, Math.min(1, data.similarityScore));
  const dashoffset = circumference - progressFraction * circumference;

  const ringColor =
    data.similarityScore >= 0.70 ? "#34d399" : data.similarityScore >= 0.40 ? "#fbbf24" : "#f87171";

  return (
    <div
      className={cn(
        "card animate-slide-up transition-all",
        data.matched
          ? "ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-950/20"
          : "ring-1 ring-red-500/40 bg-red-950/10 shadow-lg shadow-red-950/30"
      )}
    >
      <div className="card-header">
        <div className={cn("card-icon", data.matched ? "bg-emerald-500/10" : "bg-red-500/20")}>
          {data.matched ? (
            <UserCheck className="h-4 w-4 text-emerald-400" />
          ) : (
            <UserX className="h-4 w-4 text-red-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">1:1 Biometric Face Verification</h3>
            {data.matched && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Face Matched
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">Document photo vs. live capture • InsightFace Buffalo_L</p>
        </div>

        {/* Verdict Badge */}
        <div className="flex items-center gap-2">
          {data.matched ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <UserCheck className="h-3.5 w-3.5" /> VERIFIED MATCH
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-bold animate-pulse">
              <UserX className="h-3.5 w-3.5" /> MISMATCH DETECTED
            </span>
          )}
        </div>
      </div>

      {/* Prominent Mismatch Warning Banner if failed */}
      {!data.matched && (
        <div className="mb-4 p-3.5 rounded-xl border border-red-500/40 bg-red-500/15 text-red-200 flex items-start gap-3 shadow-md">
          <AlertOctagon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-bold text-sm tracking-wide text-red-300">
                CRITICAL BIOMETRIC MISMATCH
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-950 border border-red-500/40 text-red-300 w-fit">
                THRESHOLD NOT MET
              </span>
            </div>
            <p className="text-xs text-red-300/90 mt-1 leading-relaxed">
              Biometric facial comparison failed to meet the mandatory security threshold.
              The person presenting the document is <strong className="text-white">NOT</strong> the authenticated document holder.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular similarity ring */}
        <div className="relative flex-shrink-0">
          <svg width="104" height="104" viewBox="0 0 104 104" className="-rotate-90">
            <circle cx="52" cy="52" r={radius} fill="none" stroke="#1e293b" strokeWidth="8" />
            <circle
              cx="52"
              cy="52"
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {data.matched ? (
              <>
                <UserCheck className="h-6 w-6 text-emerald-400 mb-0.5" />
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">
                  MATCH
                </span>
              </>
            ) : (
              <>
                <UserX className="h-6 w-6 text-red-400 mb-0.5" />
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider font-mono">
                  MISMATCH
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status details & metrics */}
        <div className="flex-1 space-y-2.5 w-full">
          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <UserCheck className="h-3.5 w-3.5 text-slate-500" />
              Biometric Match Status
            </span>
            <span
              className={cn(
                "font-mono font-bold px-2 py-0.5 rounded text-[11px]",
                data.matched ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/20 text-red-400"
              )}
            >
              {data.matched ? "MATCH CONFIRMED" : "IDENTITY MISMATCH"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              Liveness / Anti-Spoofing
            </span>
            <span
              className={cn(
                "font-mono font-bold px-2 py-0.5 rounded text-[11px]",
                data.liveness ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/20 text-red-400"
              )}
            >
              {data.liveness ? "LIVE PERSON CONFIRMED" : "REPLAY / SPOOF RISK"}
            </span>
          </div>

          <div className="flex items-start gap-2 pt-1 text-xs">
            <Activity className="h-3.5 w-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
            <p className="text-slate-400 leading-relaxed text-[11px]">{data.detail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
