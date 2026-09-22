// Utility to format and export link analytics to CSV in the browser

/**
 * Converts click records to formatted CSV string.
 * @param {Array} clicks
 * @returns {string}
 */
export function formatClicksToCsv(clicks = []) {
  if (!clicks || !Array.isArray(clicks) || clicks.length === 0) {
    return "";
  }

  const headers = [
    "Timestamp (UTC)",
    "Country",
    "City",
    "Device",
    "Browser",
    "Operating System",
    "Referrer",
  ];

  const escapeCell = (value) => {
    if (value === null || value === undefined) return '""';
    const stringValue = String(value).replace(/"/g, '""');
    return `"${stringValue}"`;
  };

  const rows = clicks.map((click) => [
    escapeCell(click.created_at || ""),
    escapeCell(click.country || "Unknown"),
    escapeCell(click.city || "Unknown"),
    escapeCell(click.device || "desktop"),
    escapeCell(click.browser || "Unknown"),
    escapeCell(click.os || "Unknown"),
    escapeCell(click.referrer || "Direct"),
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

/**
 * Exports click event records to a downloadable CSV file.
 * @param {Array} clicks
 * @param {string} filename
 */
export function exportClicksToCsv(clicks = [], filename = "aerolink-analytics.csv") {
  if (!clicks || !Array.isArray(clicks) || clicks.length === 0) {
    if (typeof alert !== "undefined") {
      alert("No click analytics data available to export.");
    }
    return;
  }

  const csvContent = formatClicksToCsv(clicks);
  if (typeof document === "undefined") return;

  const blob = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
