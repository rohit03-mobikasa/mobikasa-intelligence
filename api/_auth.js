// api/_auth.js
// Shared helper: checks whether the request carries a valid session cookie.
// Session model is intentionally simple for an internal single-admin tool:
// on successful login, we set a cookie equal to SESSION_SECRET (a random
// string only the server knows). Every other API route just checks that
// the incoming cookie matches. No user accounts, no JWT — just a shared
// secret gate, which is proportionate for a tool only you will use.

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  cookieHeader.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    out[key] = decodeURIComponent(val);
  });
  return out;
}

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  return (
    !!process.env.SESSION_SECRET &&
    cookies.mobikasa_session === process.env.SESSION_SECRET
  );
}

module.exports = { isAuthenticated, parseCookies };
