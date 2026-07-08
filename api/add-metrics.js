// api/add-metrics.js
const { createClient } = require("@supabase/supabase-js");
const { isAuthenticated } = require("./_auth");

module.exports = async (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const {
    merchant_id, source, period_start, period_end, channel,
    sessions, users, conversions, revenue, bounce_rate, avg_engagement_time,
    ad_spend, clicks, impressions, roas, reach,
    sessions_recorded, rage_clicks, dead_clicks, quick_backs,
    excessive_scrolling, avg_scroll_depth, js_errors,
    entry_method
  } = body || {};

  if (!merchant_id || !source || !period_start || !period_end) {
    return res.status(400).json({ error: "merchant_id, source, period_start, and period_end are required" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { error } = await supabase.from("marketing_metrics").upsert([{
    merchant_id, source, period_start, period_end,
    channel: channel || "all",
    sessions: sessions || null,
    users: users || null,
    conversions: conversions || null,
    revenue: revenue || null,
    bounce_rate: bounce_rate || null,
    avg_engagement_time: avg_engagement_time || null,
    ad_spend: ad_spend || null,
    clicks: clicks || null,
    impressions: impressions || null,
    roas: roas || null,
    reach: reach || null,
    sessions_recorded: sessions_recorded || null,
    rage_clicks: rage_clicks || null,
    dead_clicks: dead_clicks || null,
    quick_backs: quick_backs || null,
    excessive_scrolling: excessive_scrolling || null,
    avg_scroll_depth: avg_scroll_depth || null,
    js_errors: js_errors || null,
    entry_method: entry_method || "manual"
  }], { onConflict: "merchant_id,source,period_start,period_end,channel" });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
};
