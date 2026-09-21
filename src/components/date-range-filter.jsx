import {Calendar} from "lucide-react";

const RANGES = [
  {id: "all", label: "All Time"},
  {id: "today", label: "Today"},
  {id: "7d", label: "Last 7 Days"},
  {id: "30d", label: "Last 30 Days"},
];

export default function DateRangeFilter({selectedRange = "all", onChange}) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-gray-900 border border-gray-800 rounded-lg flex-wrap">
      <div className="flex items-center gap-1 px-2 text-xs text-gray-400 font-medium">
        <Calendar className="h-3.5 w-3.5 text-blue-400" />
        <span className="hidden sm:inline">Range:</span>
      </div>
      {RANGES.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onChange(r.id)}
          className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
            selectedRange === r.id
              ? "bg-blue-600 text-white shadow-sm font-semibold"
              : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
