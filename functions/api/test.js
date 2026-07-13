// functions/api/test.js
// Tests both the function routing AND the AI call

export async function onRequestGet(context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  const result = {
    status: "ok",
    function: "Cloudflare Pages Function is working ✅",
    ai_binding: context.env.AI ? "AI binding found ✅" : "AI binding MISSING ❌",
    ai_call: "not tested yet",
    ai_response_raw: null,
    ai_model_used: null,
    error: null,
  };

  if (!context.env.AI) {
    return new Response(JSON.stringify(result), { status: 200, headers });
  }

  // Test the AI call with a simple prompt
  try {
    const models = [
      "@cf/zai-org/glm-4.7-flash",
      "@cf/meta/llama-3.1-8b-instruct",
    ];

    for (const model of models) {
      try {
        const aiRes = await context.env.AI.run(model, {
          messages: [
            { role: "user", content: "Say hello in one sentence." }
          ],
          max_tokens: 50,
        });

        result.ai_response_raw = JSON.stringify(aiRes).substring(0, 300);
        result.ai_model_used = model;

        // Extract text
        const text =
          typeof aiRes === "string" ? aiRes :
          aiRes?.response ?? aiRes?.result?.response ??
          aiRes?.message?.content ?? aiRes?.content ?? aiRes?.text ??
          (Array.isArray(aiRes) ? (aiRes[0]?.generated_text ?? aiRes[0]?.response) : null);

        if (text && text.trim()) {
          result.ai_call = "AI is working ✅ — model: " + model;
          result.ai_text = text.trim();
          break;
        } else {
          result.ai_call = "AI responded but text was empty ⚠️";
        }
      } catch (modelErr) {
        result.ai_call = "Model " + model + " failed: " + modelErr.message;
      }
    }
  } catch (err) {
    result.ai_call = "AI call failed ❌";
    result.error = err.message;
  }

  return new Response(JSON.stringify(result, null, 2), { status: 200, headers });
}
