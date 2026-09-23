import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
  Copy,
  Check,
  BarChart2,
  MoreHorizontal,
  ExternalLink,
  Lock,
  QrCode,
  Edit2,
  CopyPlus,
  Power,
  Trash2,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusBadge from "@/components/status-badge";
import {getLinkStatus} from "@/lib/validators";

export default function LinkCardMobile({
  url,
  clickCount = 0,
  onOpenQr,
  onOpenEdit,
  onOpenDuplicate,
  onOpenDelete,
  onToggleStatus,
  isToggling = false,
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const fullShortUrl = `${
    typeof window !== "undefined" ? window.location.origin : "https://aerolink.in"
  }/${url.custom_url || url.short_url}`;

  const statusInfo = getLinkStatus(url, clickCount);

  let destinationHost = url.original_url;
  try {
    const parsed = new URL(url.original_url);
    destinationHost = parsed.hostname.replace(/^www\./, "");
  } catch {
    destinationHost = url.original_url;
  }

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="md:hidden flex flex-col p-4 bg-surface border border-border-subtle rounded-xl space-y-3">
      {/* 1. Header: Title, StatusBadge, Overflow Menu */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <Link
            to={`/link/${url.id}`}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-md"
          >
            {url.title || destinationHost}
          </Link>
          <StatusBadge status={statusInfo.status} size="sm" />
          {url.password_hash && (
            <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Lock className="h-2.5 w-2.5" />
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 bg-surface-elevated border-border-strong p-1 shadow-xl"
          >
            <DropdownMenuItem
              onClick={onOpenQr}
              className="text-xs cursor-pointer hover:bg-surface-hover gap-2"
            >
              <QrCode className="h-3.5 w-3.5 text-primary" />
              <span>QR Studio</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onOpenEdit}
              className="text-xs cursor-pointer hover:bg-surface-hover gap-2"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Link</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onOpenDuplicate}
              className="text-xs cursor-pointer hover:bg-surface-hover gap-2"
            >
              <CopyPlus className="h-3.5 w-3.5" />
              <span>Duplicate Link</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onToggleStatus}
              disabled={isToggling}
              className={`text-xs cursor-pointer hover:bg-surface-hover gap-2 ${
                url.is_active ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              <Power className="h-3.5 w-3.5" />
              <span>{url.is_active ? "Pause Link" : "Enable Link"}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border-subtle" />
            <DropdownMenuItem
              onClick={onOpenDelete}
              className="text-xs cursor-pointer text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Link</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2. Routing: Short Link & Destination Link */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-primary font-medium truncate max-w-[220px] sm:max-w-md">
            /{url.custom_url || url.short_url}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <a
          href={url.original_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 truncate max-w-full"
        >
          <ExternalLink className="h-2.5 w-2.5 flex-shrink-0 opacity-60" />
          <span className="truncate">{url.original_url}</span>
        </a>
      </div>

      {/* 3. Footer: Click Metrics, Created Date, Analytics Button */}
      <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono font-semibold text-foreground tabular-nums">
            {clickCount.toLocaleString()}{" "}
            <span className="font-sans font-normal text-muted-foreground text-[11px]">
              clicks
            </span>
          </span>
          <span className="text-muted-foreground/60">•</span>
          <span className="text-[11px] text-muted-foreground font-mono">
            {new Date(url.created_at).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/link/${url.id}`)}
          className="h-7 px-2 text-xs border-border-subtle hover:bg-surface-elevated text-muted-foreground hover:text-foreground gap-1"
        >
          <BarChart2 className="h-3 w-3" />
          <span>Stats</span>
        </Button>
      </div>
    </div>
  );
}
