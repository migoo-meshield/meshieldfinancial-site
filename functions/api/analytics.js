// Cloudflare Pages Function — /api/analytics
// Fetches real analytics from Cloudflare GraphQL API
// Token stored as environment variable (never exposed to browser)

export async function onRequest(context) {
  const TOKEN   = context.env.CF_ANALYTICS_TOKEN;
  const ZONE_ID = context.env.CF_ZONE_ID || '68d68daf795dc8bc081072fcac2b82cf';

  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json',
  };

  if (!TOKEN) {
    return new Response(JSON.stringify({ error: 'Token not configured' }), { headers: CORS });
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString();
  const now = new Date().toISOString();

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
        hourly: httpRequests1hGroups(
          limit: 24,
          filter: { datetime_geq: "${yesterday}", datetime_leq: "${now}" }
          orderBy: [datetime_ASC]
        ) {
          dimensions { datetime }
          sum { requests }
          uniq { uniques }
        }
        topPages: httpRequestsAdaptiveGroups(
          limit: 5,
          filter: { date_geq: "${today}" }
          orderBy: [sum_requests_DESC]
        ) {
          dimensions { clientRequestPath }
          sum { requests }
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

    if (!json.data) {
      return new Response(JSON.stringify({ error: 'API error', raw: json }), { headers: CORS });
    }

    const zone  = json.data.viewer.zones[0];
    const day   = zone.today[0]   || { sum: {}, uniq: {} };
    const hours = zone.hourly     || [];
    const pages = zone.topPages   || [];

    const result = {
      visitors:  day.uniq.uniques   || 0,
      requests:  day.sum.requests   || 0,
      pageviews: day.sum.pageViews  || 0,
      threats:   day.sum.threats    || 0,
      hourly: hours.map(h => ({
        time: h.dimensions.datetime,
        requests: h.sum.requests,
        visitors: h.uniq.uniques,
      })),
      topPages: pages.map(p => ({
        path:     p.dimensions.clientRequestPath,
        requests: p.sum.requests,
      })),
      updatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), { headers: CORS });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { headers: CORS });
  }
}
