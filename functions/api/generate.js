// functions/api/generate.js
// Cloudflare Pages Function — Workers AI with model fallback

const MODELS = [
  "@cf/zai-org/glm-4.7-flash",
  "@cf/meta/llama-3.1-8b-instruct",
  "@cf/mistral/mistral-7b-instruct-v0.1",
];

function extractText(aiRes) {
  if (!aiRes) return "";
  if (typeof aiRes === "string") return aiRes;
  return (
    aiRes?.response ??
    aiRes?.result?.response ??
    aiRes?.message?.content ??
    aiRes?.content ??
    aiRes?.text ??
    (Array.isArray(aiRes) ? (aiRes[0]?.generated_text ?? aiRes[0]?.response ?? "") : "") ??
    ""
  );
}

export async function onRequestPost(context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    let prompt;
    try {
      const body = await context.request.json();
      prompt = body?.prompt?.trim();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers });
    }

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400, headers });
    }

    if (!context.env.AI) {
      return new Response(
        JSON.stringify({ error: "Workers AI binding missing. Add it in Cloudflare Pages > Settings > Bindings > Workers AI > name it 'AI'" }),
        { status: 500, headers }
      );
    }

    const systemPrompt = "You are a professional content writer for ME Shield Financial Services (Miguelson Etienne, Apopka FL). Write clear, professional, warm content for insurance, tax preparation, business filing, immigration forms filing, and Infinite Banking. Never use 'advisor', 'paralegal', or 'attorney'. Keep it concise and ready to use.";

    let lastError = "";

    // Try each model until one works
    for (const model of MODELS) {
      try {
        const aiRes = await context.env.AI.run(model, {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          max_tokens: 800,
        });

        const text = extractText(aiRes)?.trim();

        if (text) {
          return new Response(
            JSON.stringify({ result: text, model_used: model }),
            { status: 200, headers }
          );
        }

        lastError = "Model " + model + " returned empty response. Raw: " + JSON.stringify(aiRes).substring(0, 150);

      } catch (modelErr) {
        lastError = "Model " + model + " error: " + modelErr.message;
        continue; // try next model
      }
    }

    // All models failed
    return new Response(
      JSON.stringify({ error: "All AI models failed. Last error: " + lastError }),
      { status: 500, headers }
    );

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
