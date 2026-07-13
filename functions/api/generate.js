// functions/api/generate.js
// Cloudflare Pages Function — uses Cloudflare Workers AI (free)
// Requires: AI binding named "AI" added in Cloudflare Pages settings

export async function onRequestPost(context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    // Get the prompt from the request
    const { prompt } = await context.request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400, headers,
      });
    }

    // Call Cloudflare Workers AI — no API key needed!
    const response = await context.env.AI.run(
      "@cf/meta/llama-3.1-8b-instruct",
      {
        messages: [
          {
            role: "system",
            content:
              "You are a professional content writer for ME Shield Financial Services, run by Miguelson Etienne in Apopka, Florida. You write clear, engaging, and professional content for insurance (Life, Health & P&C), tax preparation, business filing, immigration forms filing, and the Infinite Banking Concept (IBC). Always be warm, helpful, and professional. Write in the tone and style requested. Never use 'advisor' — use 'Licensed Insurance Consultant' instead. Never use 'paralegal' or 'legal' — use 'Immigration Forms Filing' instead.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 800,
      }
    );

    // Return the result
    const text = response.response || "";
    return new Response(JSON.stringify({ result: text }), {
      status: 200, headers,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers,
    });
  }
}

// Handle preflight requests (browser security check)
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
