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
  Globe,
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

export default function LinkRow({
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
  const [faviconError, setFaviconError] = useState(false);

  const fullShortUrl = `${
    typeof window !== "undefined" ? window.location.origin : "https://aerolink.in"
  }/${url.custom_url || url.short_url}`;

  const statusInfo = getLinkStatus(url, clickCount);

  // Extract destination hostname for clean display
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
    <div className="hidden md:flex items-center justify-between px-4 py-3 bg-surface hover:bg-surface-elevated/70 border border-border-subtle hover:border-border-strong rounded-xl transition-all group">
      {/* 1. Left: Favicon, Title, Short Link & Destination */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
        {/* Favicon or Fallback Icon */}
        <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center flex-shrink-0 text-muted-foreground overflow-hidden">
          {!faviconError ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${destinationHost}&sz=32`}
              alt=""
              className="w-4 h-4 object-contain"
              onError={() => setFaviconError(true)}
            />
          ) : (
            <Globe className="h-4 w-4" />
          )}
        </div>

        {/* Link Information */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <Link
              to={`/link/${url.id}`}
              className="text-xs font-semibold text-foreground hover:text-primary transition-colors truncate max-w-[280px]"
            >
              {url.title || destinationHost}
            </Link>

            {/* Password Protected Pill */}
            {url.password_hash && (
              <span
                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20"
                title="Password protected"
              >
                <Lock className="h-2.5 w-2.5" />
                <span>Protected</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
            {/* Short URL with copy */}
            <span className="font-mono text-primary font-medium hover:underline cursor-pointer" onClick={() => window.open(fullShortUrl, "_blank")}>
              /{url.custom_url || url.short_url}
            </span>

            <span>•</span>

            {/* Destination URL */}
            <a
              href={url.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground flex items-center gap-1 truncate max-w-[220px]"
              title={url.original_url}
            >
              <span className="truncate">{destinationHost}</span>
              <ExternalLink className="h-2.5 w-2.5 opacity-60 flex-shrink-0" />
            </a>

            {/* Tags preview */}
            {Array.isArray(url.tags) && url.tags.length > 0 && (
              <>
                <span>•</span>
                <span className="text-[10px] text-muted-foreground/80 truncate max-w-[120px]">
                  #{url.tags[0]}
                  {url.tags.length > 1 && ` +${url.tags.length - 1}`}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Middle: Status & Click Metric */}
      <div className="flex items-center gap-5 flex-shrink-0 pr-2">
        {/* Status Badge */}
        <StatusBadge status={statusInfo.status} size="sm" />

        {/* Tabular Click Counter */}
        <div className="text-right min-w-[70px]">
          <span className="text-xs font-semibold text-foreground font-mono tabular-nums">
            {clickCount.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground block leading-none">
            clicks
          </span>
        </div>

        {/* Created Date */}
        <span className="text-[11px] text-muted-foreground/70 hidden lg:inline-block min-w-[75px] text-right font-mono">
          {new Date(url.created_at).toLocaleDateString([], {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* 3. Right: Intentional Primary Actions + Overflow Menu */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Primary Action 1: Copy Link */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-surface-elevated rounded-lg"
          title="Copy short URL"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>

        {/* Primary Action 2: Analytics Link */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/link/${url.id}`)}
          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-surface-elevated rounded-lg"
          title="View analytics"
        >
          <BarChart2 className="h-3.5 w-3.5" />
        </Button>

        {/* Secondary Overflow Dropdown (•••) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-surface-elevated rounded-lg"
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
    </div>
  );
}
