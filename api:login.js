// api/login.js
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const { password } = body || {};

  if (!process.env.APP_PASSWORD || !process.env.SESSION_SECRET) {
    return res.status(500).json({ error: "Server not configured. Missing APP_PASSWORD or SESSION_SECRET." });
  }

  if (password !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  // Set an HttpOnly cookie so client-side JS can never read or leak it.
  // 7 day expiry — adjust if you want shorter/longer sessions.
  res.setHeader(
    "Set-Cookie",
    `mobikasa_session=${encodeURIComponent(process.env.SESSION_SECRET)}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; Secure`
  );

  return res.status(200).json({ ok: true });
};
