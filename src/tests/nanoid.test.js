import {describe, it, expect} from "vitest";
import {generateShortId} from "@/lib/nanoid";

describe("generateShortId", () => {
  it("should generate a 7-character string by default", () => {
    const id = generateShortId();
    expect(typeof id).toBe("string");
    expect(id.length).toBe(7);
  });

  it("should support custom lengths", () => {
    expect(generateShortId(6).length).toBe(6);
    expect(generateShortId(10).length).toBe(10);
  });

  it("should contain only base62 alphanumeric characters", () => {
    const base62Regex = /^[0-9a-zA-Z]+$/;
    for (let i = 0; i < 50; i++) {
      const id = generateShortId();
      expect(base62Regex.test(id)).toBe(true);
    }
  });

  it("should generate unique values across multiple calls", () => {
    const set = new Set();
    const count = 500;
    for (let i = 0; i < count; i++) {
      set.add(generateShortId());
    }
    expect(set.size).toBe(count);
  });
});
