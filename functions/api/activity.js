// Cloudflare Pages Function — /api/activity
// Fetches recent commits from the private GitHub repo for a live activity feed.
// Env var needed: GITHUB_TOKEN (read-only repo access token)

export async function onRequestGet(context) {
  const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  const TOKEN = context.env.GITHUB_TOKEN;
  const REPO  = 'migoo-meshield/meshieldfinancial-site';

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/commits?per_page=8`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'meshield-internal-portal',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ success: false, error: `GitHub API ${res.status}: ${errText}` }), { headers: CORS });
    }

    const commits = await res.json();
    const activity = commits.map(c => ({
      message: c.commit.message.split('\n')[0],
      time: c.commit.author.date,
      author: c.commit.author.name,
    }));

    return new Response(JSON.stringify({ success: true, activity }), { headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { headers: CORS });
  }
}
