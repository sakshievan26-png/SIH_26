// src/components/results/TamperingResultCard.tsx
import { ScanSearch, ShieldAlert, ShieldCheck, MapPin, Activity } from "lucide-react";
import type { TamperingViewModel } from "../../adapters/tamperingDetection.adapter";
import { cn } from "../../lib/utils";

interface TamperingResultCardProps {
  data: TamperingViewModel;
}

export function TamperingResultCard({ data }: TamperingResultCardProps) {
  const confidencePct = Math.round(data.confidence * 100);
  const isElaHigh = (data.ela?.averageScore ?? 0) > 5.0 || (data.ela?.maxDifference ?? 0) > 40;

  return (
    <div
      className={cn(
        "card animate-slide-up transition-all",
        data.tampered && "border-red-500/40 bg-red-950/10 shadow-lg shadow-red-950/30 ring-1 ring-red-500/30"
      )}
    >
      <div className="card-header">
        <div className={cn("card-icon", data.tampered ? "bg-red-500/20" : "bg-emerald-500/10")}>
          <ScanSearch className={cn("h-4 w-4", data.tampered ? "text-red-400" : "text-emerald-400")} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">Tampering &amp; Forgery Detection</h3>
            {data.tampered && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                Anomaly Detected
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {data.methods.length} analysis method{data.methods.length !== 1 ? "s" : ""} applied • ELA + CNN Classifier
          </p>
        </div>

        {/* Verdict hero */}
        <div className="flex items-center gap-2">
          {data.tampered ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-500/20 border border-red-500/40">
              <ShieldAlert className="h-4 w-4 text-red-400 animate-bounce" />
              <span className="font-bold text-red-400 tracking-wide text-xs font-mono">FORGERY / TAMPERED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/15 border border-emerald-500/30">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-bold text-emerald-400 tracking-wide text-xs font-mono">AUTHENTIC</span>
            </div>
          )}
        </div>
      </div>

      {/* ELA Score Indicator Section */}
      {data.ela && (
        <div
          className={cn(
            "mb-4 p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3",
            isElaHigh
              ? "bg-red-500/10 border-red-500/30 text-red-200"
              : "bg-slate-950/70 border-slate-800 text-slate-300"
          )}
        >
          <div className="flex items-center gap-2">
            <Activity className={cn("h-4 w-4 flex-shrink-0", isElaHigh ? "text-red-400 animate-pulse" : "text-blue-400")} />
            <div>
              <span className="font-semibold text-slate-200">Error Level Analysis (ELA) Metric</span>
              <p className="text-[11px] text-slate-400">
                JPEG compression noise differential across document surface
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Avg Difference</span>
              <span className={cn("font-bold", isElaHigh ? "text-red-400 text-sm" : "text-emerald-400")}>
                {data.ela.averageScore.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Max Peak</span>
              <span className={cn("font-bold", isElaHigh ? "text-red-400 text-sm" : "text-slate-300")}>
                {data.ela.maxDifference.toFixed(1)}
              </span>
            </div>
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded",
                isElaHigh ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/15 text-emerald-400"
              )}
            >
              {isElaHigh ? "ELA ANOMALY" : "ELA CLEAN"}
            </span>
          </div>
        </div>
      )}

      {/* Detection methods */}
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Detection Methods Applied</p>
        <div className="flex flex-wrap gap-1.5">
          {data.methods.map((m) => (
            <span key={m} className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Model confidence */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-slate-500">Model Confidence</span>
        <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              data.tampered ? "bg-red-500" : "bg-blue-500"
            )}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
        <span className="text-xs font-mono text-slate-300">{confidencePct}%</span>
      </div>

      {/* Flagged regions */}
      {data.flaggedRegions.length === 0 ? (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400">
          No suspicious regions detected. Document pixel distribution and stamps confirmed authentic.
        </div>
      ) : (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-red-400 font-semibold mb-2">
            Flagged Tampered Regions ({data.flaggedRegions.length})
          </p>
          <div className="space-y-2">
            {data.flaggedRegions.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs"
              >
                <MapPin className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                <span className="font-semibold text-red-200 flex-1 capitalize">
                  {r.label}
                  {r.bbox && (
                    <span className="ml-2 font-mono text-[10px] text-slate-400 font-normal">
                      [x: {r.bbox.x}, y: {r.bbox.y}, w: {r.bbox.w}, h: {r.bbox.h}]
                    </span>
                  )}
                </span>
                <span className="font-mono text-red-400 font-bold">{r.confidencePct}% confidence</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
