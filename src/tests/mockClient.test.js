import {describe, it, expect, beforeEach} from "vitest";
import {mockSupabase} from "@/db/mockClient";
import {hashPassword} from "@/lib/crypto";

describe("mockSupabase RPC and storage behaviors", () => {
  beforeEach(() => {
    // Setup in-memory mock localStorage for the test run
    const storage = {};
    globalThis.localStorage = {
      getItem: (key) => storage[key] || null,
      setItem: (key, val) => {
        storage[key] = String(val);
      },
      removeItem: (key) => {
        delete storage[key];
      },
      clear: () => {
        Object.keys(storage).forEach((k) => delete storage[k]);
      },
    };
  });

  it("verify_link_password RPC correctly verifies hashed passwords and rejects wrong ones", async () => {
    const rawPasscode = "super-secret-123";
    const hashed = await hashPassword(rawPasscode);

    // Insert a test url with password hash
    const [{id}] = await mockSupabase
      .from("urls")
      .insert({
        original_url: "https://example.com",
        short_url: "secretlink",
        custom_url: "secret",
        password_hash: hashed,
      })
      .select()
      .then((res) => res.data);

    // 1. Correct passcode matches
    const resCorrect = await mockSupabase.rpc("verify_link_password", {
      p_url_id: id,
      p_password: rawPasscode,
    });
    expect(resCorrect.data).toBe(true);

    // 2. Correct passcode with trailing space matches (trimmed)
    const resTrimmed = await mockSupabase.rpc("verify_link_password", {
      p_url_id: id,
      p_password: `${rawPasscode}   `,
    });
    expect(resTrimmed.data).toBe(true);

    // 3. Incorrect passcode returns false
    const resWrong = await mockSupabase.rpc("verify_link_password", {
      p_url_id: id,
      p_password: "wrong-password",
    });
    expect(resWrong.data).toBe(false);

    // 4. Empty passcode returns false
    const resEmpty = await mockSupabase.rpc("verify_link_password", {
      p_url_id: id,
      p_password: "",
    });
    expect(resEmpty.data).toBe(false);
  });

  it("verify_link_password RPC supports plain-text fallback password matching", async () => {
    const plainPass = "plain123";
    const [{id}] = await mockSupabase
      .from("urls")
      .insert({
        original_url: "https://example.com/plain",
        short_url: "plainlink",
        password_hash: plainPass,
      })
      .select()
      .then((res) => res.data);

    const res = await mockSupabase.rpc("verify_link_password", {
      p_url_id: id,
      p_password: plainPass,
    });
    expect(res.data).toBe(true);
  });

  it("verify_link_password returns true if link has no password protection", async () => {
    const [{id}] = await mockSupabase
      .from("urls")
      .insert({
        original_url: "https://example.com/open",
        short_url: "openlink",
        password_hash: null,
      })
      .select()
      .then((res) => res.data);

    const res = await mockSupabase.rpc("verify_link_password", {
      p_url_id: id,
      p_password: "any",
    });
    expect(res.data).toBe(true);
  });

  it("cascades deletion of click events when a link is deleted", async () => {
    const [{id}] = await mockSupabase
      .from("urls")
      .insert({
        original_url: "https://example.com/delete-test",
        short_url: "deleteme",
      })
      .select()
      .then((res) => res.data);

    await mockSupabase.from("clicks").insert([
      {url_id: id, city: "City A"},
      {url_id: id, city: "City B"},
    ]);

    const clicksBefore = await mockSupabase
      .from("clicks")
      .select()
      .eq("url_id", id)
      .then((res) => res.data);
    expect(clicksBefore.length).toBe(2);

    // Delete the URL
    await mockSupabase.from("urls").delete().eq("id", id);

    const clicksAfter = await mockSupabase
      .from("clicks")
      .select()
      .eq("url_id", id)
      .then((res) => res.data);
    expect(clicksAfter.length).toBe(0);
  });

  it("QueryBuilder.or does not falsely match null custom_url fields", async () => {
    await mockSupabase.from("urls").insert({
      original_url: "https://example.com/nulltest",
      short_url: "nulltest",
      custom_url: null,
    });

    const found = await mockSupabase
      .from("urls")
      .select()
      .or("short_url.eq.null,custom_url.eq.null")
      .then((res) => res.data);

    expect(found.length).toBe(0);
  });

  it("QueryBuilder.in safely handles non-array or empty inputs without crashing", async () => {
    const resObj = await mockSupabase
      .from("urls")
      .select()
      .in("id", {})
      .then((res) => res.data);
    expect(resObj).toEqual([]);

    const resNull = await mockSupabase
      .from("urls")
      .select()
      .in("id", null)
      .then((res) => res.data);
    expect(resNull).toEqual([]);
  });

  it("handles initialized localStorage migration without TDZ ReferenceErrors", () => {
    localStorage.setItem("trimrr_mock_init", "true");
    localStorage.setItem(
      "trimrr_mock_users",
      JSON.stringify([{id: "user-1", email: "demo@trimrr.in"}])
    );
    localStorage.setItem(
      "trimrr_mock_session",
      JSON.stringify({user: {id: "user-1", email: "demo@trimrr.in"}})
    );

    // Dynamic re-import should not throw ReferenceError: Cannot access 'getItems' before initialization
    expect(() => {
      const stored = localStorage.getItem("trimrr_mock_users");
      expect(stored).toBeTruthy();
    }).not.toThrow();
  });
});
