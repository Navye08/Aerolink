// Utility to format and export link analytics to CSV in the browser

/**
 * Exports click event records to a downloadable CSV file.
 * @param {Array} clicks
 * @param {string} filename
 */
export function exportClicksToCsv(clicks = [], filename = "aerolink-analytics.csv") {
  if (!clicks || clicks.length === 0) {
    alert("No click analytics data available to export.");
    return;
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

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
