// Input validation and sanitization utilities

export const RESERVED_ALIASES = new Set([
  "auth",
  "dashboard",
  "link",
  "api",
  "admin",
  "login",
  "signup",
  "settings",
  "help",
  "docs",
  "about",
  "pricing",
  "terms",
  "privacy",
  "public",
  "assets",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "qr",
  "health",
  "status",
  "demo",
]);

/**
 * Validates and normalizes destination URLs.
 * Rejects dangerous schemes like javascript:, data:, vbscript:.
 * Automatically prepends https:// if protocol is omitted.
 */
export function validateUrl(input) {
  if (!input || typeof input !== "string") {
    return {isValid: false, error: "URL is required.", normalizedUrl: ""};
  }

  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  // Guard against malicious protocols and XSS vectors
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return {
      isValid: false,
      error: "Malicious or unsupported URL protocol detected.",
      normalizedUrl: "",
    };
  }

  // Prepend https:// if protocol is missing
  let normalized = trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    normalized = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(normalized);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return {
        isValid: false,
        error: "URL must use HTTP or HTTPS protocol.",
        normalizedUrl: "",
      };
    }

    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return {
        isValid: false,
        error: "Please enter a valid domain name (e.g. example.com).",
        normalizedUrl: "",
      };
    }

    return {isValid: true, error: null, normalizedUrl: normalized};
  } catch {
    return {isValid: false, error: "Invalid URL format.", normalizedUrl: ""};
  }
}

/**
 * Validates custom alias slug.
 * Must be 3-30 characters, alphanumeric with dashes/underscores.
 * Disallows reserved routing keywords.
 */
export function validateAlias(alias) {
  if (!alias) return {isValid: true, error: null, normalizedAlias: ""};

  const normalized = alias.trim().toLowerCase();

  if (RESERVED_ALIASES.has(normalized)) {
    return {
      isValid: false,
      error: `The alias "${normalized}" is reserved by the platform. Please choose another.`,
      normalizedAlias: normalized,
    };
  }

  if (normalized.length < 3) {
    return {
      isValid: false,
      error: "Alias must be at least 3 characters.",
      normalizedAlias: normalized,
    };
  }

  if (normalized.length > 30) {
    return {
      isValid: false,
      error: "Alias cannot exceed 30 characters.",
      normalizedAlias: normalized,
    };
  }

  if (!/^[a-z0-9_-]+$/i.test(normalized)) {
    return {
      isValid: false,
      error: "Alias can only contain letters, numbers, hyphens (-), and underscores (_).",
      normalizedAlias: normalized,
    };
  }

  return {isValid: true, error: null, normalizedAlias: normalized};
}

/**
 * Checks if a given expiration ISO date is in the future.
 */
export function validateExpiration(dateString) {
  if (!dateString) return {isValid: true, error: null};

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return {isValid: false, error: "Invalid date format."};
  }

  if (date.getTime() <= Date.now()) {
    return {isValid: false, error: "Expiration date must be in the future."};
  }

  return {isValid: true, error: null};
}

/**
 * Evaluates link status based on active flag, expiration, and click limit.
 */
export function getLinkStatus(link, totalClicks = 0) {
  if (!link) return {status: "not_found", label: "Not Found", color: "red"};

  if (link.is_active === false) {
    return {status: "disabled", label: "Disabled", color: "amber"};
  }

  if (link.expires_at) {
    const expiry = new Date(link.expires_at).getTime();
    if (Date.now() > expiry) {
      return {status: "expired", label: "Expired", color: "gray"};
    }
  }

  if (link.max_clicks && totalClicks >= link.max_clicks) {
    return {status: "limit_reached", label: "Limit Reached", color: "orange"};
  }

  return {status: "active", label: "Active", color: "emerald"};
}
