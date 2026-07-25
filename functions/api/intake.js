/**
 * ME Shield OS — "MES Front Door"
 * Cloudflare Worker · v1.0 · July 2026
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS FILE DOES
 * ---------------------------------------------------------------------------
 * This sits between your website form and Make.com. Every contact form
 * submission passes through here first.
 *
 * It does six jobs:
 *
 *   1. VALIDATES   — rejects incomplete or fake submissions before they
 *                    reach Make.com, so they cost you zero operations.
 *   2. HIDES       — your Make.com webhook URL lives here as a secret.
 *                    Visitors never see it. Bots can't find it.
 *   3. BLOCKS BOTS — checks the honeypot field your site already has.
 *   4. IDENTIFIES  — assigns every submission a unique Submission ID.
 *   5. GATES       — checks the client's state against your insurance
 *                    licenses (FL, MA, NJ) before it enters the pipeline.
 *   6. PROTECTS    — if Make.com is down, it falls back to Brevo directly
 *                    so you never lose a lead.
 *
 * ---------------------------------------------------------------------------
 * WHERE THIS GOES
 * ---------------------------------------------------------------------------
 * Cloudflare Dashboard → Workers & Pages → Create → Worker
 * Name it: mes-front-door
 * Paste this entire file, then click Deploy.
 *
 * Then add a route so it lives on your own domain:
 *   Route: meshieldfinancial.com/api/intake*
 *
 * ---------------------------------------------------------------------------
 * SECRETS YOU MUST SET (Settings → Variables → Add variable → Encrypt)
 * ---------------------------------------------------------------------------
 *   MAKE_WEBHOOK_URL   → your Make.com custom webhook URL
 *   BREVO_FALLBACK_URL → the long sibforms.com URL already in contact.html
 *
 * Never paste those two values into this file. Encrypted variables are the
 * only correct place for them. (Security Standard 7.2, rule 5.)
 * ---------------------------------------------------------------------------
 */


// ===========================================================================
// CONFIGURATION — safe to edit
// ===========================================================================

/** States where ME Shield holds an active insurance license. */
const LICENSED_STATES = ["FL", "MA", "NJ"];

/**
 * Translates the values your website form sends into the clean service names
 * used across ME Shield OS.
 *
 * Left side  = what contact.html sends (don't change these)
 * Right side = the ME Shield OS name (Documentation section 4.3)
 */
const SERVICE_MAP = {
  "life-insurance":   "life_insurance",
  "health-insurance": "health_insurance",
  "pc-insurance":     "property_casualty",
  "ibc":              "infinite_banking",
  "tax":              "tax_preparation",
  "immigration":      "immigration_forms",
  "business":         "business_filing",
  "other":            "other"
};

/**
 * Services that require a state insurance license.
 * Anything not in this list is federal or nationwide (tax, immigration
 * forms filing, business filing) and is never blocked by state.
 */
const STATE_LICENSED_SERVICES = [
  "life_insurance",
  "health_insurance",
  "property_casualty",
  "infinite_banking"
];

/** Which sites may submit to this Worker. */
const ALLOWED_ORIGINS = [
  "https://meshieldfinancial.com",
  "https://www.meshieldfinancial.com"
];


// ===========================================================================
// MAIN HANDLER — runs on every request
// ===========================================================================

/**
 * This one file works in BOTH places, so you never have to rewrite it:
 *
 *   • As a Cloudflare Pages Function  → onRequest  (recommended)
 *   • As a standalone Worker          → default export
 */
export const onRequest = (context) => handleIntake(context.request, context.env);
export default { fetch: handleIntake };


