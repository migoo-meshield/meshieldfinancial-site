// functions/api/track-chat-open.js
//
// A tiny endpoint whose only job is: add 1 to a counter every time
// someone opens the chat widget. Stored in the CHATBOT_STATS KV namespace.

export async function onRequestPost(context) {
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
