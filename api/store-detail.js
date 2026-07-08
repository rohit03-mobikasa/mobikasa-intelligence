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

  const [
    { data: merchant, error: merchantError },
    { data: metrics, error: metricsError },
    { data: orders, error: ordersError },
    { data: products, error: productsError },
    { data: recommendations, error: recommendationsError }
  ] = await Promise.all([
    supabase.from("merchants").select("*").eq("merchant_id", id).single(),
    supabase
      .from("marketing_metrics")
      .select("*")
      .eq("merchant_id", id)
      .order("period_start", { ascending: false })
      .limit(50),
    supabase
      .from("orders")
      .select("*")
      .eq("merchant_id", id)
      .order("order_created_at", { ascending: false })
      .limit(25),
    supabase
      .from("products")
      .select("*")
      .eq("merchant_id", id)
      .order("product_updated_at", { ascending: false })
      .limit(25),
    supabase
      .from("recommendations")
      .select("*")
      .eq("merchant_id", id)
      .order("created_at", { ascending: false })
      .limit(25)
  ]);

  if (merchantError) {
    return res.status(500).json({ error: merchantError.message });
  }
  if (metricsError) {
    return res.status(500).json({ error: metricsError.message });
  }
  if (ordersError) {
    return res.status(500).json({ error: ordersError.message });
  }
  if (productsError) {
    return res.status(500).json({ error: productsError.message });
  }
  if (recommendationsError) {
    return res.status(500).json({ error: recommendationsError.message });
  }

  // Mask the Shopify token before it ever reaches the browser —
  // no reason for the frontend to see the full value once stored.
  const masked = {
    ...merchant,
    shopify_token: merchant.shopify_token
      ? merchant.shopify_token.slice(0, 6) + "••••••••" + merchant.shopify_token.slice(-4)
      : null
  };

  return res.status(200).json({ store: masked, metrics, orders, products, recommendations });
};
