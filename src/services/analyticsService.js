import {UAParser} from "ua-parser-js";
import supabase from "@/db/supabase";
import {generateVisitorHash} from "@/lib/crypto";

const parser = new UAParser();

/**
 * Records a click event telemetry with privacy-preserving visitor hashing.
 * Designed with a strict timeout so visitor redirection is never delayed by analytics.
 */
export async function recordClick({urlId, originalUrl}) {
  try {
    const uaResult = parser.getResult();
    const device = uaResult?.device?.type || parser.getDevice()?.type || "desktop";
    const browser = uaResult?.browser?.name || parser.getBrowser()?.name || "Unknown";
    const os = uaResult?.os?.name || parser.getOS()?.name || "Unknown";

    let referrer = "Direct";
    if (typeof document !== "undefined" && document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        referrer = refUrl.hostname.replace(/^www\./, "");
      } catch {
        referrer = "External";
      }
    }

    let city = "Unknown";
    let country = "Unknown";
    let visitorHash = null;

    // Fast-timeout location lookup (2.5 seconds max)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch("https://ipapi.co/json", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const loc = await res.json();
        city = loc.city || "Unknown";
        country = loc.country_name || "Unknown";
        visitorHash = await generateVisitorHash(
          loc.ip || "",
          typeof navigator !== "undefined" ? navigator.userAgent : ""
        );
      }
    } catch (locErr) {
      console.warn("Location lookup skipped or timed out:", locErr?.message);
    }

    // Insert click telemetry into database
    await supabase.from("clicks").insert({
      url_id: urlId,
      city,
      country,
      device,
      browser,
      os,
      referrer,
      visitor_hash: visitorHash,
    });
  } catch (err) {
    console.error("Error recording click telemetry:", err);
  } finally {
    // Critical safety: Always redirect the visitor even if analytics fails
    if (originalUrl) {
      const destination = /^https?:\/\//i.test(originalUrl)
        ? originalUrl
        : `https://${originalUrl}`;
      window.location.href = destination;
    }
  }
}

/**
 * Fetches all click records for a set of link IDs.
 */
export async function getClicksForUrls(urlIds = []) {
  if (!urlIds || !Array.isArray(urlIds) || urlIds.length === 0) return [];

  const {data, error} = await supabase
    .from("clicks")
    .select("*")
    .in("url_id", urlIds)
    .order("created_at", {ascending: false});

  if (error) {
    console.error("Error fetching clicks for URLs:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetches all click records for a single link ID.
 */
export async function getClicksForUrl(urlId) {
  if (!urlId) return [];

  const {data, error} = await supabase
    .from("clicks")
    .select("*")
    .eq("url_id", urlId)
    .order("created_at", {ascending: false});

  if (error) {
    console.error("Error fetching clicks for URL:", error);
    return [];
  }

  return data || [];
}

/**
 * Filters and aggregates raw click records based on a date range.
 * Supported dateRange values: 'all', 'today', '7d', '30d'.
 */
export function aggregateAnalytics(clicks = [], dateRange = "all") {
  if (!clicks || clicks.length === 0) {
    return {
      totalClicks: 0,
      uniqueVisitors: 0,
      clicksToday: 0,
      clicksThisWeek: 0,
      clicksThisMonth: 0,
      timeSeries: [],
      devices: [],
      browsers: [],
      operatingSystems: [],
      topCountries: [],
      topCities: [],
      topReferrers: [],
      recentClicks: [],
    };
  }

  const now = Date.now();
  const ONE_DAY_MS = 86400000;
  const ONE_WEEK_MS = 7 * ONE_DAY_MS;
  const ONE_MONTH_MS = 30 * ONE_DAY_MS;

  // 1. Filter clicks by selected date range
  let filtered = clicks;
  if (dateRange === "today") {
    filtered = clicks.filter(
      (c) => now - new Date(c.created_at).getTime() <= ONE_DAY_MS
    );
  } else if (dateRange === "7d") {
    filtered = clicks.filter(
      (c) => now - new Date(c.created_at).getTime() <= ONE_WEEK_MS
    );
  } else if (dateRange === "30d") {
    filtered = clicks.filter(
      (c) => now - new Date(c.created_at).getTime() <= ONE_MONTH_MS
    );
  }

  // 2. High-level metric counts
  const totalClicks = filtered.length;

  const visitorSet = new Set();
  filtered.forEach((c) => {
    const key = c.visitor_hash || `${c.city}-${c.country}-${c.device}-${c.browser}`;
    visitorSet.add(key);
  });
  const uniqueVisitors = visitorSet.size;

  const clicksToday = clicks.filter(
    (c) => now - new Date(c.created_at).getTime() <= ONE_DAY_MS
  ).length;

  const clicksThisWeek = clicks.filter(
    (c) => now - new Date(c.created_at).getTime() <= ONE_WEEK_MS
  ).length;

  const clicksThisMonth = clicks.filter(
    (c) => now - new Date(c.created_at).getTime() <= ONE_MONTH_MS
  ).length;

  // 3. Time Series Data (Grouped by Day in Chronological Order: Oldest to Newest)
  const timeBuckets = new Map();
  const sortedClicks = [...filtered].sort((a, b) => {
    const timeA = new Date(a.created_at).getTime() || 0;
    const timeB = new Date(b.created_at).getTime() || 0;
    return timeA - timeB;
  });

  sortedClicks.forEach((c) => {
    const dateStr = new Date(c.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    timeBuckets.set(dateStr, (timeBuckets.get(dateStr) || 0) + 1);
  });

  const timeSeries = Array.from(timeBuckets.entries()).map(([date, count]) => ({
    date,
    clicks: count,
  }));

  // 4. Device Breakdown
  const deviceCounts = {};
  filtered.forEach((c) => {
    const dev = c.device || "desktop";
    deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
  });
  const devices = Object.entries(deviceCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // 5. Browser Breakdown
  const browserCounts = {};
  filtered.forEach((c) => {
    const b = c.browser || "Unknown";
    browserCounts[b] = (browserCounts[b] || 0) + 1;
  });
  const browsers = Object.entries(browserCounts)
    .map(([name, count]) => ({name, count}))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 6. OS Breakdown
  const osCounts = {};
  filtered.forEach((c) => {
    const o = c.os || "Unknown";
    osCounts[o] = (osCounts[o] || 0) + 1;
  });
  const operatingSystems = Object.entries(osCounts)
    .map(([name, count]) => ({name, count}))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 7. Top Countries & Cities
  const countryCounts = {};
  const cityCounts = {};
  filtered.forEach((c) => {
    const country = c.country || "Unknown";
    const city = c.city || "Unknown";
    countryCounts[country] = (countryCounts[country] || 0) + 1;
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });

  const topCountries = Object.entries(countryCounts)
    .map(([country, count]) => ({
      country,
      count,
      percentage: Math.round((count / (totalClicks || 1)) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const topCities = Object.entries(cityCounts)
    .map(([city, count]) => ({
      city,
      count,
      percentage: Math.round((count / (totalClicks || 1)) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // 8. Referrers
  const referrerCounts = {};
  filtered.forEach((c) => {
    const ref = c.referrer || "Direct";
    referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
  });
  const topReferrers = Object.entries(referrerCounts)
    .map(([source, count]) => ({source, count}))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 9. Recent Activity Feed
  const recentClicks = filtered.slice(0, 10);

  return {
    totalClicks,
    uniqueVisitors,
    clicksToday,
    clicksThisWeek,
    clicksThisMonth,
    timeSeries,
    devices,
    browsers,
    operatingSystems,
    topCountries,
    topCities,
    topReferrers,
    recentClicks,
  };
}
