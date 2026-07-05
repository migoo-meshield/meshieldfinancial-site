// Cloudflare Pages Function — /api/analytics
// DIAGNOSTIC MODE — helps us find why the token isn't loading

export async function onRequest(context) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json',
  };

  const TOKEN   = context.env.CF_ANALYTICS_TOKEN;
  const ZONE_ID = context.env.CF_ZONE_ID;

  // ── DIAGNOSTIC INFO (safe — does not expose your real token) ──────────
  const diagnostic = {
    token_present: !!TOKEN,
    token_length: TOKEN ? TOKEN.length : 0,
    token_starts_with: TOKEN ? TOKEN.substring(0, 5) : null,
    zone_id_present: !!ZONE_ID,
    zone_id_value: ZONE_ID || null,
    all_env_keys: Object.keys(context.env),
  };

  if (!TOKEN) {
    return new Response(JSON.stringify({
      error: 'Token not configured',
      diagnostic
    }), { headers: CORS });
  }

  // If we get here, the token IS present — let's test it against Cloudflare
  const today = new Date().toISOString().split('T')[0];

  const query = `{
    viewer {
      zones(filter: { zoneTag: "${ZONE_ID}" }) {
        today: httpRequests1dGroups(
          limit: 1,
          filter: { date_geq: "${today}", date_leq: "${today}" }
        ) {
          sum { requests pageViews threats }
          uniq { uniques }
        }
      }
    }
  }`;

  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const json = await res.json();

    return new Response(JSON.stringify({
      diagnostic,
      cloudflare_response_status: res.status,
      cloudflare_response: json,
    }), { headers: CORS });

  } catch (e) {
    return new Response(JSON.stringify({
      error: 'Fetch failed',
      message: e.message,
      diagnostic
    }), { headers: CORS });
  }
}