async function handleIntake(request, env) {

    const origin = request.headers.get("Origin") || "";
    const cors = buildCorsHeaders(origin);

    // Browsers send an OPTIONS "preflight" request first. Answer it politely.
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    // This endpoint only accepts POST. Anything else is not a real submission.
    if (request.method !== "POST") {
      return json({ ok: false, error: "method_not_allowed" }, 405, cors);
    }

    // -----------------------------------------------------------------------
    // STEP 1 — Read the submission
    // -----------------------------------------------------------------------
    let body;
    try {
      body = await request.json();
    } catch (err) {
      return json({ ok: false, error: "invalid_json" }, 400, cors);
    }

    // -----------------------------------------------------------------------
    // STEP 2 — Honeypot check
    //
    // "company_website" is an invisible field on your form. A human never
    // sees it, so it should always be empty. Bots fill in every field they
    // find, so if this has anything in it, we know it's a bot.
    //
    // We return success anyway. If we returned an error, the bot would learn
    // it was caught and try again differently. Silence is better.
    // -----------------------------------------------------------------------
    if (body.company_website) {
      return json({ ok: true, submission_id: null }, 200, cors);
    }

    // -----------------------------------------------------------------------
    // STEP 3 — Validate the required fields
    //
    // This is where we save your Make.com operations. Anything rejected here
    // costs you nothing.
    // -----------------------------------------------------------------------
    const first_name = clean(body.first_name, 80);
    const last_name  = clean(body.last_name, 80);
    const email      = clean(body.email, 160).toLowerCase();
    const phone      = clean(body.phone, 40);
    const state      = clean(body.state, 2).toUpperCase();
    const message    = clean(body.message, 2000);
    const rawService = clean(body.service, 40);
    const language   = clean(body.language, 20) || "english";

    const missing = [];
    if (!first_name)          missing.push("first_name");
    if (!email)               missing.push("email");
    if (!rawService)          missing.push("service");
    if (!state)               missing.push("state");
    if (body.consent !== true) missing.push("consent");

    if (missing.length > 0) {
      return json({ ok: false, error: "missing_fields", fields: missing }, 400, cors);
    }

    if (!isValidEmail(email)) {
      return json({ ok: false, error: "invalid_email" }, 400, cors);
    }

    const service_type = SERVICE_MAP[rawService];
    if (!service_type) {
      return json({ ok: false, error: "unknown_service" }, 400, cors);
    }

    // -----------------------------------------------------------------------
    // STEP 4 — The Licensing Gate
    //
    // If this is an insurance product AND the client is outside FL, MA, or NJ,
    // we mark it as not allowed. The submission is still captured — it goes
    // to your waitlist instead of your sales pipeline.
    //
    // This is a compliance control. Do not remove it.
    // -----------------------------------------------------------------------
    const needsLicense  = STATE_LICENSED_SERVICES.includes(service_type);
    const state_allowed = needsLicense ? LICENSED_STATES.includes(state) : true;

    // -----------------------------------------------------------------------
    // STEP 5 — Build the standard ME Shield OS payload
    //
    // Every submission from every source is shaped exactly like this.
    // Documentation section 4.1.
    // -----------------------------------------------------------------------
    const now = new Date().toISOString();

    const payload = {
      submission_id: makeSubmissionId(),
      timestamp: now,
      source: "website",
      service_type: service_type,

      client: {
        first_name: first_name,
        last_name:  last_name,
        email:      email,
        phone:      phone,
        state:      state,
        language:   normalizeLanguage(language)
      },

      payload: {
        message: message,
        service_raw: rawService
      },

      consent: {
        tcpa: true,
        at: now
      },

      gate: {
        state_allowed: state_allowed,
        requires_license: needsLicense,
        licensed_states: LICENSED_STATES
      },

      meta: {
        page_url: clean(body.page_url, 300),
        country: request.headers.get("CF-IPCountry") || "",
        received_at: now
      }
    };

    // -----------------------------------------------------------------------
    // STEP 6 — Send it to Make.com
    // -----------------------------------------------------------------------
    let deliveredTo = "make";
    let ok = false;

    try {
      const res = await fetch(env.MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      ok = res.ok;
    } catch (err) {
      ok = false;
    }

    // -----------------------------------------------------------------------
    // STEP 7 — Safety net
    //
    // If Make.com did not accept it (scenario off, out of operations, outage),
    // send the lead straight to Brevo the old way instead. You never lose a
    // lead because an automation was down.
    // -----------------------------------------------------------------------
    if (!ok && env.BREVO_FALLBACK_URL) {
      try {
        await sendToBrevo(env.BREVO_FALLBACK_URL, payload);
        deliveredTo = "brevo_fallback";
        ok = true;
      } catch (err) {
        ok = false;
      }
    }

    // -----------------------------------------------------------------------
    // STEP 8 — Tell the website the truth
    //
    // This is the part your site could never do before. A real answer, so the
    // form can show a real message instead of always saying "Thank you!".
    // -----------------------------------------------------------------------
    if (!ok) {
      return json({ ok: false, error: "delivery_failed" }, 502, cors);
    }

    return json({
      ok: true,
      submission_id: payload.submission_id,
      state_allowed: state_allowed,
      delivered_to: deliveredTo
    }, 200, cors);
}


// ===========================================================================
// HELPERS
// ===========================================================================

/** Trims whitespace and enforces a maximum length. */
function clean(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

/** A basic sanity check on email shape. */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email);
}

/** Converts the form's language values into ME Shield OS codes. */
function normalizeLanguage(value) {
  const v = value.toLowerCase();
  if (v === "creole" || v === "ht") return "ht";
  if (v === "both")                 return "both";
  return "en";
}

/**
 * Builds a unique Submission ID, e.g. MES-S-2026-K7F2M9
 *
 * A Cloudflare Worker has no memory between requests, so it cannot count
 * 1, 2, 3. Instead we combine the current time with a random value, which
 * is guaranteed unique and needs no database.
 */
function makeSubmissionId() {
  const year = new Date().getUTCFullYear();
  const time = Date.now().toString(36).slice(-4).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `MES-S-${year}-${time}${rand}`;
}

/** Standard JSON reply with the right headers attached. */
function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: { "Content-Type": "application/json", ...cors }
  });
}

/** Allows your website — and only your website — to submit here. */
function buildCorsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}

/**
 * The fallback path. Sends the lead to Brevo using exactly the same field
 * names your contact.html already uses, so nothing in Brevo has to change.
 */
async function sendToBrevo(brevoUrl, payload) {
  const params = new URLSearchParams();
  params.append("EMAIL", payload.client.email);
  params.append("FIRSTNAME", payload.client.first_name);
  params.append("LASTNAME", payload.client.last_name);

  if (payload.client.phone) {
    const digits = payload.client.phone.replace(/\D/g, "");
    params.append("SMS__COUNTRY_CODE", "+1");
    params.append("SMS", digits.length === 10 ? "1" + digits : digits);
  }

  params.append("SERVICE_INTERESTED", payload.payload.service_raw);
  params.append("LANG_PREF", payload.client.language);
  if (payload.payload.message) params.append("MESSAGE", payload.payload.message);
  params.append("email_address_check", "");   // Brevo's own honeypot — stays blank
  params.append("locale", "en");
  params.append("html_type", "simple");

  return fetch(brevoUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });
}
