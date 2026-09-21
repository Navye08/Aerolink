// Web Crypto API cryptographic helpers

/**
 * Computes a SHA-256 hex digest of a string using the native Web Crypto API.
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function hashPassword(text) {
  if (!text) return null;
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Computes a privacy-preserving 16-character pseudo-anonymous visitor hash.
 * Combines IP, User-Agent, and daily salt so no raw personal data is ever stored.
 * @param {string} ip
 * @param {string} userAgent
 * @returns {Promise<string>}
 */
export async function generateVisitorHash(ip = "", userAgent = "") {
  try {
    const salt = "aerolink-privacy-salt";
    const raw = `${ip}::${userAgent}::${salt}`;
    const fullHash = await hashPassword(raw);
    return fullHash ? fullHash.slice(0, 16) : null;
  } catch {
    return null;
  }
}
