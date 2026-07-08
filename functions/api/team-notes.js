// Cloudflare Pages Function — /api/team-notes
// Persists Quick Notes to a dedicated KV namespace so it syncs across devices/links.
// Env var needed: TEAM_KV (KV namespace binding)

export async function onRequestPost(context) {
  const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  const KV = context.env.TEAM_KV;

  try {
    const body = await context.request.json();
    const action = body.action;

    if (action === 'get') {
      const value = await KV.get('quick-notes');
      return new Response(JSON.stringify({ success: true, notes: value || '' }), { headers: CORS });
    }

    if (action === 'save') {
      const notes = body.notes || '';
      await KV.put('quick-notes', notes);
      return new Response(JSON.stringify({ success: true }), { headers: CORS });
    }

    return new Response(JSON.stringify({ success: false, message: 'Unknown action' }), { headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { headers: CORS });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
