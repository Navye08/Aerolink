import {useEffect, useState, useMemo} from "react";
import {useNavigate, useParams, Link} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
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
import {MetricCardSkeleton} from "@/components/skeleton-loader";

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
        <div className="h-6 bg-gray-800 rounded w-32 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Back Navigation */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Main Link Header Card */}
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate max-w-lg">
              {link.title}
            </h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                statusInfo.status === "active"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : statusInfo.status === "disabled"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-gray-700 text-gray-400 border-gray-600"
              }`}
            >
              {statusInfo.label}
            </span>
            {link.password_hash && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
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
              className="text-lg sm:text-xl font-bold text-blue-400 hover:underline truncate max-w-xl"
            >
              {fullShortUrl}
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-gray-400 hover:text-white"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Destination URL */}
          <a
            href={link.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1 truncate max-w-xl"
          >
            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{link.original_url}</span>
          </a>

          {/* Metadata & Tag Pills */}
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap pt-1">
            <span>Created {new Date(link.created_at).toLocaleDateString()}</span>
            {link.expires_at && (
              <span className="flex items-center gap-1 text-amber-400">
                <Calendar className="h-3.5 w-3.5" />
                Expires {new Date(link.expires_at).toLocaleString()}
              </span>
            )}
            {link.max_clicks && (
              <span>Cap: {stats?.length || 0} / {link.max_clicks} clicks</span>
            )}
            {Array.isArray(link.tags) &&
              link.tags.map((t, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-[10px] border border-gray-700"
                >
                  #{t}
                </span>
              ))}
          </div>

          {link.notes && (
            <p className="text-xs text-gray-400 bg-gray-950/60 p-2.5 rounded-lg border border-gray-800 max-w-xl">
              <strong>Notes:</strong> {link.notes}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQrModal(true)}
            className="text-xs font-semibold gap-1.5 border-gray-700 hover:bg-gray-800"
          >
            <QrCode className="h-3.5 w-3.5 text-blue-400" />
            QR Studio
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditModal(true)}
            className="text-xs font-semibold gap-1.5 border-gray-700 hover:bg-gray-800"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={isToggling}
            className={`text-xs font-semibold gap-1.5 border-gray-700 hover:bg-gray-800 ${
              link.is_active ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            {link.is_active ? "Disable" : "Enable"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs font-semibold gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Analytics Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-400">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-400">{stats?.length || 0}</div>
            <p className="text-[11px] text-gray-500 mt-1">All-time link visits</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-400">Unique Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">
              {analyticsData.uniqueVisitors}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Privacy-hashed unique devices</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-400">Clicks Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-400">
              {analyticsData.clicksToday}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-400">Clicks This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-purple-400">
              {analyticsData.clicksThisWeek}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Past 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Filtering & Export Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white">Visitor Intelligence & Telemetry</h3>
          <p className="text-xs text-gray-400">
            Real-time breakdown of devices, locations, and referrer sources.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
            className="text-xs font-medium border-gray-700 hover:bg-gray-800 text-gray-300 gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Detailed Analytics Dashboard */}
      {loadingStats ? (
        <div className="space-y-4">
          <MetricCardSkeleton />
        </div>
      ) : (
        <AnalyticsDashboardView analyticsData={analyticsData} />
      )}

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
