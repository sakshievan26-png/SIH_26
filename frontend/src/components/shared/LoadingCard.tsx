// src/components/shared/LoadingCard.tsx
interface LoadingCardProps {
  title: string;
  subtitle?: string;
}

export function LoadingCard({ title, subtitle }: LoadingCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-5 w-5 rounded-full bg-slate-700" />
        <div className="h-4 w-40 rounded bg-slate-700" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-3/4 rounded bg-slate-800" />
        <div className="h-3 w-1/2 rounded bg-slate-800" />
        <div className="h-3 w-2/3 rounded bg-slate-800" />
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
        <span>{subtitle ?? `Running ${title}…`}</span>
      </div>
    </div>
  );
}
