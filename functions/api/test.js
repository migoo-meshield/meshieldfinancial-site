// functions/api/test.js
// Simple test — no AI, just returns a response
// Visit: yoursite.com/api/test to check if functions work

export async function onRequestGet(context) {
  return new Response(
    JSON.stringify({
      status: "ok",
      message: "Cloudflare Pages Function is working!",
      ai_binding: context.env.AI ? "AI binding found ✅" : "AI binding MISSING ❌ — add it in Pages > Settings > Bindings",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    }
  );
}
