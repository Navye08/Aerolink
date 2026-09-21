import {describe, it, expect} from "vitest";
import {
  validateUrl,
  validateAlias,
  validateExpiration,
  getLinkStatus,
  RESERVED_ALIASES,
} from "@/lib/validators";

describe("validateUrl", () => {
  it("should normalize URLs without protocol to https://", () => {
    const res = validateUrl("google.com");
    expect(res.isValid).toBe(true);
    expect(res.normalizedUrl).toBe("https://google.com");
  });

  it("should accept valid http:// and https:// URLs", () => {
    const httpRes = validateUrl("http://example.org/path?q=1");
    expect(httpRes.isValid).toBe(true);
    expect(httpRes.normalizedUrl).toBe("http://example.org/path?q=1");

    const httpsRes = validateUrl("https://github.com");
    expect(httpsRes.isValid).toBe(true);
    expect(httpsRes.normalizedUrl).toBe("https://github.com");
  });

  it("should reject malicious protocols and XSS injection vectors", () => {
    expect(validateUrl("javascript:alert(document.cookie)").isValid).toBe(false);
    expect(validateUrl("data:text/html,<script>alert(1)</script>").isValid).toBe(false);
    expect(validateUrl("vbscript:msgbox").isValid).toBe(false);
  });

  it("should reject malformed or empty inputs", () => {
    expect(validateUrl("").isValid).toBe(false);
    expect(validateUrl("   ").isValid).toBe(false);
    expect(validateUrl(null).isValid).toBe(false);
  });
});

describe("validateAlias", () => {
  it("should accept valid alphanumeric custom aliases", () => {
    expect(validateAlias("my-link").isValid).toBe(true);
    expect(validateAlias("summer_sale_2026").isValid).toBe(true);
    expect(validateAlias("repo123").isValid).toBe(true);
  });

  it("should reject aliases that are too short (< 3 chars)", () => {
    const res = validateAlias("hi");
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("at least 3 characters");
  });

  it("should reject aliases containing invalid characters", () => {
    expect(validateAlias("cool link").isValid).toBe(false);
    expect(validateAlias("cool/link").isValid).toBe(false);
    expect(validateAlias("cool@link").isValid).toBe(false);
  });

  it("should reject reserved platform routes", () => {
    RESERVED_ALIASES.forEach((alias) => {
      const res = validateAlias(alias);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("reserved");
    });
  });
});

describe("validateExpiration", () => {
  it("should accept dates in the future", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    expect(validateExpiration(futureDate).isValid).toBe(true);
  });

  it("should reject dates in the past", () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    const res = validateExpiration(pastDate);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("must be in the future");
  });
});

describe("getLinkStatus", () => {
  it("should return active for normal links", () => {
    const link = {is_active: true, expires_at: null, max_clicks: null};
    expect(getLinkStatus(link, 10).status).toBe("active");
  });

  it("should return disabled if is_active is false", () => {
    const link = {is_active: false};
    expect(getLinkStatus(link, 0).status).toBe("disabled");
  });

  it("should return expired if expiration date has passed", () => {
    const link = {
      is_active: true,
      expires_at: new Date(Date.now() - 5000).toISOString(),
    };
    expect(getLinkStatus(link, 5).status).toBe("expired");
  });

  it("should return limit_reached if click count exceeds cap", () => {
    const link = {is_active: true, max_clicks: 50};
    expect(getLinkStatus(link, 50).status).toBe("limit_reached");
    expect(getLinkStatus(link, 51).status).toBe("limit_reached");
  });
});
