// src/components/results/DocumentValidationCard.tsx
import { ShieldCheck, ShieldX, CheckCircle2, XCircle, Database, CalendarCheck, CalendarX } from "lucide-react";
import type { ValidationViewModel } from "../../adapters/documentValidation.adapter";
import { cn } from "../../lib/utils";

interface DocumentValidationCardProps {
  data: ValidationViewModel;
}

export function DocumentValidationCard({ data }: DocumentValidationCardProps) {
  const passedCount = data.checks.filter((c) => c.passed).length;
  const isTrusted = data.documentIdStatus === "TRUSTED";
  const isDobMatch = data.dobStatus === "DOB_MATCH";
  const isDobMismatch = data.dobStatus === "DOB_MISMATCH";

  return (
    <div
      className={cn(
        "card animate-slide-up transition-all",
        isDobMatch && isTrusted && "ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-950/20"
      )}
    >
      <div className="card-header">
        <div className={cn("card-icon", data.overallPassed ? "bg-emerald-500/10" : "bg-red-500/10")}>
          {data.overallPassed ? (
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          ) : (
            <ShieldX className="h-4 w-4 text-red-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">Document &amp; Reference DB Validation</h3>
            {isDobMatch && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                DOB Match
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {passedCount} / {data.checks.length} checks passed • Ref DB ID: {data.documentId || "N/A"}
          </p>
        </div>
        <span
          className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-md tracking-wide",
            data.overallPassed
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-red-500/15 text-red-400"
          )}
        >
          {data.overallPassed ? "ALL CLEAR" : "ISSUES FOUND"}
        </span>
      </div>

      {/* Featured Callout Block: Reference Database & DOB Verification */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Reference DB Lookup Box */}
        <div
          className={cn(
            "p-3 rounded-lg border text-xs flex items-start gap-2.5",
            isTrusted
              ? "bg-slate-950/70 border-slate-800"
              : "bg-red-500/5 border-red-500/20"
          )}
        >
          <Database className={cn("h-4 w-4 flex-shrink-0 mt-0.5", isTrusted ? "text-blue-400" : "text-amber-400")} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Reference Database</span>
              <span
                className={cn(
                  "text-[10px] font-mono font-bold px-1.5 py-0.2 rounded",
                  isTrusted ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"
                )}
              >
                {data.documentIdStatus}
              </span>
            </div>
            <p className="text-xs font-mono font-semibold text-slate-200 mt-1 truncate">
              {data.documentId ? `Document ID: ${data.documentId}` : "No ID indexed in trusted database"}
            </p>
          </div>
        </div>

        {/* DOB Cross-Check Callout Box (Explicitly highlighted for live narrator presentation) */}
        <div
          className={cn(
            "p-3 rounded-lg border text-xs flex items-start gap-2.5",
            isDobMatch
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200 shadow-sm"
              : isDobMismatch
              ? "bg-red-500/10 border-red-500/40 text-red-200"
              : "bg-slate-950/70 border-slate-800 text-slate-300"
          )}
        >
          {isDobMatch ? (
            <CalendarCheck className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <CalendarX className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                DOB Cross-Verification
              </span>
              <span
                className={cn(
                  "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                  isDobMatch
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-red-500/20 text-red-300"
                )}
              >
                {data.dobStatusLabel}
              </span>
            </div>
            <p className="text-xs mt-1 font-mono">
              Doc DOB: <span className="font-semibold text-slate-100">{data.documentDob ?? "N/A"}</span>
              {data.referenceDob && (
                <> • Ref DB: <span className="font-semibold text-slate-100">{data.referenceDob}</span></>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Rules Checklist */}
      <div className="divide-y divide-slate-800/60">
        {data.checks.map((check) => (
          <div key={check.rule} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
            {check.passed ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200">{check.label}</p>
              {check.detail && (
                <p className="text-xs text-slate-500 mt-0.5 truncate" title={check.detail}>
                  {check.detail}
                </p>
              )}
            </div>
            <span
              className={cn(
                "text-[10px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded flex-shrink-0",
                check.passed
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              )}
            >
              {check.passed ? "PASS" : "FAIL"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
