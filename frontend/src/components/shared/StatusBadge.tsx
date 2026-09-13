// src/components/shared/StatusBadge.tsx
import { cn } from "../../lib/utils";
import type { RiskDecision } from "../../contracts/common";

interface StatusBadgeProps {
  decision: RiskDecision;
  size?: "sm" | "lg";
}

const DECISION_STYLES: Record<RiskDecision, { label: string; className: string }> = {
  accept: {
    label: "ACCEPT",
    className: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
  },
  flag: {
    label: "FLAG",
    className: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
  },
  reject: {
    label: "REJECT",
    className: "bg-red-500/15 text-red-400 ring-1 ring-red-500/30",
  },
};

export function StatusBadge({ decision, size = "sm" }: StatusBadgeProps) {
  const { label, className } = DECISION_STYLES[decision];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded font-mono font-bold tracking-widest uppercase",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-4 py-1.5 text-sm",
        className
      )}
    >
      {label}
    </span>
  );
}
