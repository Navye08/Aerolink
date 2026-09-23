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
    <div className="hidden md:grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.8fr)_100px_90px_76px] lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.8fr)_100px_90px_70px_76px] items-center gap-4 px-4 py-3 bg-surface hover:bg-surface-elevated/70 border border-border-subtle hover:border-border-strong rounded-xl transition-colors group shadow-xs">
      {/* 1. Link Title, Favicon & Tags */}
      <div className="flex items-center gap-3 min-w-0 pr-2">
        {/* Favicon or Fallback Icon */}
        <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center flex-shrink-0 text-muted-foreground overflow-hidden shadow-2xs">
          {!faviconError ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${destinationHost}&sz=32`}
              alt=""
              className="w-3.5 h-3.5 object-contain"
              onError={() => setFaviconError(true)}
            />
          ) : (
            <Globe className="h-3.5 w-3.5" />
          )}
        </div>

        {/* Link Information */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              to={`/link/${url.id}`}
              className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate block"
              title={url.title || destinationHost}
            >
              {url.title || destinationHost}
            </Link>

            {/* Password Protected Pill */}
            {url.password_hash && (
              <span
                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 flex-shrink-0"
                title="Passcode protected"
              >
                <Lock className="h-2.5 w-2.5" />
                <span className="hidden xl:inline">Protected</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground truncate">
            {Array.isArray(url.tags) && url.tags.length > 0 ? (
              <span className="truncate text-muted-foreground/80 font-medium">
                #{url.tags[0]}
                {url.tags.length > 1 && ` +${url.tags.length - 1}`}
              </span>
            ) : (
              <span className="text-muted-foreground/40">No tags</span>
            )}
            {url.notes && (
              <>
                <span className="text-muted-foreground/30">•</span>
                <span className="truncate text-muted-foreground/60" title={url.notes}>
                  {url.notes}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Routing Target & Short Slug */}
      <div className="min-w-0 space-y-0.5 pr-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            onClick={() => window.open(fullShortUrl, "_blank")}
            className="font-mono text-xs text-primary font-medium hover:underline cursor-pointer truncate"
            title="Open short link"
          >
            /{url.custom_url || url.short_url}
          </span>
        </div>

        <a
          href={url.original_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 truncate max-w-[210px] transition-colors"
          title={url.original_url}
        >
          <span className="truncate">{destinationHost}</span>
          <ExternalLink className="h-2.5 w-2.5 opacity-60 flex-shrink-0" />
        </a>
      </div>

      {/* 3. Status Badge */}
      <div className="flex items-center min-w-[95px]">
        <StatusBadge status={statusInfo.status} size="sm" />
      </div>

      {/* 4. Tabular Click Counter */}
      <div className="text-right">
        <span className="text-xs font-semibold text-foreground font-mono tabular-nums block">
          {clickCount.toLocaleString()}
        </span>
        <span className="text-[10px] text-muted-foreground block leading-none">
          clicks
        </span>
      </div>

      {/* 5. Created Date (Desktop Only) */}
      <div className="text-right hidden lg:block">
        <span className="text-[11px] text-muted-foreground/70 font-mono">
          {new Date(url.created_at).toLocaleDateString([], {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* 6. Intentional Actions (Copy + Analytics + Overflow) */}
      <div className="flex items-center justify-end gap-1">
        {/* Copy Link */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-surface-elevated rounded-lg"
          title="Copy short URL"
          aria-label="Copy short link"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>

        {/* Analytics Link */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/link/${url.id}`)}
          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-surface-elevated rounded-lg"
          title="View analytics"
          aria-label="View analytics"
        >
          <BarChart2 className="h-3.5 w-3.5" />
        </Button>

        {/* Secondary Overflow Dropdown (•••) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-surface-elevated rounded-lg"
              aria-label="More link actions"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
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
