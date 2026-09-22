import {Calendar} from "lucide-react";

const RANGES = [
  {id: "today", label: "Today"},
  {id: "7d", label: "7D"},
  {id: "30d", label: "30D"},
  {id: "all", label: "All Time"},
];

export default function DateRangeFilter({selectedRange = "all", onChange}) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-surface-elevated border border-border-subtle rounded-lg">
      <div className="hidden sm:flex items-center gap-1.5 px-2 text-xs text-muted-foreground font-medium border-r border-border-subtle mr-0.5">
        <Calendar className="h-3 w-3 text-primary" />
        <span>Window</span>
      </div>
      {RANGES.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onChange(r.id)}
          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
            selectedRange === r.id
              ? "bg-primary text-white shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-surface"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
