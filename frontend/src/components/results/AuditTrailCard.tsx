// src/components/results/AuditTrailCard.tsx
import { Link2, CheckCircle2, Hash, Layers, Clock } from "lucide-react";
import type { AuditViewModel } from "../../adapters/blockchainAudit.adapter";

interface AuditTrailCardProps {
  data: AuditViewModel;
}

export function AuditTrailCard({ data }: AuditTrailCardProps) {
  return (
    <div className="card animate-slide-up border-emerald-500/20 bg-emerald-500/5">
      <div className="card-header">
        <div className="card-icon bg-emerald-500/10">
          <Link2 className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-100">Blockchain Audit Trail</h3>
          <p className="text-xs text-slate-500">{data.ledger}</p>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs font-semibold">Committed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
            <Hash className="h-3 w-3" /> Transaction Hash
          </p>
          <p className="font-mono text-[11px] text-emerald-400 break-all leading-relaxed">
            {data.txHash}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
            <Layers className="h-3 w-3" /> Block Number
          </p>
          <p className="font-mono text-sm text-slate-200">#{data.blockNumber.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Logged At
          </p>
          <p className="text-sm text-slate-200">{data.timestamp}</p>
        </div>
      </div>

      <div className="mt-4 text-xs text-emerald-600/80">
        This screening decision has been permanently recorded on the immutable distributed ledger.
        It cannot be altered or deleted.
      </div>
    </div>
  );
}
