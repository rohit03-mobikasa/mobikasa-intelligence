// api/store-detail.js
const { createClient } = require("@supabase/supabase-js");
const { isAuthenticated } = require("./_auth");

module.exports = async (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "Missing id" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const [{ data: merchant, error: merchantError }, { data: metrics, error: metricsError }] = await Promise.all([
    supabase.from("merchants").select("*").eq("merchant_id", id).single(),
    supabase
      .from("marketing_metrics")
      .select("*")
      .eq("merchant_id", id)
      .order("period_start", { ascending: false })
      .limit(50)
  ]);

  if (merchantError) {
    return res.status(500).json({ error: merchantError.message });
  }
  if (metricsError) {
    return res.status(500).json({ error: metricsError.message });
  }

  // Mask the Shopify token before it ever reaches the browser —
  // no reason for the frontend to see the full value once stored.
  const masked = {
    ...merchant,
    shopify_token: merchant.shopify_token
      ? merchant.shopify_token.slice(0, 6) + "••••••••" + merchant.shopify_token.slice(-4)
      : null
  };

  return res.status(200).json({ store: masked, metrics });
};
