import {useEffect, useState, useMemo} from "react";
import {useLocation, useNavigate, useSearchParams, Link} from "react-router-dom";
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  BarChart3,
  Layers,
  Link2,
  TrendingUp,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Plus,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import LinkModal from "@/components/link-modal";
import LinkCard from "@/components/link-card";
import EmptyState from "@/components/empty-state";
import {
  MetricRibbonSkeleton,
  LinkRowSkeleton,
  ChartSkeleton,
} from "@/components/skeleton-loader";
import DateRangeFilter from "@/components/date-range-filter";
import {
  AnalyticsDashboardView,
  ClickTrendChart,
} from "@/components/analytics-charts";
import ErrorAlert from "@/components/error";

import useFetch from "@/hooks/use-fetch";
import {getLinks} from "@/services/linkService";
import {getClicksForUrls, aggregateAnalytics} from "@/services/analyticsService";
import {exportClicksToCsv} from "@/lib/exportCsv";
import {getLinkStatus} from "@/lib/validators";
import {UrlState} from "@/context";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view tab (synced with URL hash)
  const [activeTab, setActiveTab] = useState(() => {
    if (location.hash === "#links") return "links";
    if (location.hash === "#analytics") return "analytics";
    return "overview";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [analyticsDateRange, setAnalyticsDateRange] = useState("all");
  const [copiedTopId, setCopiedTopId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalInitialData, setCreateModalInitialData] = useState(null);

  const {user} = UrlState();
  const {loading, error, data: links, fn: fnLinks} = useFetch(getLinks, user?.id);
  const linkIds = useMemo(() => (links ? links.map((l) => l.id) : []), [links]);
  const linkIdsKey = useMemo(() => linkIds.join(","), [linkIds]);
  const {
    loading: loadingClicks,
    data: clicks,
    fn: fnClicks,
  } = useFetch(getClicksForUrls, linkIds);

  // Automatically trigger LinkModal pre-filled if createNew query parameter is present
  useEffect(() => {
    const createNewParam = searchParams.get("createNew");
    if (createNewParam) {
      setCreateModalInitialData({ destinationUrl: createNewParam });
      setIsCreateModalOpen(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("createNew");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (location.hash === "#links") setActiveTab("links");
    else if (location.hash === "#analytics") setActiveTab("analytics");
    else if (location.hash === "#overview" || !location.hash) setActiveTab("overview");
  }, [location.hash]);

  useEffect(() => {
    if (user?.id) fnLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (links?.length) fnClicks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkIdsKey]);

  // Guard against stale clicks state leak when links is empty or cleared
  const effectiveClicks = useMemo(() => {
    if (!links || links.length === 0) return [];
    const linkIdSet = new Set(links.map((l) => l.id));
    return (clicks || []).filter((c) => linkIdSet.has(c.url_id));
  }, [links, clicks]);

  // Click count lookup map
  const clickCountMap = useMemo(() => {
    const map = {};
    effectiveClicks.forEach((c) => {
      map[c.url_id] = (map[c.url_id] || 0) + 1;
    });
    return map;
  }, [effectiveClicks]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    (links || []).forEach((l) => {
      if (Array.isArray(l.tags)) {
        l.tags.forEach((t) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [links]);

  // Filter and sort links
  const filteredLinks = useMemo(() => {
    if (!links) return [];

    return links
      .filter((link) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          link.title?.toLowerCase().includes(q) ||
          link.original_url?.toLowerCase().includes(q) ||
          link.short_url?.toLowerCase().includes(q) ||
          link.custom_url?.toLowerCase().includes(q);

        const currentCount = clickCountMap[link.id] || 0;
        const linkStatus = getLinkStatus(link, currentCount).status;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && linkStatus === "active") ||
          (statusFilter === "disabled" && linkStatus === "disabled") ||
          (statusFilter === "expired" &&
            (linkStatus === "expired" || linkStatus === "limit_reached"));

        const matchesTag =
          selectedTag === "all" ||
          (Array.isArray(link.tags) && link.tags.includes(selectedTag));

        return matchesSearch && matchesStatus && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at) - new Date(b.created_at);
        }
        if (sortBy === "most_clicks") {
          return (clickCountMap[b.id] || 0) - (clickCountMap[a.id] || 0);
        }
        if (sortBy === "least_clicks") {
          return (clickCountMap[a.id] || 0) - (clickCountMap[b.id] || 0);
        }
        return 0;
      });
  }, [links, searchQuery, statusFilter, selectedTag, sortBy, clickCountMap]);

  // Aggregate high-level analytics
  const analyticsData = useMemo(() => {
    return aggregateAnalytics(effectiveClicks, analyticsDateRange);
  }, [effectiveClicks, analyticsDateRange]);

  // Ranked top links
  const rankedLinks = useMemo(() => {
    if (!links) return [];
    return [...links]
      .map((l) => ({...l, clicks: clickCountMap[l.id] || 0}))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 4);
  }, [links, clickCountMap]);

  // Active links count
  const activeLinksCount = useMemo(() => {
    if (!links) return 0;
    return links.filter(
      (l) => getLinkStatus(l, clickCountMap[l.id] || 0).status === "active"
    ).length;
  }, [links, clickCountMap]);

  const handleCopyTopLink = (l) => {
    const full = `${window.location.origin}/${l.custom_url || l.short_url}`;
    navigator.clipboard.writeText(full);
    setCopiedTopId(l.id);
    setTimeout(() => setCopiedTopId(null), 2000);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    navigate(`/dashboard${tab === "overview" ? "" : `#${tab}`}`, {replace: true});
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & PRIMARY ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {activeTab === "overview" && "Workspace Overview"}
            {activeTab === "links" && "Links Management"}
            {activeTab === "analytics" && "Analytics Intelligence"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeTab === "overview" && "Monitor real-time engagement and manage your short links."}
            {activeTab === "links" && `Organize and inspect your ${links?.length || 0} shortened links.`}
            {activeTab === "analytics" && "Cross-link traffic trends, geographic intelligence, and visitor telemetry."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => {
              setCreateModalInitialData(null);
              setIsCreateModalOpen(true);
            }}
            className="bg-primary hover:bg-blue-500 text-white font-medium text-xs h-9 px-4 gap-2 shadow-sm shadow-blue-500/25 transition-all active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Create Link</span>
          </Button>
        </div>
      </div>

      {/* 2. COMPACT UNIFIED METRIC RIBBON */}
      {loading ? (
        <MetricRibbonSkeleton />
      ) : (
        <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-border-subtle grid grid-cols-2 lg:grid-cols-4 shadow-2xs">
          {/* Metric 1: Total Clicks */}
          <div className="p-3.5 sm:p-4 hover:bg-surface-elevated/40 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
                Total Clicks
              </span>
              <TrendingUp className="h-3.5 w-3.5 text-primary/80" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-foreground tabular-nums tracking-tight">
                {effectiveClicks.length.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">tracked</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
              All-time visitors tracked
            </p>
          </div>

          {/* Metric 2: Active Links */}
          <div className="p-3.5 sm:p-4 hover:bg-surface-elevated/40 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
                Active Links
              </span>
              <Link2 className="h-3.5 w-3.5 text-emerald-400/80" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-foreground tabular-nums tracking-tight">
                {activeLinksCount}
              </span>
              <span className="text-xs text-muted-foreground/70 font-mono">
                / {links?.length || 0}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
              Routing traffic normally
            </p>
          </div>

          {/* Metric 3: Unique Visitors */}
          <div className="p-3.5 sm:p-4 hover:bg-surface-elevated/40 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
                Unique Visitors
              </span>
              <Zap className="h-3.5 w-3.5 text-violet-400/80" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-foreground tabular-nums tracking-tight">
                {analyticsData.uniqueVisitors.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">devices</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
              Privacy-hashed visitors
            </p>
          </div>

          {/* Metric 4: Clicks Today */}
          <div className="p-3.5 sm:p-4 hover:bg-surface-elevated/40 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
                Clicks Today
              </span>
              <BarChart3 className="h-3.5 w-3.5 text-amber-400/80" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-foreground tabular-nums tracking-tight">
                {analyticsData.clicksToday.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">past 24h</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
              Recent visitor engagement
            </p>
          </div>
        </div>
      )}

      {/* 3. VIEW SELECTOR TABS (Overview, Links, Analytics) */}
      <div className="flex items-center gap-1 p-1 bg-surface border border-border-subtle rounded-xl w-fit shadow-2xs">
        <button
          type="button"
          onClick={() => switchTab("overview")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "overview"
              ? "bg-surface-elevated text-foreground font-semibold shadow-xs border border-border-subtle/80"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-hover/50"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("links")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "links"
              ? "bg-surface-elevated text-foreground font-semibold shadow-xs border border-border-subtle/80"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-hover/50"
          }`}
        >
          <Link2 className="h-3.5 w-3.5" />
          <span>My Links</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface text-muted-foreground font-mono border border-border-subtle">
            {links?.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("analytics")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "analytics"
              ? "bg-surface-elevated text-foreground font-semibold shadow-xs border border-border-subtle/80"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-hover/50"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Analytics</span>
        </button>
      </div>

      {error && <ErrorAlert message={error.message} />}

      {/* ==================================================================== */}
      {/* TAB 1: OVERVIEW DASHBOARD */}
      {/* ==================================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Row: Click Velocity Chart + Top Performing Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Velocity Chart (Left 2/3) */}
            <div className="lg:col-span-2 p-5 bg-surface border border-border-subtle rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-foreground">
                    Click Velocity
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Visitor engagement across all active links
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => switchTab("analytics")}
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <span>Full Analytics</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
              {loadingClicks ? (
                <div className="h-64 flex items-center justify-center">
                  <ChartSkeleton />
                </div>
              ) : (
                <ClickTrendChart timeSeries={analyticsData.timeSeries} />
              )}
            </div>

            {/* Top Links (Right 1/3) */}
            <div className="p-5 bg-surface border border-border-subtle rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-foreground">
                    Top Links
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    By Total Clicks
                  </span>
                </div>

                {rankedLinks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    No clicks recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-border-subtle">
                    {rankedLinks.map((l) => (
                      <div
                        key={l.id}
                        className="py-2.5 flex items-center justify-between text-xs group"
                      >
                        <div className="min-w-0 pr-2">
                          <Link
                            to={`/link/${l.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors block truncate max-w-[170px]"
                          >
                            {l.title}
                          </Link>
                          <span className="text-[10px] font-mono text-muted-foreground truncate block">
                            /{l.custom_url || l.short_url}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                            {l.clicks}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyTopLink(l)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                            title="Copy link"
                          >
                            {copiedTopId === l.id ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => switchTab("links")}
                className="w-full text-xs border-border-subtle hover:bg-surface-elevated text-muted-foreground hover:text-foreground mt-2"
              >
                View all links ({links?.length || 0})
              </Button>
            </div>
          </div>

          {/* Quick Recent Links Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-foreground">
                Recent Links
              </h3>
              <button
                type="button"
                onClick={() => switchTab("links")}
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </button>
            </div>

            {loading || links === null ? (
              <div className="space-y-2">
                <LinkRowSkeleton />
                <LinkRowSkeleton />
              </div>
            ) : links.length === 0 ? (
              <EmptyState
                title="No links created yet"
                description="Shorten your first destination URL with custom aliases, QR codes, and password protection."
                actionLabel="Create Link"
                onAction={() => {
                  setCreateModalInitialData(null);
                  setIsCreateModalOpen(true);
                }}
              />
            ) : (
              <div className="space-y-2">
                {(links || []).slice(0, 3).map((link) => (
                  <LinkCard
                    key={link.id}
                    url={link}
                    fetchUrls={fnLinks}
                    clickCount={clickCountMap[link.id] || 0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ==================================================================== */}
      {/* TAB 2: MY LINKS MANAGEMENT */}
      {/* ==================================================================== */}
      {activeTab === "links" && (
        <div className="space-y-3.5 animate-fade-in">
          {/* Unified Compact Toolbar */}
          <div className="p-1.5 sm:p-2 bg-surface border border-border-subtle rounded-xl flex flex-col md:flex-row gap-2 items-stretch md:items-center justify-between shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px] max-w-full md:max-w-xs lg:max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search title, alias, or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-7 h-8 text-xs bg-surface-elevated/40 border-border-subtle rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/60 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-[10px] bg-surface-elevated rounded px-1 transition-colors"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills, Tag Select, Sort, and Export */}
            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
              {/* Status Filter Segmented Control */}
              <div className="inline-flex items-center p-0.5 bg-surface-elevated/60 border border-border-subtle rounded-lg text-xs">
                {["all", "active", "disabled", "expired"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium capitalize transition-all ${
                      statusFilter === st
                        ? "bg-surface text-foreground font-semibold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Tag Filter */}
              {allTags.length > 0 && (
                <div className="flex items-center gap-1 bg-surface-elevated/60 border border-border-subtle px-2 h-8 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Filter className="h-3 w-3 flex-shrink-0" />
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="bg-transparent border-none text-foreground text-xs focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="all" className="bg-surface-elevated text-foreground">
                      All Tags
                    </option>
                    {allTags.map((t) => (
                      <option key={t} value={t} className="bg-surface-elevated text-foreground">
                        #{t}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1 bg-surface-elevated/60 border border-border-subtle px-2 h-8 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowUpDown className="h-3 w-3 flex-shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-foreground text-xs focus:outline-none cursor-pointer pr-1"
                >
                  <option value="newest" className="bg-surface-elevated text-foreground">
                    Newest
                  </option>
                  <option value="oldest" className="bg-surface-elevated text-foreground">
                    Oldest
                  </option>
                  <option value="most_clicks" className="bg-surface-elevated text-foreground">
                    Most Clicks
                  </option>
                  <option value="least_clicks" className="bg-surface-elevated text-foreground">
                    Least Clicks
                  </option>
                </select>
              </div>

              {/* CSV Export Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportClicksToCsv(effectiveClicks, "aerolink-all-clicks.csv")}
                disabled={effectiveClicks.length === 0}
                className="h-8 px-2.5 text-xs border-border-subtle hover:bg-surface-elevated text-muted-foreground hover:text-foreground gap-1.5 rounded-lg active:scale-[0.98] transition-all"
                title="Export clicks telemetry to CSV"
              >
                <Download className="h-3 w-3 flex-shrink-0" />
                <span className="hidden lg:inline text-[11px]">CSV</span>
              </Button>
            </div>
          </div>

          {/* Active Filter Badges & Reset */}
          {(searchQuery || statusFilter !== "all" || selectedTag !== "all") && (
            <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span>
                  Showing {filteredLinks.length} of {links?.length || 0} links
                </span>
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-elevated text-[11px] text-foreground border border-border-subtle capitalize">
                    Status: {statusFilter}
                  </span>
                )}
                {selectedTag !== "all" && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-elevated text-[11px] text-foreground border border-border-subtle">
                    Tag: #{selectedTag}
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-elevated text-[11px] text-foreground border border-border-subtle">
                    &quot;{searchQuery}&quot;
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSelectedTag("all");
                }}
                className="text-[11px] text-primary hover:underline font-medium flex-shrink-0"
              >
                Reset filters
              </button>
            </div>
          )}

          {/* Desktop Table Column Header */}
          {!loading && links && links.length > 0 && filteredLinks.length > 0 && (
            <div className="hidden md:grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.8fr)_100px_90px_76px] lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.8fr)_100px_90px_70px_76px] items-center gap-4 px-4 py-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider select-none">
              <div className="pl-1">Link Title & Details</div>
              <div>Slug & Target</div>
              <div>Status</div>
              <div className="text-right">Clicks</div>
              <div className="text-right hidden lg:block">Created</div>
              <div className="text-right pr-2">Actions</div>
            </div>
          )}

          {/* Links Data Table / Rows */}
          <div className="space-y-2">
            {loading || links === null ? (
              <div className="space-y-2">
                <LinkRowSkeleton />
                <LinkRowSkeleton />
                <LinkRowSkeleton />
                <LinkRowSkeleton />
              </div>
            ) : filteredLinks.length === 0 ? (
              <EmptyState
                title={
                  searchQuery || statusFilter !== "all" || selectedTag !== "all"
                    ? "No matching links found"
                    : "No links in this view"
                }
                description={
                  searchQuery || statusFilter !== "all" || selectedTag !== "all"
                    ? "Try adjusting your search keywords, status filters, or active tags."
                    : "Create a new short link to start tracking engagement and analytics."
                }
                actionLabel={
                  searchQuery || statusFilter !== "all" || selectedTag !== "all"
                    ? "Reset Filters"
                    : "Create Link"
                }
                onAction={
                  searchQuery || statusFilter !== "all" || selectedTag !== "all"
                    ? () => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setSelectedTag("all");
                      }
                    : () => {
                        setCreateModalInitialData(null);
                        setIsCreateModalOpen(true);
                      }
                }
              />
            ) : (
              filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  url={link}
                  fetchUrls={fnLinks}
                  clickCount={clickCountMap[link.id] || 0}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: PLATFORM ANALYTICS OVERVIEW */}
      {/* ==================================================================== */}
      {activeTab === "analytics" && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-surface border border-border-subtle rounded-xl">
            <div>
              <h3 className="text-xs font-semibold text-foreground">
                Telemetry Intelligence Window
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Select a time window to filter clicks, devices, referrers, and locations.
              </p>
            </div>
            <DateRangeFilter
              selectedRange={analyticsDateRange}
              onChange={setAnalyticsDateRange}
            />
          </div>

          {loadingClicks ? (
            <div className="space-y-4">
              <ChartSkeleton />
            </div>
          ) : (
            <AnalyticsDashboardView analyticsData={analyticsData} />
          )}
        </div>
      )}

      {/* Global Link Creation Modal */}
      <LinkModal
        isOpen={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) setCreateModalInitialData(null);
        }}
        mode="create"
        initialData={createModalInitialData}
        userId={user?.id}
        onSuccess={() => {
          fnLinks();
          setCreateModalInitialData(null);
        }}
      />
    </div>
  );
}
