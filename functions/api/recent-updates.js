// functions/api/recent-updates.js
// This lives in your meshieldfinancial-site repo (main website), NOT the worker.
// When the blog page asks for /api/recent-updates, this hands back whatever
// the Fetcher Worker most recently saved to KV.

export async function onRequestGet(context) {
  try {
    const data = await context.env.RECENT_UPDATES_KV.get("latest");

    if (!data) {
      // Nothing saved yet (e.g. the worker hasn't run for the first time)
      return new Response(
        JSON.stringify({ lastChecked: null, irs: [], immigration: [] }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(data, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // cache for 1 hour in the browser
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to load updates" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
