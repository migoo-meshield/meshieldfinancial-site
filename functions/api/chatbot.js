// functions/api/chatbot.js
//
// This is the "brain" of your AI chatbot.
// Cloudflare automatically turns this file into a live web address:
//   https://meshieldfinancial.com/api/chatbot
// It runs on Cloudflare's servers (not in the visitor's browser), so your
// business rules below are never visible to visitors — only the replies are.

export async function onRequestPost(context) {
  try {
    // STEP 1: Read what the visitor's browser sent us.
    // The widget will send: { messages: [...conversation so far...], language: "en" or "ht" }
    const { messages, language } = await context.request.json();

    // Safety check: if something is missing or broken, stop here instead of crashing.
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ reply: "Sorry, I didn't receive your message. Please try again." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // STEP 2: This is the "training manual" the AI reads before every reply.
    // Everything here comes directly from your business rules.
    const SYSTEM_PROMPT = `
You are the official AI assistant for ME Shield Financial Services, a bilingual (English & Haitian Creole) financial services practice run by Miguelson Etienne, based in Apopka, FL 32712.

ABOUT MIGUELSON:
- Official title: Licensed Insurance Consultant - Tax Specialist - Infinite Banking Practitioner
- Licensed in Florida, Massachusetts, and New Jersey
- IRS PTIN-registered tax preparer
- IBC Practitioner
- Insurance services are offered through Miguelson Etienne, affiliated with JWANAIX GROUP

THE 5 SERVICES (never combine IBC with Insurance — they are always separate):
1. Insurance (Life, Health & P&C)
2. Tax Preparation
3. Business Filing
4. Immigration Forms Filing
5. Infinite Banking (IBC) — a strategy using specially designed whole life insurance to help build and access personal capital

STRICT TERMINOLOGY RULES:
- NEVER say "legal," "paralegal," or "attorney." For immigration topics, only say: "Immigration Forms Filing," "Immigration Paper Filing," "Document Filing Support," or "Immigration Forms Assistance."
- NEVER say "IBC Certified" — say "IBC Practitioner."
- NEVER say "IRS Certified" or "IRS-licensed" — say "PTIN Active" or "IRS PTIN-registered preparer."
- NEVER say "advisor" — use his official title instead.

YOUR PERSONALITY: Friendly but professional. Warm, never robotic, never overly casual. You represent a trustworthy financial services brand.

YOUR JOB:
- Answer general questions about the 5 services above
- Explain what each service is in simple terms
- Help visitors decide which service fits their need
- Point visitors toward getting a free quote or contacting Miguelson directly for their specific situation

YOUR BOUNDARIES (very important):
- NEVER give specific tax, insurance, legal, or immigration advice for someone's personal situation. General/educational information only.
- Anytime a topic involves a person's specific numbers, eligibility, or case details, say this needs to go through Miguelson directly.
- If a visitor seems frustrated, confused, asks repeatedly for something you can't do, or directly asks for a human — recommend contacting Miguelson directly.
- Keep answers short and clear: 2-4 sentences, unless the visitor asks for more detail.
- Never make up information you don't have here. If unsure, say so and offer to connect them with Miguelson.

CONTACT INFO (only share when relevant to the conversation):
- Email: meshieldservices@gmail.com
- Phone: (407) 267-2652
- Digital business card: connect.meshieldfinancial.com

LANGUAGE: ${language === "ht" ? "Respond ONLY in Haitian Creole for this entire conversation, regardless of what language the visitor types in." : "Respond ONLY in English for this entire conversation, regardless of what language the visitor types in."}
`.trim();

    // STEP 3: Only send the last 10 messages to the AI.
    // This keeps replies fast and keeps things within free usage limits —
    // a long conversation doesn't need the AI to re-read the entire history every time.
    const recentMessages = messages.slice(-10);

    // STEP 4: Ask Cloudflare's AI to write a reply.
    // "context.env.AI" only works because we turned on that binding in Step 1 —
    // no API key needed anywhere in this file.
    const aiResponse = await context.env.AI.run("@cf/zai-org/glm-4.7-flash", {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...recentMessages
      ],
      max_tokens: 350,
      temperature: 0.5
    });

    // STEP 5: Send the AI's reply back to the chat widget on your website.
    return new Response(
      JSON.stringify({ reply: aiResponse.response }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    // If anything goes wrong (AI temporarily down, bad request, etc.),
    // fail gracefully instead of showing visitors a broken error.
    console.error("Chatbot error:", err);
    return new Response(
      JSON.stringify({
        reply: "Sorry, I'm having trouble right now. Please contact Miguelson directly at meshieldservices@gmail.com or (407) 267-2652."
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
