// functions/api/generate.js
// Cloudflare Pages Function — Workers AI
// Required binding: Name = AI, Type = Workers AI (in Pages > Settings > Bindings)

export async function onRequestPost(context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // Parse body
    let prompt;
    try {
      const body = await context.request.json();
      prompt = body?.prompt;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers });
    }

    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400, headers });
    }

    // Check AI binding
    if (!context.env.AI) {
      return new Response(
        JSON.stringify({ error: "Workers AI binding missing. Go to Cloudflare Pages > Settings > Bindings > Add binding > Workers AI > Name it 'AI'" }),
        { status: 500, headers }
      );
    }

    // Run the AI model
    const result = await context.env.AI.run("@cf/zai-org/glm-4.7-flash", {
      messages: [
        {
          role: "system",
          content: "You are a professional content writer for ME Shield Financial Services (Miguelson Etienne, Apopka FL). Write clear, professional content for insurance, tax preparation, business filing, immigration forms, and Infinite Banking. Be warm and concise. Never use 'advisor', 'paralegal', or 'attorney'."
        },
        { role: "user", content: prompt.trim() }
      ],
      max_tokens: 800,
    });

    // Extract text from any response format
    let text =
      typeof result === "string" ? result :
      result?.response ?? result?.result?.response ??
      result?.message?.content ?? result?.content ?? result?.text ??
      (Array.isArray(result) ? result[0]?.generated_text ?? result[0]?.response : null) ??
      JSON.stringify(result);

    text = (text ?? "").trim();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "AI returned empty response. Raw: " + JSON.stringify(result).substring(0, 200) }),
        { status: 500, headers }
      );
    }

    return new Response(JSON.stringify({ result: text }), { status: 200, headers });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message ?? String(err) }),
      { status: 500, headers }
    );
  }
}

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
