// functions/api/track-article-read.js
//
// Logs one article read into the RECENT_UPDATES_KV namespace (already bound
// to this project — no new KV needed). Two kinds of counters per hit:
//   read::<path>                          — total reads, any visitor
//   read::<path>::<source>::<campaign>     — reads that arrived through a
//                                            tagged link (same utm tags the
//                                            team portal's "Make a tagged
//                                            link" tool already generates)
//
// Only called from an article page (marketing-source.js gates it to pages
// with .article-body), and only once per page load — this counts reads,
// not clicks within a session, and stores no cookie or visitor identity.
const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*meshieldfinancial\.com(\/.*)?$/i;
const clean = (v, max = 80) => String(v || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, max);

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin') || context.request.headers.get('Referer') || '';
  if (!ALLOWED_ORIGIN.test(origin)) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid origin' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const body = await context.request.json().catch(() => ({}));
    const path = clean(body.path, 120).replace(/^\/+/, '');
    if (!path) return new Response(JSON.stringify({ success: false, error: 'Missing path' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const kv = context.env.RECENT_UPDATES_KV;
    const bump = async (key) => {
      const current = await kv.get(key);
      await kv.put(key, String((parseInt(current, 10) || 0) + 1));
    };

    await bump(`read::${path}`);

    const source = clean(body.source, 40);
    const campaign = clean(body.campaign, 60);
    if (source) await bump(`read::${path}::${source}::${campaign || 'none'}`);

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    // Never let a tracking failure affect the visitor's experience.
    return new Response(JSON.stringify({ success: false }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
