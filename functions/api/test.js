// functions/api/test.js

function extractText(aiRes) {
  if (!aiRes) return "";
  if (typeof aiRes === "string") return aiRes;
  if (aiRes?.choices?.[0]?.message) {
    const msg = aiRes.choices[0].message;
    const text = msg.content ?? msg.text ?? "";
    if (text) return text;
  }
  return aiRes?.response ?? aiRes?.result?.response ?? aiRes?.content ?? aiRes?.text ?? (Array.isArray(aiRes) ? (aiRes[0]?.generated_text ?? aiRes[0]?.response ?? "") : "") ?? "";
}

const MODELS = [
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "@cf/mistral/mistral-7b-instruct-v0.2",
  "@cf/meta/llama-3.2-3b-instruct",
];

export async function onRequestGet(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

  const result = {
    function: "Cloudflare Pages Function is working ✅",
    ai_binding: context.env.AI ? "AI binding found ✅" : "AI binding MISSING ❌",
    models_tested: [],
    working_model: null,
    ai_text: null,
    error: null,
  };

  if (!context.env.AI) {
    return new Response(JSON.stringify(result, null, 2), { status: 200, headers });
  }

  for (const model of MODELS) {
    try {
      const aiRes = await context.env.AI.run(model, {
        messages: [{ role: "user", content: "Say hello in one sentence." }],
        max_tokens: 60,
      });

      const text = extractText(aiRes)?.trim();

      if (text) {
        result.models_tested.push(`${model} ✅`);
        result.working_model = model;
        result.ai_text = text;
        break;
      } else {
        result.models_tested.push(`${model} ⚠️ empty response`);
      }
    } catch (err) {
      result.models_tested.push(`${model} ❌ ${err.message}`);
    }
  }

  if (!result.working_model) {
    result.error = "No working model found";
  }

  return new Response(JSON.stringify(result, null, 2), { status: 200, headers });
}
