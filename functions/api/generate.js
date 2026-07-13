// functions/api/generate.js
// Cloudflare Pages Function — Cloudflare Workers AI
// Binding: AI (set in Pages > Settings > Bindings)

export async function onRequestPost(context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // Parse request body
    let body;
    try {
      body = await context.request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers });
    }

    const { prompt } = body;
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return new Response(JSON.stringify({ error: "Missing or empty prompt" }), { status: 400, headers });
    }

    // Check AI binding exists
    if (!context.env.AI) {
      return new Response(JSON.stringify({ error: "AI binding not configured. Add Workers AI binding named 'AI' in Cloudflare Pages Settings > Bindings." }), { status: 500, headers });
    }

    // Call Cloudflare Workers AI
    const aiResponse = await context.env.AI.run("@cf/zai-org/glm-4.7-flash", {
      messages: [
        {
          role: "system",
          content: "You are a professional content writer for ME Shield Financial Services, run by Miguelson Etienne in Apopka, Florida. You write clear, engaging, professional content for: Life Insurance, Health Insurance, P&C Insurance, Tax Preparation, Business Filing, Immigration Forms Filing, and the Infinite Banking Concept (IBC). Always be warm, helpful, and professional. Never use the word 'advisor' or 'paralegal' or 'attorney'. Keep content concise and ready to use."
        },
        {
          role: "user",
          content: prompt.trim()
        }
      ],
      max_tokens: 1024,
    });

    // Handle ALL possible response formats from Cloudflare AI
    let text = "";

    if (typeof aiResponse === "string") {
      // Some models return a plain string
      text = aiResponse;
    } else if (aiResponse?.response && typeof aiResponse.response === "string") {
      // Standard chat model format: { response: "..." }
      text = aiResponse.response;
    } else if (aiResponse?.result?.response) {
      // Nested format: { result: { response: "..." } }
      text = aiResponse.result.response;
    } else if (Array.isArray(aiResponse) && aiResponse[0]?.generated_text) {
      // Some models return array: [{ generated_text: "..." }]
      text = aiResponse[0].generated_text;
    } else if (aiResponse?.content) {
      text = aiResponse.content;
    } else if (aiResponse?.text) {
      text = aiResponse.text;
    } else if (aiResponse?.message?.content) {
      text = aiResponse.message.content;
    } else {
      // Last resort: stringify so we can see what came back
      text = JSON.stringify(aiResponse);
    }

    if (!text || text.trim() === "") {
      return new Response(JSON.stringify({ error: "The AI returned an empty response. Please try again." }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ result: text.trim() }), { status: 200, headers });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "AI generation failed: " + (err?.message || String(err)) }),
      { status: 500, headers }
    );
  }
}

// Handle CORS preflight
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
