// functions/api/chat-stats.js
//
// Visit https://meshieldfinancial.com/api/chat-stats anytime to see
// how many times the chatbot has been opened. No login needed —
// keep this link private since anyone with it can view the count.

export async function onRequestGet(context) {
  try {
    const count = (await context.env.CHATBOT_STATS.get("chat_opens")) || "0";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Chatbot Stats — ME Shield</title>
<style>
  body {
    font-family: -apple-system, 'Inter', sans-serif;
    background: #0B1F3A;
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; margin: 0; padding: 20px;
  }
  .card {
    background: #fff; color: #0B1F3A;
    padding: 44px 56px; border-radius: 18px; text-align: center;
    box-shadow: 0 24px 64px rgba(0,0,0,0.35);
    max-width: 320px;
  }
  .label { font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600; }
  .number { font-size: 64px; font-weight: 800; color: #C9A14A; margin: 8px 0; line-height: 1; }
  .note { font-size: 12px; color: #999; margin-top: 12px; }
</style>
</head>
<body>
  <div class="card">
    <div class="label">Total Chat Opens</div>
    <div class="number">${count}</div>
    <div class="note">Refresh this page anytime to see the latest count.</div>
  </div>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html" } });
  } catch (err) {
    return new Response("Error loading stats. Try again shortly.", { status: 500 });
  }
}
