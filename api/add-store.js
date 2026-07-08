// api/add-store.js
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

  const { store_name, shopify_url, shopify_token, ga4_property_id, meta_account_id, google_ads_id } = body || {};

  if (!store_name || !shopify_url || !shopify_token) {
    return res.status(400).json({ error: "store_name, shopify_url, and shopify_token are required" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from("merchants")
    .insert([{
      store_name,
      shopify_url,
      shopify_token,
      ga4_property_id: ga4_property_id || null,
      meta_account_id: meta_account_id || null,
      google_ads_id: google_ads_id || null,
      status: "active"
    }])
    .select("merchant_id")
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true, merchant_id: data.merchant_id });
};
