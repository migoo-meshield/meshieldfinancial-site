// functions/api/article-reads.js
//
// Visit https://meshieldfinancial.com/api/article-reads anytime to see how
// many times each article has been read, and — for reads that arrived
// through a tagged link — which source/campaign brought them. The team
// portal's Marketing Attribution page fetches the same data as JSON.
// No login needed — keep this link private since anyone with it can view
// the counts.

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const wantsJson =
    url.searchParams.get('format') === 'json' ||
    (context.request.headers.get('Accept') || '').includes('application/json');

  try {
    const kv = context.env.RECENT_UPDATES_KV;
    const list = await kv.list({ prefix: 'read::' });
    const byPath = new Map();

    for (const { name } of list.keys) {
      const rest = name.slice('read::'.length);
      const parts = rest.split('::');
      const path = parts[0];
      const row = byPath.get(path) || { path, total: 0, bySource: [] };
      byPath.set(path, row);
      const value = parseInt(await kv.get(name), 10) || 0;
      if (parts.length === 1) {
        row.total = value;
      } else {
        row.bySource.push({ source: parts[1], campaign: parts[2] === 'none' ? '' : parts[2], count: value });
      }
    }

    const articles = [...byPath.values()]
      .map((row) => ({ ...row, bySource: row.bySource.sort((a, b) => b.count - a.count) }))
      .sort((a, b) => b.total - a.total);

    if (wantsJson) {
      return new Response(JSON.stringify({ success: true, articles, updatedAt: new Date().toISOString() }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://teamportal.meshieldfinancial.com',
          'Cache-Control': 'no-store',
        },
      });
    }

    const rows = articles.map((a) => `
      <tr>
        <td><a href="https://meshieldfinancial.com/${a.path}" target="_blank">${a.path}</a></td>
        <td class="num">${a.total}</td>
        <td class="src">${a.bySource.length ? a.bySource.map((s) => `${s.source}${s.campaign ? ' / ' + s.campaign : ''}: <b>${s.count}</b>`).join('<br>') : '<span class="muted">—</span>'}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Article Reads — ME Shield</title>
<style>
  body { font-family: -apple-system, 'Inter', sans-serif; background: #0B1F3A; color: #fff; margin: 0; padding: 32px 20px; }
  .card { background: #fff; color: #0B1F3A; padding: 28px 30px; border-radius: 18px; box-shadow: 0 24px 64px rgba(0,0,0,.35); max-width: 860px; margin: 0 auto; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .note { font-size: 12px; color: #888; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
  th { color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
  td.num { font-weight: 800; color: #9b731a; font-size: 16px; }
  td.src { font-size: 12px; color: #555; line-height: 1.6; }
  .muted { color: #bbb; }
  a { color: #0B1F3A; }
</style>
</head>
<body>
  <div class="card">
    <h1>Article Reads</h1>
    <div class="note">Refresh this page anytime for the latest counts. "By source" only shows reads that arrived through a tagged link.</div>
    <table>
      <thead><tr><th>Article</th><th>Total reads</th><th>By source / campaign</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="3" class="muted">No reads recorded yet.</td></tr>'}</tbody>
    </table>
  </div>
</body>
</html>`;
    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  } catch (err) {
    return new Response('Error loading article reads. Try again shortly.', { status: 500 });
  }
}
