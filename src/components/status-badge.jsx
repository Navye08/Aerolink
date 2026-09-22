import {CheckCircle2, PauseCircle, Clock, ShieldAlert} from "lucide-react";

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dotClassName: "bg-emerald-400",
  },
  disabled: {
    label: "Paused",
    icon: PauseCircle,
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dotClassName: "bg-amber-400",
  },
  expired: {
    label: "Expired",
    icon: Clock,
    className: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    dotClassName: "bg-rose-400",
  },
  limit_reached: {
    label: "Limit Reached",
    icon: ShieldAlert,
    className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    dotClassName: "bg-orange-400",
  },
  default: {
    label: "Unknown",
    icon: Clock,
    className: "bg-gray-800 text-gray-400 border-gray-700",
    dotClassName: "bg-gray-400",
  },
};

export default function StatusBadge({status = "active", showIcon = true, size = "sm"}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.default;
  const Icon = config.icon;

  const sizeClasses =
    size === "md"
      ? "text-xs px-2.5 py-1 gap-1.5"
      : "text-[11px] px-2 py-0.5 gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors select-none ${config.className} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClassName} ${status === "active" ? "animate-pulse" : ""}`} />
      {showIcon && <Icon className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} />}
      <span>{config.label}</span>
    </span>
  );
}
