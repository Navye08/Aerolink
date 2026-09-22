import supabase from "@/db/supabase";
import {generateShortId} from "@/lib/nanoid";
import {validateUrl, validateAlias, validateExpiration} from "@/lib/validators";
import {hashPassword} from "@/lib/crypto";

/**
 * Fetches all links belonging to an authenticated user.
 */
export async function getLinks(userId) {
  if (!userId) return [];

  const {data, error} = await supabase
    .from("urls")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {ascending: false});

  if (error) {
    console.error("Error fetching user links:", error);
    throw new Error(error.message || "Failed to load links.");
  }

  return data || [];
}

/**
 * Fetches a single link by ID ensuring user ownership.
 */
export async function getLinkById({id, userId}) {
  if (!id) return null;

  let query = supabase.from("urls").select("*").eq("id", id);
  if (userId) query = query.eq("user_id", userId);

  const {data, error} = await query.single();

  if (error) {
    console.error("Error fetching link:", error);
    throw new Error(error.message || "Link not found.");
  }

  return data;
}

/**
 * Public resolver to fetch routing information by short alias or custom alias.
 * Deliberately excludes sensitive fields like password_hash from the public payload.
 */
export async function resolveLinkByAlias(alias) {
  if (!alias) return null;

  const normalized = alias.trim().toLowerCase();

  const {data, error} = await supabase
    .from("urls")
    .select("id, original_url, short_url, custom_url, is_active, expires_at, max_clicks, password_hash")
    .or(`short_url.eq.${normalized},custom_url.eq.${normalized}`)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error resolving link alias:", error);
    return null;
  }

  if (!data) return null;

  // Mask password hash for client security
  const isPasswordProtected = Boolean(data.password_hash);
  return {
    id: data.id,
    original_url: data.original_url,
    short_url: data.short_url,
    custom_url: data.custom_url,
    is_active: data.is_active,
    expires_at: data.expires_at,
    max_clicks: data.max_clicks,
    is_password_protected: isPasswordProtected,
  };
}

/**
 * Verifies a link password using server-side RPC or client crypto comparison.
 */
export async function verifyLinkPassword(urlId, inputPassword) {
  if (!urlId || !inputPassword) return false;
  const trimmed = typeof inputPassword === "string" ? inputPassword.trim() : inputPassword;

  // Try PostgreSQL RPC function first
  try {
    const {data: isValid, error} = await supabase.rpc("verify_link_password", {
      p_url_id: urlId,
      p_password: trimmed,
    });

    if (!error && typeof isValid === "boolean") {
      return isValid;
    }
  } catch (rpcErr) {
    console.warn("RPC verify_link_password fallback to query check:", rpcErr);
  }

  // Fallback check (for mock client or standard client)
  const hashedTrimmed = await hashPassword(trimmed);
  const hashedRaw = await hashPassword(inputPassword);
  const {data} = await supabase
    .from("urls")
    .select("password_hash")
    .eq("id", urlId)
    .single();

  return (
    data?.password_hash === hashedTrimmed ||
    data?.password_hash === hashedRaw ||
    data?.password_hash === trimmed ||
    data?.password_hash === inputPassword
  );
}

/**
 * Creates a short link with collision retry, alias validation, and optional password/expiration.
 */
export async function createLink({
  title,
  destinationUrl,
  customAlias,
  userId,
  isActive = true,
  expiresAt = null,
  maxClicks = null,
  password = null,
  tags = [],
  notes = "",
}) {
  // 1. Validate destination URL
  const urlCheck = validateUrl(destinationUrl);
  if (!urlCheck.isValid) throw new Error(urlCheck.error);

  // 2. Validate custom alias if provided
  let normalizedCustom = null;
  if (customAlias) {
    const aliasCheck = validateAlias(customAlias);
    if (!aliasCheck.isValid) throw new Error(aliasCheck.error);
    normalizedCustom = aliasCheck.normalizedAlias;
  }

  // 3. Validate expiration
  if (expiresAt) {
    const expiryCheck = validateExpiration(expiresAt);
    if (!expiryCheck.isValid) throw new Error(expiryCheck.error);
  }

  // 4. Hash password if provided
  let passwordHash = null;
  if (password && password.trim().length > 0) {
    passwordHash = await hashPassword(password.trim());
  }

  // 5. Insert with automatic collision retry (up to 3 attempts)
  let attempts = 0;
  const maxAttempts = 3;
  let createdData = null;

  while (attempts < maxAttempts) {
    attempts++;
    const short_url = generateShortId(7).toLowerCase();

    const payload = {
      title: title ? title.trim() : destinationUrl.replace(/^https?:\/\//, "").slice(0, 30),
      user_id: userId,
      original_url: urlCheck.normalizedUrl,
      custom_url: normalizedCustom || null,
      short_url,
      qr: "/qr.png", // Generated client-side on demand
      is_active: Boolean(isActive),
      expires_at: expiresAt || null,
      max_clicks: maxClicks ? parseInt(maxClicks, 10) : null,
      password_hash: passwordHash,
      tags: Array.isArray(tags) ? tags : [],
      notes: notes ? notes.trim() : null,
      updated_at: new Date().toISOString(),
    };

    const {data, error} = await supabase.from("urls").insert([payload]).select();

    if (!error && data && data.length > 0) {
      createdData = data[0];
      break;
    }

    // If collision on custom_url, stop immediately and report
    if (error && (error.code === "23505" || error.message?.includes("custom_url"))) {
      throw new Error(`The alias "${normalizedCustom}" is already taken. Please choose another.`);
    }

    // If collision on short_url, retry with another random ID
    if (attempts === maxAttempts) {
      throw new Error(error?.message || "Failed to generate a unique short link. Please try again.");
    }
  }

  return createdData;
}

/**
 * Updates an existing link.
 */
export async function updateLink(id, updates) {
  if (!id) throw new Error("Link ID is required.");

  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (updates.original_url) {
    const urlCheck = validateUrl(updates.original_url);
    if (!urlCheck.isValid) throw new Error(urlCheck.error);
    payload.original_url = urlCheck.normalizedUrl;
  }

  if (updates.custom_url !== undefined) {
    if (updates.custom_url) {
      const aliasCheck = validateAlias(updates.custom_url);
      if (!aliasCheck.isValid) throw new Error(aliasCheck.error);
      payload.custom_url = aliasCheck.normalizedAlias;
    } else {
      payload.custom_url = null;
    }
  }

  if (updates.password !== undefined) {
    payload.password_hash = updates.password
      ? await hashPassword(updates.password.trim())
      : null;
    delete payload.password;
  }

  const {data, error} = await supabase
    .from("urls")
    .update(payload)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating link:", error);
    if (error.code === "23505") {
      throw new Error("This custom alias is already taken by another link.");
    }
    throw new Error(error.message || "Failed to update link.");
  }

  return data?.[0];
}

/**
 * Toggles a link active / disabled state.
 */
export async function toggleLinkStatus(id, currentStatus) {
  return updateLink(id, {is_active: !currentStatus});
}

/**
 * Deletes a link and cascades associated click events.
 */
export async function deleteLink(id) {
  if (!id) return;

  const {data, error} = await supabase.from("urls").delete().eq("id", id);
  if (error) {
    console.error("Error deleting link:", error);
    throw new Error(error.message || "Failed to delete link.");
  }
  return data;
}
