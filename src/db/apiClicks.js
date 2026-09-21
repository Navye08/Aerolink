// Backward-compatible adapter delegating to modern analyticsService
import {
  recordClick,
  getClicksForUrls,
  getClicksForUrl,
  aggregateAnalytics,
} from "@/services/analyticsService";

export {recordClick, getClicksForUrls, getClicksForUrl, aggregateAnalytics};

export async function storeClicks({id, originalUrl}) {
  return recordClick({urlId: id, originalUrl});
}
