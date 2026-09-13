// src/components/results/OcrResultCard.tsx
import { FileText, CheckCircle2 } from "lucide-react";
import type { OcrViewModel } from "../../adapters/ocr.adapter";
import { cn } from "../../lib/utils";

interface OcrResultCardProps {
  data: OcrViewModel;
}

export function OcrResultCard({ data }: OcrResultCardProps) {
  const confidencePct = Math.round(data.confidence * 100);

  return (
    <div className="card animate-slide-up ring-1 ring-blue-500/20 shadow-lg shadow-blue-950/20">
      <div className="card-header">
        <div className="card-icon bg-blue-500/10">
          <FileText className="h-4 w-4 text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">OCR Document AI Extraction</h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
              Clean Text Scan
            </span>
          </div>
          <p className="text-xs text-slate-500 capitalize">
            {data.documentType.replace(/_/g, " ")} • RapidOCR + ICAO Doc 9303 Parser
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Confidence</span>
          <span
            className={cn(
              "text-sm font-bold",
              confidencePct >= 90 ? "text-emerald-400" : confidencePct >= 70 ? "text-amber-400" : "text-red-400"
            )}
          >
            {confidencePct}%
          </span>
          <div className="h-1.5 w-20 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                confidencePct >= 90 ? "bg-emerald-500" : confidencePct >= 70 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Field grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
        {data.fields.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">{label}</dt>
            <dd className="text-sm font-medium text-slate-100 truncate">{value || "-"}</dd>
          </div>
        ))}
      </div>

      {/* MRZ block */}
      {data.mrz && (
        <div className="mt-4 rounded-lg bg-slate-950 border border-slate-800 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Machine-Readable Zone (MRZ Checksum Verified)</p>
          <pre className="font-mono text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed">{data.mrz}</pre>
        </div>
      )}

      <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Biographical identity fields successfully mapped to standard traveler schema</span>
      </div>
    </div>
  );
}
