// src/components/results/WatermarkResultCard.tsx
import { Sparkles, ShieldCheck, ShieldAlert, AlertCircle, CheckCircle2 } from "lucide-react";
import type { WatermarkViewModel } from "../../adapters/watermarkVerification.adapter";
import { cn } from "../../lib/utils";

interface WatermarkResultCardProps {
  data: WatermarkViewModel;
}

export function WatermarkResultCard({ data }: WatermarkResultCardProps) {
  const isAuthentic = data.status === "authentic";
  const isSuspicious = data.status === "suspicious";

  return (
    <div className="card animate-slide-up">
      <div className="card-header">
        <div
          className={cn(
            "card-icon",
            isAuthentic ? "bg-cyan-500/10" : isSuspicious ? "bg-red-500/10" : "bg-slate-800"
          )}
        >
          <Sparkles
            className={cn(
              "h-4 w-4",
              isAuthentic ? "text-cyan-400" : isSuspicious ? "text-red-400" : "text-slate-400"
            )}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-100">
            Watermark &amp; Security Print Analysis
          </h3>
          <p className="text-xs text-slate-500">
            {data.watermarkDetected ? data.watermarkTypeLabel : "No security watermark detected"}
          </p>
        </div>

        {/* Verdict Badge */}
        <div className="flex items-center gap-2">
          {isAuthentic ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
              <ShieldCheck className="h-3.5 w-3.5" /> AUTHENTIC
            </span>
          ) : isSuspicious ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-bold font-mono">
              <ShieldAlert className="h-3.5 w-3.5" /> SUSPICIOUS
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-400 text-xs font-mono">
              <AlertCircle className="h-3.5 w-3.5" /> NOT DETECTED
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Confidence meter */}
        {data.watermarkDetected && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Security Pattern Confidence</span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  isAuthentic ? "bg-cyan-500" : "bg-red-500"
                )}
                style={{ width: `${data.confidencePct}%` }}
              />
            </div>
            <span className="text-xs font-mono text-cyan-400">{data.confidencePct}%</span>
          </div>
        )}

        {/* Detail explanation */}
        <div
          className={cn(
            "rounded-lg p-3 border text-xs leading-relaxed flex items-start gap-2.5",
            isAuthentic
              ? "bg-cyan-500/5 border-cyan-500/20 text-slate-300"
              : isSuspicious
              ? "bg-red-500/5 border-red-500/20 text-red-300"
              : "bg-slate-950 border-slate-800 text-slate-400"
          )}
        >
          {isAuthentic ? (
            <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          ) : isSuspicious ? (
            <ShieldAlert className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-medium text-slate-200">{data.statusLabel}</p>
            <p className="mt-0.5 text-slate-400">{data.detail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
