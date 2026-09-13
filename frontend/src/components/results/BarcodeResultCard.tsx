// src/components/results/BarcodeResultCard.tsx
import { QrCode, CheckCircle2, AlertTriangle, XCircle, FileCode } from "lucide-react";
import type { BarcodeViewModel } from "../../adapters/barcodeScan.adapter";
import { cn } from "../../lib/utils";

interface BarcodeResultCardProps {
  data: BarcodeViewModel;
}

export function BarcodeResultCard({ data }: BarcodeResultCardProps) {
  const isMatch = data.matchesOcrData === true;
  const isMismatch = data.matchesOcrData === false;

  return (
    <div className="card animate-slide-up">
      <div className="card-header">
        <div className={cn("card-icon", data.barcodeDetected ? "bg-indigo-500/10" : "bg-slate-800")}>
          <QrCode className={cn("h-4 w-4", data.barcodeDetected ? "text-indigo-400" : "text-slate-400")} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-100">Barcode / 2D Matrix Scan</h3>
          <p className="text-xs text-slate-500">
            {data.barcodeDetected ? data.barcodeTypeLabel : "No barcode / QR detected"}
          </p>
        </div>

        {data.barcodeDetected ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Confidence</span>
            <span
              className={cn(
                "text-sm font-bold",
                data.confidencePct >= 90 ? "text-emerald-400" : "text-amber-400"
              )}
            >
              {data.confidencePct}%
            </span>
            <div className="h-1.5 w-16 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                style={{ width: `${data.confidencePct}%` }}
              />
            </div>
          </div>
        ) : (
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            N/A
          </span>
        )}
      </div>

      {data.barcodeDetected ? (
        <div className="space-y-3.5">
          {/* OCR Consistency Cross-Check Status */}
          <div
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border text-xs",
              isMatch
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : isMismatch
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-slate-950 border-slate-800 text-slate-400"
            )}
          >
            <div className="flex items-center gap-2">
              {isMatch ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              ) : isMismatch ? (
                <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
              )}
              <span className="font-medium">
                {isMatch
                  ? "Barcode Payload Matches OCR Fields (100% Cross-Check Match)"
                  : isMismatch
                  ? "Barcode Discrepancy: Encoded fields differ from OCR extraction!"
                  : "Standalone barcode, no overlapping OCR fields to cross-reference"}
              </span>
            </div>
            <span
              className={cn(
                "font-mono font-bold text-[10px] px-2 py-0.5 rounded",
                isMatch
                  ? "bg-emerald-500/20 text-emerald-400"
                  : isMismatch
                  ? "bg-red-500/20 text-red-400"
                  : "bg-slate-800 text-slate-400"
              )}
            >
              {isMatch ? "CONSISTENT" : isMismatch ? "INCONSISTENT" : "UNVERIFIED"}
            </span>
          </div>

          {/* Parsed Fields Grid if available */}
          {data.parsedFields.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                Decoded Structured Fields
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                {data.parsedFields.map(({ key, label, value }) => (
                  <div key={key}>
                    <dt className="text-[10px] uppercase text-slate-500">{label}</dt>
                    <dd className="text-xs font-mono font-medium text-slate-200 truncate">{value}</dd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Decoded Payload */}
          {data.decodedData && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <FileCode className="h-3 w-3" /> Raw Barcode Payload
              </p>
              <pre className="font-mono text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 overflow-x-auto truncate">
                {data.decodedData}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
          No barcode or 2D machine code detected on this document image. Not all passport variants include external 2D codes.
        </div>
      )}
    </div>
  );
}
