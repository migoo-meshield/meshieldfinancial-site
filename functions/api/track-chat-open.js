// functions/api/track-chat-open.js
//
// A tiny endpoint whose only job is: add 1 to a counter every time
// someone opens the chat widget. Stored in the CHATBOT_STATS KV namespace.
//
// This had no verification at all that the call actually came from the
// chat widget on this site — a public, unauthenticated POST with no origin
// check, so a script hitting it directly could inflate the dashboard's
// "Chatbot opens" number arbitrarily. chatbot-widget.js only fires this
// from a real click on the chat bubble (so a non-JS crawler never triggers
// it), but nothing stopped something else from calling it straight. This
// rejects a request that isn't coming from this site.
const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*meshieldfinancial\.com(\/.*)?$/i;

export async function onRequestPost(context) {
  const origin = context.request.headers.get("Origin") || context.request.headers.get("Referer") || "";
  if (!ALLOWED_ORIGIN.test(origin)) {
    return new Response(JSON.stringify({ success: false, error: "Invalid origin" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const current = await context.env.CHATBOT_STATS.get("chat_opens");
    const count = current ? parseInt(current, 10) : 0;
    await context.env.CHATBOT_STATS.put("chat_opens", String(count + 1));

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    // Never let a tracking failure affect the visitor's experience.
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
