// src/utils/hashPassword.js
// Hashes password with SHA-256 before sending to the API
// This prevents the plaintext password from appearing in:
//   - Browser network logs
//   - HTTP access logs
//   - Any proxy/middleware that might log request bodies
//
// NOTE: This is NOT a replacement for HTTPS.
//       It's an extra layer of protection for development
//       and cases where HTTPS isn't terminated at the app level.
//
// The backend uses bcrypt.compare(hashedInput, bcryptStored)
// which works because bcrypt.compare accepts any string input —
// it hashes the input with the same salt and compares.
//
// ⚠️  IMPORTANT: The backend must use bcrypt.compare(), NOT ===
//     which is already done in admin.auth.controller.js and
//     doctor.auth.controller.js after this update.

/**
 * Hash a password with SHA-256 using the browser's built-in SubtleCrypto API.
 * Returns a hex string e.g. "a3f1b2c4d5..."
 * @param {string} password
 * @returns {Promise<string>} hex-encoded SHA-256 hash
 */
export const hashPassword = async (password) => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await window.crypto.subtle.digest("SHA-256", data);
    // Convert ArrayBuffer → hex string
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (err) {
    // SubtleCrypto not available (very old browser) — send as-is
    console.warn(
      "SubtleCrypto not available, sending password unhashed:",
      err.message,
    );
    return password;
  }
};
