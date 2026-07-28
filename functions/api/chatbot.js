// functions/api/chatbot.js
//
// This is the "brain" of your AI chatbot.
// Cloudflare turns this file into a live web address: /api/chatbot
// It runs on Cloudflare's servers — visitors never see this code, only replies.

// ============================================================
// SETTINGS — edit these anytime, nothing else needs to change
// ============================================================
const AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"; // a well-established, reliable model
const MAX_REPLY_LENGTH = 400; // roughly how long a reply can be
const SUPPORT_EMAIL = "meshieldservices@gmail.com";
const SUPPORT_PHONE = "(407) 267-2652";
// ============================================================

export async function onRequestPost(context) {
  try {
    const { messages, language } = await context.request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ reply: "Sorry, I didn't receive your message. Please try again." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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

YOUR PERSONALITY: Warm and genuinely welcoming, like part of the family — but still professional and trustworthy. Never robotic, never pushy.

YOUR JOB:
- Answer general questions about the 5 services above
- Explain what each service is in simple, friendly terms
- Help visitors decide which service fits their need
- Point visitors toward a free quote or contacting Miguelson directly for their specific situation

YOUR BOUNDARIES (very important):
- NEVER give specific tax, insurance, legal, or immigration advice for someone's personal situation. General/educational information only.
- Anytime a topic involves a person's specific numbers, eligibility, or case details, say this needs to go through Miguelson directly.
- If a visitor seems frustrated, confused, asks repeatedly for something you can't do, or directly asks for a human — recommend contacting Miguelson directly.
- Keep answers short and clear: 2-4 sentences, unless the visitor asks for more detail.
- Never make up information you don't have here. If unsure, say so and offer to connect them with Miguelson.

CONTACT INFO (only share when relevant to the conversation):
- Email: ${SUPPORT_EMAIL}
- Phone: ${SUPPORT_PHONE}
- Digital business card: connect.meshieldfinancial.com

LANGUAGE: ${language === "ht" ? "Respond ONLY in Haitian Creole for this entire conversation, regardless of what language the visitor types in." : "Respond ONLY in English for this entire conversation, regardless of what language the visitor types in."}
`.trim();

    const recentMessages = messages.slice(-10);

    const aiResponse = await context.env.AI.run(AI_MODEL, {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...recentMessages
      ],
      max_tokens: MAX_REPLY_LENGTH
    });

    // Defensive parsing: different models sometimes package their answer
    // slightly differently. This checks the common possible spots so a
    // format quirk never results in a blank reply.
    const replyText =
      aiResponse?.response ||
      aiResponse?.result?.response ||
      aiResponse?.choices?.[0]?.message?.content ||
      "";

    if (!replyText.trim()) {
      // The AI ran but gave nothing usable — fail gracefully instead of blank.
      return new Response(
        JSON.stringify({
          reply: `Sorry, I couldn't quite process that. Please contact Miguelson directly at ${SUPPORT_EMAIL} or ${SUPPORT_PHONE}.`
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ reply: replyText }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Chatbot error:", err);
    return new Response(
      JSON.stringify({
        reply: `Sorry, I'm having trouble right now. Please contact Miguelson directly at ${SUPPORT_EMAIL} or ${SUPPORT_PHONE}.`
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
