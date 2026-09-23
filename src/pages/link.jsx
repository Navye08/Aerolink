import {useEffect, useState, useMemo} from "react";
import {useNavigate, useParams, Link} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {
  Copy,
  Download,
  ExternalLink,
  Edit2,
  Trash2,
  Power,
  Lock,
  Calendar,
  Check,
  QrCode,
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  Zap,
  Globe,
} from "lucide-react";
import {UrlState} from "@/context";
import useFetch from "@/hooks/use-fetch";
import {getLinkById, deleteLink, toggleLinkStatus} from "@/services/linkService";
import {getClicksForUrl, aggregateAnalytics} from "@/services/analyticsService";
import {exportClicksToCsv} from "@/lib/exportCsv";
import {getLinkStatus} from "@/lib/validators";
import QrModal from "@/components/qr-modal";
import LinkModal from "@/components/link-modal";
import ConfirmDialog from "@/components/confirm-dialog";
import DateRangeFilter from "@/components/date-range-filter";
import {AnalyticsDashboardView} from "@/components/analytics-charts";
import {
  MetricRibbonSkeleton,
  ChartSkeleton,
} from "@/components/skeleton-loader";
import StatusBadge from "@/components/status-badge";

export default function LinkPage() {
  const navigate = useNavigate();
  const {user} = UrlState();
  const {id} = useParams();

  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [selectedRange, setSelectedRange] = useState("all");

  const {
    loading,
    data: link,
    fn: fnLink,
    error,
  } = useFetch(getLinkById, {id, userId: user?.id});

  const {
    loading: loadingStats,
    data: stats,
    fn: fnStats,
  } = useFetch(getClicksForUrl, id);

  useEffect(() => {
    if (user?.id) fnLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, id]);

  useEffect(() => {
    if (!error && loading === false) fnStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error]);

  useEffect(() => {
    if (error) {
      navigate("/dashboard");
    }
  }, [error, navigate]);

  const fullShortUrl = `${
    typeof window !== "undefined" ? window.location.origin : "https://aerolink.in"
  }/${link?.custom_url || link?.short_url || ""}`;

  const statusInfo = getLinkStatus(link, stats?.length || 0);

  let destinationHost = link?.original_url || "";
  try {
    const parsed = new URL(link?.original_url);
    destinationHost = parsed.hostname.replace(/^www\./, "");
  } catch {
    destinationHost = link?.original_url || "";
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = async () => {
    try {
      setIsToggling(true);
      await toggleLinkStatus(link.id, link.is_active);
      fnLink();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteLink(link.id);
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to delete link:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const analyticsData = useMemo(() => {
    return aggregateAnalytics(stats || [], selectedRange);
  }, [stats, selectedRange]);

  if (loading || !link) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-surface-elevated rounded w-32 animate-pulse" />
        <MetricRibbonSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP BREADCRUMB / BACK LINK */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard#links"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Links</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQrModal(true)}
            className="text-xs h-8 border-border-subtle hover:bg-surface-elevated text-foreground gap-1.5 active:scale-[0.98] transition-all"
          >
            <QrCode className="h-3.5 w-3.5 text-primary" />
            <span>QR Studio</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditModal(true)}
            className="text-xs h-8 border-border-subtle hover:bg-surface-elevated text-foreground gap-1.5 active:scale-[0.98] transition-all"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={isToggling}
            className={`text-xs h-8 border-border-subtle hover:bg-surface-elevated gap-1.5 active:scale-[0.98] transition-all ${
              link.is_active ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            <span>{link.is_active ? "Pause" : "Resume"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1.5 active:scale-[0.98] transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* 2. MAIN LINK HEADER HERO */}
      <div className="p-5 sm:p-6 bg-surface border border-border-subtle rounded-xl flex flex-col md:flex-row gap-6 items-start justify-between shadow-2xs">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate max-w-xl">
              {link.title || destinationHost}
            </h1>
            <StatusBadge status={statusInfo.status} size="md" />
            {link.password_hash && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Lock className="h-3 w-3" />
                Passcode Protected
              </span>
            )}
          </div>

          {/* Short URL with 1-click Copy */}
          <div className="flex items-center gap-2">
            <a
              href={fullShortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base sm:text-lg font-mono font-bold text-primary hover:underline truncate max-w-xl"
            >
              {fullShortUrl}
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-surface-elevated rounded-lg active:scale-[0.98] transition-all"
              title="Copy short URL"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
            {copied && (
              <span className="text-xs text-emerald-400 font-medium">Copied!</span>
            )}
          </div>

          {/* Destination URL */}
          <a
            href={link.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 truncate max-w-xl transition-colors"
          >
            <Globe className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/80" />
            <span className="truncate">{link.original_url}</span>
            <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-60" />
          </a>
        </div>
      </div>

      {/* 3. COMPACT METRIC RIBBON */}
      <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-border-subtle grid grid-cols-2 lg:grid-cols-4 shadow-2xs">
        <div className="p-3.5 sm:p-4 hover:bg-surface-elevated/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">Total Clicks</span>
            <TrendingUp className="h-3.5 w-3.5 text-primary/80" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground tabular-nums tracking-tight">
            {(stats?.length || 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
            All-time visits tracked
          </p>
        </div>

        <div className="p-3.5 sm:p-4 hover:bg-surface-elevated/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">Unique Visitors</span>
            <Zap className="h-3.5 w-3.5 text-violet-400/80" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground tabular-nums tracking-tight">
            {analyticsData.uniqueVisitors.toLocaleString()}
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
            Privacy-hashed devices
          </p>
        </div>

        <div className="p-3.5 sm:p-4 hover:bg-surface-elevated/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">Clicks Today</span>
            <Calendar className="h-3.5 w-3.5 text-emerald-400/80" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground tabular-nums tracking-tight">
            {analyticsData.clicksToday.toLocaleString()}
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
            Last 24 hours
          </p>
        </div>

        <div className="p-3.5 sm:p-4 hover:bg-surface-elevated/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">Clicks This Week</span>
            <Calendar className="h-3.5 w-3.5 text-amber-400/80" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground tabular-nums tracking-tight">
            {analyticsData.clicksThisWeek.toLocaleString()}
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
            Past 7 days
          </p>
        </div>
      </div>

      {/* 4. MAIN SPLIT: ANALYTICS SUITE (2/3) + METADATA SIDEBAR (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Analytics Charts Suite */}
        <div className="lg:col-span-2 space-y-5">
          {/* Filtering Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-surface border border-border-subtle rounded-xl shadow-2xs">
            <div>
              <h3 className="text-xs font-semibold text-foreground">
                Visitor Intelligence
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Filtered breakdown for this link
              </p>
            </div>

            <div className="flex items-center gap-2">
              <DateRangeFilter
                selectedRange={selectedRange}
                onChange={setSelectedRange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportClicksToCsv(
                    stats || [],
                    `aerolink-${link.custom_url || link.short_url}-clicks.csv`
                  )
                }
                disabled={!stats || stats.length === 0}
                className="text-xs h-8 border-border-subtle hover:bg-surface-elevated text-muted-foreground hover:text-foreground gap-1.5 active:scale-[0.98] transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">CSV</span>
              </Button>
            </div>
          </div>

          {loadingStats ? (
            <ChartSkeleton />
          ) : (
            <AnalyticsDashboardView analyticsData={analyticsData} />
          )}
        </div>

        {/* Right Column: Link Governance & Settings Metadata */}
        <div className="p-5 bg-surface border border-border-subtle rounded-xl space-y-4">
          <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Link Governance & Settings</span>
          </h3>

          <div className="divide-y divide-border-subtle text-xs">
            {/* Status */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={statusInfo.status} size="sm" />
            </div>

            {/* Created */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-mono text-foreground">
                {new Date(link.created_at).toLocaleDateString([], {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Expiration */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-muted-foreground">Expires</span>
              <span className="font-mono text-foreground">
                {link.expires_at
                  ? new Date(link.expires_at).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Never"}
              </span>
            </div>

            {/* Click Quota */}
            <div className="py-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Click Quota</span>
                <span className="font-mono text-foreground tabular-nums">
                  {link.max_clicks
                    ? `${stats?.length || 0} / ${link.max_clicks}`
                    : "Unlimited"}
                </span>
              </div>
              {link.max_clicks && (
                <div className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      (stats?.length || 0) >= link.max_clicks
                        ? "bg-rose-500"
                        : (stats?.length || 0) >= link.max_clicks * 0.8
                        ? "bg-amber-400"
                        : "bg-primary"
                    }`}
                    style={{
                      width: `${Math.min(
                        Math.round(((stats?.length || 0) / link.max_clicks) * 100),
                        100
                      )}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Password Protection */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-muted-foreground">Security</span>
              <span className="font-medium text-foreground">
                {link.password_hash ? "Password Enabled" : "Public Link"}
              </span>
            </div>

            {/* Tags */}
            <div className="py-2.5 space-y-1.5">
              <span className="text-muted-foreground block">Tags</span>
              {Array.isArray(link.tags) && link.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {link.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle text-[11px] text-muted-foreground"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground/60 text-[11px]">No tags assigned</span>
              )}
            </div>

            {/* Notes */}
            {link.notes && (
              <div className="py-2.5 space-y-1">
                <span className="text-muted-foreground block">Internal Notes</span>
                <p className="p-2.5 rounded-lg bg-surface-elevated border border-border-subtle text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {link.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showQrModal && (
        <QrModal
          isOpen={showQrModal}
          onOpenChange={setShowQrModal}
          url={fullShortUrl}
          title={link.title}
        />
      )}

      {showEditModal && (
        <LinkModal
          isOpen={showEditModal}
          onOpenChange={setShowEditModal}
          mode="edit"
          initialData={link}
          userId={user?.id}
          onSuccess={() => {
            fnLink();
            fnStats();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Short Link?"
        description={`Are you sure you want to delete "${link.title}"? All analytics and redirection for ${fullShortUrl} will permanently stop.`}
        confirmText="Delete Link"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
