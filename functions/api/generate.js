// functions/api/generate.js
// Uses @cf/meta/llama-3.3-70b-instruct-fp8-fast as primary
// GLM skipped — it returns reasoning only, not actual content

function extractText(aiRes) {
  if (!aiRes) return "";
  if (typeof aiRes === "string") return aiRes;
  // OpenAI-compatible format
  if (aiRes?.choices?.[0]?.message) {
    const msg = aiRes.choices[0].message;
    const text = msg.content ?? msg.text ?? "";
    if (text) return text;
  }
  // Standard Cloudflare AI format
  return (
    aiRes?.response ??
    aiRes?.result?.response ??
    aiRes?.message?.content ??
    aiRes?.content ??
    aiRes?.text ??
    (Array.isArray(aiRes)
      ? (aiRes[0]?.generated_text ?? aiRes[0]?.response ?? aiRes[0]?.content ?? "")
      : "") ??
    ""
  );
}

const SYSTEM_PROMPT = "You are a professional content writer for ME Shield Financial Services (Miguelson Etienne, Apopka FL). Write clear, professional, warm content for insurance, tax preparation, business filing, immigration forms filing, and Infinite Banking. Never use the words 'advisor', 'paralegal', or 'attorney'. Keep content concise and ready to use. Output ONLY the final content — no thinking, no reasoning, no analysis.";

// Models in order of preference — GLM excluded (returns reasoning only)
const MODELS = [
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "@cf/mistral/mistral-7b-instruct-v0.2",
  "@cf/meta/llama-3.2-3b-instruct",
];

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
        JSON.stringify({ error: "Workers AI binding missing — add it in Cloudflare Pages > Settings > Bindings" }),
        { status: 500, headers }
      );
    }

    let lastError = "";

    for (const model of MODELS) {
      try {
        const aiRes = await context.env.AI.run(model, {
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt }
          ],
          max_tokens: 800,
        });

        const text = extractText(aiRes)?.trim();

        if (text) {
          return new Response(
            JSON.stringify({ result: text }),
            { status: 200, headers }
          );
        }

        lastError = `${model} returned empty. Raw: ${JSON.stringify(aiRes).substring(0, 150)}`;

      } catch (err) {
        lastError = `${model} error: ${err.message}`;
        continue;
      }
    }

    return new Response(
      JSON.stringify({ error: "All models failed. Last: " + lastError }),
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
