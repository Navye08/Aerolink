import {useEffect, useState, useMemo} from "react";
import {Search, Filter, ArrowUpDown, Download, BarChart2, Layers} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {CreateLink} from "@/components/create-link";
import LinkCard from "@/components/link-card";
import EmptyState from "@/components/empty-state";
import {MetricCardSkeleton, LinkCardSkeleton} from "@/components/skeleton-loader";
import DateRangeFilter from "@/components/date-range-filter";
import {AnalyticsDashboardView} from "@/components/analytics-charts";
import ErrorAlert from "@/components/error";

import useFetch from "@/hooks/use-fetch";
import {getLinks} from "@/services/linkService";
import {getClicksForUrls, aggregateAnalytics} from "@/services/analyticsService";
import {exportClicksToCsv} from "@/lib/exportCsv";
import {getLinkStatus} from "@/lib/validators";
import {UrlState} from "@/context";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [analyticsDateRange, setAnalyticsDateRange] = useState("all");

  const {user} = UrlState();
  const {loading, error, data: links, fn: fnLinks} = useFetch(getLinks, user?.id);
  const {
    loading: loadingClicks,
    data: clicks,
    fn: fnClicks,
  } = useFetch(
    getClicksForUrls,
    links?.map((l) => l.id)
  );

  useEffect(() => {
    if (user?.id) {
      fnLinks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (links?.length) {
      fnClicks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [links?.length]);

  // Click count map by URL ID
  const clickCountMap = useMemo(() => {
    const map = {};
    (clicks || []).forEach((c) => {
      map[c.url_id] = (map[c.url_id] || 0) + 1;
    });
    return map;
  }, [clicks]);

  // Extract all unique tags across user's links
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
        // Search query check
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          link.title?.toLowerCase().includes(q) ||
          link.original_url?.toLowerCase().includes(q) ||
          link.short_url?.toLowerCase().includes(q) ||
          link.custom_url?.toLowerCase().includes(q);

        // Status filter check
        const currentCount = clickCountMap[link.id] || 0;
        const linkStatus = getLinkStatus(link, currentCount).status;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && linkStatus === "active") ||
          (statusFilter === "disabled" && linkStatus === "disabled") ||
          (statusFilter === "expired" &&
            (linkStatus === "expired" || linkStatus === "limit_reached"));

        // Tag filter check
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
    return aggregateAnalytics(clicks || [], analyticsDateRange);
  }, [clicks, analyticsDateRange]);

  // Identify top performing link
  const topLink = useMemo(() => {
    if (!links || links.length === 0) return null;
    let top = null;
    let max = -1;
    links.forEach((l) => {
      const c = clickCountMap[l.id] || 0;
      if (c > max) {
        max = c;
        top = {...l, clicks: c};
      }
    });
    return top;
  }, [links, clickCountMap]);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. TOP METRICS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-gray-400">Total Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-white">{links?.length || 0}</div>
                <p className="text-[11px] text-gray-500 mt-1">Short URLs active</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-gray-400">Total Clicks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-blue-400">
                  {clicks?.length || 0}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">All-time tracked visitors</p>
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
                <p className="text-[11px] text-gray-500 mt-1">In past 24 hours</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-gray-400">Top Performing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-base font-bold text-white truncate max-w-[200px]">
                  {topLink ? topLink.title : "—"}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {topLink ? `${topLink.clicks} total clicks` : "No clicks yet"}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 2. TABS: MY LINKS vs. PLATFORM ANALYTICS */}
      <Tabs defaultValue="links" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="links" className="gap-2 text-xs font-semibold">
              <Layers className="h-4 w-4" />
              My Links ({links?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 text-xs font-semibold">
              <BarChart2 className="h-4 w-4" />
              Analytics Overview
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportClicksToCsv(clicks || [], "aerolink-all-clicks.csv")}
              disabled={!clicks || clicks.length === 0}
              className="text-xs font-medium border-gray-700 hover:bg-gray-800 text-gray-300 gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <CreateLink onSuccess={fnLinks} />
          </div>
        </div>

        {/* TAB 1: LINKS MANAGEMENT */}
        <TabsContent value="links" className="space-y-6 m-0">
          {/* Search, Filter, and Sort Toolbar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search by title, alias, or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs bg-gray-900 border-gray-800"
              />
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 px-2 py-1 rounded-lg text-xs text-gray-400">
                <Filter className="h-3.5 w-3.5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none text-gray-300 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Tag Filter */}
              {allTags.length > 0 && (
                <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 px-2 py-1 rounded-lg text-xs text-gray-400">
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="bg-transparent border-none text-gray-300 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Tags</option>
                    {allTags.map((t) => (
                      <option key={t} value={t}>
                        #{t}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 px-2 py-1 rounded-lg text-xs text-gray-400">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-gray-300 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most_clicks">Most Clicks</option>
                  <option value="least_clicks">Least Clicks</option>
                </select>
              </div>
            </div>
          </div>

          {error && <ErrorAlert message={error.message} />}

          {/* Links List */}
          <div className="space-y-3">
            {loading ? (
              <>
                <LinkCardSkeleton />
                <LinkCardSkeleton />
                <LinkCardSkeleton />
              </>
            ) : filteredLinks.length === 0 ? (
              <EmptyState
                title={searchQuery ? "No matching links found" : "No links created yet"}
                description={
                  searchQuery
                    ? "Try adjusting your search query or reset your filters."
                    : "Create your first short link with custom aliases, password protection, and telemetry."
                }
                actionLabel={searchQuery ? "Clear Search" : "Create Link"}
                onAction={searchQuery ? () => setSearchQuery("") : undefined}
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
        </TabsContent>

        {/* TAB 2: ANALYTICS OVERVIEW */}
        <TabsContent value="analytics" className="space-y-6 m-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Aggregated Performance</h3>
              <p className="text-xs text-gray-400">
                Cross-link visitor intelligence, geo breakdown, and device distribution.
              </p>
            </div>
            <DateRangeFilter
              selectedRange={analyticsDateRange}
              onChange={setAnalyticsDateRange}
            />
          </div>

          {loadingClicks ? (
            <div className="space-y-4">
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </div>
          ) : (
            <AnalyticsDashboardView analyticsData={analyticsData} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
