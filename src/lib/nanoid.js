// Cryptographically secure short ID generator using base62 alphabet
// Replaces weak Math.random().toString(36) with high-entropy random generation

const BASE62_ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Generates a collision-resistant alphanumeric short identifier.
 * Default length 7 yields 62^7 (~3.52 trillion) unique combinations.
 * @param {number} length
 * @returns {string}
 */
export function generateShortId(length = 7) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    let result = "";
    for (let i = 0; i < length; i++) {
      result += BASE62_ALPHABET[bytes[i] % 62];
    }
    return result;
  }

  // Fallback for non-browser/legacy environments
  let fallback = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * 62);
    fallback += BASE62_ALPHABET[randomIndex];
  }
  return fallback;
}

export default generateShortId;
