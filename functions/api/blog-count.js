// Cloudflare Pages Function — /api/blog-count
// Counts real blog articles by reading the live blog.html page

export async function onRequest(context) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const res = await fetch('https://meshieldfinancial.com/blog.html');
    const html = await res.text();

    // Count blog-card articles (each article = one blog post)
    const matches = html.match(/class="blog-card/g) || [];
    const count = matches.length;

    return new Response(JSON.stringify({ count, updatedAt: new Date().toISOString() }), { headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { headers: CORS });
  }
}
