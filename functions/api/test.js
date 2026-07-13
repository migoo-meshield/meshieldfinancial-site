// functions/api/test.js

function extractText(aiRes) {
  if (!aiRes) return "";
  if (typeof aiRes === "string") return aiRes;
  if (aiRes?.choices?.[0]?.message) {
    const msg = aiRes.choices[0].message;
    const text = msg.content ?? msg.reasoning ?? msg.text ?? "";
    if (text) return text;
  }
  return aiRes?.response ?? aiRes?.result?.response ?? aiRes?.message?.content ?? aiRes?.content ?? aiRes?.text ?? (Array.isArray(aiRes) ? (aiRes[0]?.generated_text ?? aiRes[0]?.response ?? "") : "") ?? "";
}

export async function onRequestGet(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

  const result = {
    status: "ok",
    function: "Cloudflare Pages Function is working ✅",
    ai_binding: context.env.AI ? "AI binding found ✅" : "AI binding MISSING ❌",
    ai_call: "not tested",
    ai_text: null,
    ai_model: null,
    raw_response: null,
    error: null,
  };

  if (!context.env.AI) {
    return new Response(JSON.stringify(result, null, 2), { status: 200, headers });
  }

  try {
    const aiRes = await context.env.AI.run("@cf/zai-org/glm-4.7-flash", {
      messages: [{ role: "user", content: "Say hello in one sentence." }],
      max_tokens: 60,
    });

    result.raw_response = JSON.stringify(aiRes).substring(0, 400);
    const text = extractText(aiRes)?.trim();

    if (text) {
      result.ai_call = "AI is working ✅";
      result.ai_text = text;
      result.ai_model = "@cf/zai-org/glm-4.7-flash";
    } else {
      result.ai_call = "AI responded but text was empty ⚠️ — check raw_response";
    }
  } catch (err) {
    result.ai_call = "AI call failed ❌";
    result.error = err.message;
  }

  return new Response(JSON.stringify(result, null, 2), { status: 200, headers });
}
