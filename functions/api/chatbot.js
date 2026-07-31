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
const BLOG_BASE_URL = "https://www.meshieldfinancial.com/";

// Blog articles the bot may naturally reference when a topic comes up in
// conversation — grouped by which of the 5 services they relate to. Add a
// new article here any time a new blog post goes live and the bot will
// start offering it on its own; no other change needed.
const ARTICLE_LIBRARY = {
  "Insurance": [
    "how-much-life-insurance-do-i-need.html",
    "hurricane-season-home-insurance-checklist.html",
    "hurricane-season-financial-preparedness.html",
    "health-insurance-open-enrollment-florida.html",
  ],
  "Tax Preparation": [
    "tax-deductions-self-employed.html",
    "tax-prep-checklist.html",
    "2026-standard-deduction-increase.html",
    "50-30-20-budget-rule.html",
  ],
  "Business Filing": [
    "llc-formation-florida-guide.html",
    "llc-registration-mistakes-florida.html",
    "registered-agent-florida-llc.html",
  ],
  "Immigration Forms Filing": [
    "immigration-forms-checklist.html",
    "daca-2026-renewal-guide.html",
    "naturalization-process-guide.html",
    "itin-guide-florida.html",
    "tps-haiti-2026-update.html",
  ],
  "Infinite Banking (IBC)": [
    "infinite-banking-concept-explained.html",
    "term-vs-whole-life-ibc.html",
    "whole-life-vs-universal-life.html",
  ],
  "General money habits / wealth building": [
    "haitian-diaspora-wealth-building.html",
    "haitian-household-money-habits.html",
    "building-an-emergency-fund.html",
    "choosing-a-trustworthy-financial-advisor.html",
  ],
};

function buildArticleLibraryText() {
  return Object.entries(ARTICLE_LIBRARY)
    .map(([category, files]) =>
      `${category}:\n` + files.map(f => `  - ${BLOG_BASE_URL}${f}`).join("\n")
    )
    .join("\n\n");
}
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
- When a blog article below is genuinely relevant to what the visitor is asking about, mention it naturally (e.g., "We actually have a short guide on this: [link]") — never force one in if nothing fits, and never share more than one link per reply
- Always still end by offering to connect the visitor with Miguelson for anything specific to their situation — the article is a helpful extra, never a replacement for that

BLOG ARTICLES YOU CAN REFERENCE (grouped by service — only share the full URL, never invent one that isn't listed here):
${buildArticleLibraryText()}

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
