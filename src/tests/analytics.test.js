import {describe, it, expect} from "vitest";
import {aggregateAnalytics} from "@/services/analyticsService";

describe("aggregateAnalytics", () => {
  it("should return clean default metrics when given empty or null clicks", () => {
    const emptyRes = aggregateAnalytics([]);
    expect(emptyRes.totalClicks).toBe(0);
    expect(emptyRes.uniqueVisitors).toBe(0);
    expect(emptyRes.timeSeries).toEqual([]);
    expect(emptyRes.devices).toEqual([]);

    const nullRes = aggregateAnalytics(null);
    expect(nullRes.totalClicks).toBe(0);
    expect(nullRes.uniqueVisitors).toBe(0);
  });

  it("should accurately calculate total clicks and deduplicate unique visitors", () => {
    const mockClicks = [
      {
        created_at: new Date().toISOString(),
        visitor_hash: "hash_user_1",
        device: "desktop",
        browser: "Chrome",
        os: "Windows",
        country: "United States",
        city: "San Francisco",
        referrer: "Direct",
      },
      {
        created_at: new Date().toISOString(),
        visitor_hash: "hash_user_1", // duplicate visitor
        device: "desktop",
        browser: "Chrome",
        os: "Windows",
        country: "United States",
        city: "San Francisco",
        referrer: "Direct",
      },
      {
        created_at: new Date().toISOString(),
        visitor_hash: "hash_user_2", // unique visitor
        device: "mobile",
        browser: "Safari",
        os: "iOS",
        country: "United Kingdom",
        city: "London",
        referrer: "twitter.com",
      },
    ];

    const result = aggregateAnalytics(mockClicks, "all");
    expect(result.totalClicks).toBe(3);
    expect(result.uniqueVisitors).toBe(2);
  });

  it("should filter clicks properly by date ranges (today, 7d, 30d, all)", () => {
    const now = Date.now();
    const mockClicks = [
      {
        // 2 hours ago (today, 7d, 30d, all)
        created_at: new Date(now - 2 * 3600 * 1000).toISOString(),
        device: "desktop",
        visitor_hash: "v1",
      },
      {
        // 3 days ago (7d, 30d, all)
        created_at: new Date(now - 3 * 86400 * 1000).toISOString(),
        device: "mobile",
        visitor_hash: "v2",
      },
      {
        // 14 days ago (30d, all)
        created_at: new Date(now - 14 * 86400 * 1000).toISOString(),
        device: "tablet",
        visitor_hash: "v3",
      },
      {
        // 45 days ago (all only)
        created_at: new Date(now - 45 * 86400 * 1000).toISOString(),
        device: "desktop",
        visitor_hash: "v4",
      },
    ];

    const todayRes = aggregateAnalytics(mockClicks, "today");
    expect(todayRes.totalClicks).toBe(1);

    const weekRes = aggregateAnalytics(mockClicks, "7d");
    expect(weekRes.totalClicks).toBe(2);

    const monthRes = aggregateAnalytics(mockClicks, "30d");
    expect(monthRes.totalClicks).toBe(3);

    const allRes = aggregateAnalytics(mockClicks, "all");
    expect(allRes.totalClicks).toBe(4);
  });

  it("should aggregate device, browser, OS, and location breakdowns", () => {
    const mockClicks = [
      {
        created_at: new Date().toISOString(),
        device: "desktop",
        browser: "Chrome",
        os: "Windows",
        country: "Germany",
        city: "Berlin",
        referrer: "google.com",
        visitor_hash: "a",
      },
      {
        created_at: new Date().toISOString(),
        device: "desktop",
        browser: "Chrome",
        os: "Windows",
        country: "Germany",
        city: "Berlin",
        referrer: "google.com",
        visitor_hash: "b",
      },
      {
        created_at: new Date().toISOString(),
        device: "mobile",
        browser: "Firefox",
        os: "Linux",
        country: "France",
        city: "Paris",
        referrer: "Direct",
        visitor_hash: "c",
      },
    ];

    const res = aggregateAnalytics(mockClicks, "all");

    // Devices
    const desktopDev = res.devices.find((d) => d.name === "Desktop");
    const mobileDev = res.devices.find((d) => d.name === "Mobile");
    expect(desktopDev?.value).toBe(2);
    expect(mobileDev?.value).toBe(1);

    // Browsers
    expect(res.browsers[0]).toEqual({name: "Chrome", count: 2});
    expect(res.browsers[1]).toEqual({name: "Firefox", count: 1});

    // OS
    expect(res.operatingSystems[0]).toEqual({name: "Windows", count: 2});
    expect(res.operatingSystems[1]).toEqual({name: "Linux", count: 1});

    // Top Countries
    expect(res.topCountries[0].country).toBe("Germany");
    expect(res.topCountries[0].count).toBe(2);
    expect(res.topCountries[0].percentage).toBe(67); // 2/3 = 67%

    // Referrers
    expect(res.topReferrers[0]).toEqual({source: "google.com", count: 2});
    expect(res.topReferrers[1]).toEqual({source: "Direct", count: 1});
  });

  it("should fallback to composite key for unique visitors when visitor_hash is missing", () => {
    const mockClicks = [
      {
        created_at: new Date().toISOString(),
        visitor_hash: null,
        city: "Toronto",
        country: "Canada",
        device: "desktop",
        browser: "Safari",
      },
      {
        created_at: new Date().toISOString(),
        visitor_hash: null,
        city: "Toronto",
        country: "Canada",
        device: "desktop",
        browser: "Safari",
      },
      {
        created_at: new Date().toISOString(),
        visitor_hash: null,
        city: "Vancouver",
        country: "Canada",
        device: "desktop",
        browser: "Safari",
      },
    ];

    const res = aggregateAnalytics(mockClicks, "all");
    expect(res.totalClicks).toBe(3);
    expect(res.uniqueVisitors).toBe(2); // Toronto + Vancouver
  });
});
