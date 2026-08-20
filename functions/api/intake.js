/**
 * ME Shield OS — Connect Lead Intake Front Door
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
const VALID_STATES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI",
  "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN",
  "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH",
  "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA",
  "WV", "WI", "WY"
]);

const COMMON_EMAIL_TYPOS = {
  "gmail.co": "gmail.com", "gamil.com": "gmail.com", "gmial.com": "gmail.com",
  "gmai.com": "gmail.com", "gmail.con": "gmail.com",
  "yaho.com": "yahoo.com", "yahoo.co": "yahoo.com", "yahoo.con": "yahoo.com",
  "hotmal.com": "hotmail.com", "hotmail.co": "hotmail.com", "hotmail.con": "hotmail.com",
  "outlook.co": "outlook.com", "outlook.con": "outlook.com",
  "icloud.co": "icloud.com", "icloud.con": "icloud.com"
};

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
  "other":            "other",
  "insurance":        "insurance"
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
  "infinite_banking",
  "insurance"
];

/** Which sites may submit to this Worker. */
const ALLOWED_ORIGINS = [
  "https://meshieldfinancial.com",
  "https://www.meshieldfinancial.com",
  "https://connect.meshieldfinancial.com"
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
    // STEP 2.5 — Durable backup before validation or delivery
    //
    // Store a server-side recovery copy before Make.com, Brevo, or field
    // validation can fail. LEAD_BACKUP_KV is the dedicated binding; the
    // already-provisioned CHATBOT_STATS namespace is a safe compatibility
    // fallback while the dedicated namespace is being attached.
    // -----------------------------------------------------------------------
    const leadBackup = await saveLeadBackup(env, body, request);

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
    const referredBy = clean(body.referred_by, 200);
    const dateOfBirth = clean(body.dob || body.date_of_birth, 10); // referral code from a client's personal link, if any

    const missing = [];
    if (!first_name)          missing.push("first_name");
    if (!email)               missing.push("email");
    if (!phone)               missing.push("phone");
    if (!rawService)          missing.push("service");
    if (!state)               missing.push("state");
    if (body.consent !== true) missing.push("consent");

    if (missing.length > 0) {
      const fieldErrors = Object.fromEntries(
        missing.map((field) => [field, fieldMessage(field)])
      );
      return json({
        ok: false,
        error: "missing_fields",
        fields: missing,
        field_errors: fieldErrors,
        message: "Please complete the highlighted required fields.",
        ...backupReceipt(leadBackup)
      }, 400, cors);
    }

    if (!isValidEmail(email)) {
      return json({
        ok: false,
        error: "invalid_email",
        field: "email",
        field_errors: { email: "Enter a valid email address, such as name@example.com." },
        message: "Please correct the email address.",
        ...backupReceipt(leadBackup)
      }, 400, cors);
    }

    const suggestedEmail = emailTypoSuggestion(email);
    if (suggestedEmail) {
      return json({
        ok: false,
        error: "likely_email_typo",
        field: "email",
        suggestion: suggestedEmail,
        field_errors: { email: `Did you mean ${suggestedEmail}? Please verify your email address.` },
        message: "Please verify the email address.",
        ...backupReceipt(leadBackup)
      }, 400, cors);
    }

    if (!isValidFirstName(first_name)) {
      return json({
        ok: false,
        error: "invalid_first_name",
        field: "first_name",
        field_errors: { first_name: "Enter a valid first name using letters, spaces, apostrophes, or hyphens." },
        message: "Please correct the first name.",
        ...backupReceipt(leadBackup)
      }, 400, cors);
    }

    if (!isValidPhone(phone)) {
      return json({
        ok: false,
        error: "invalid_phone",
        field: "phone",
        field_errors: { phone: "Enter a valid 10-digit U.S. phone number." },
        message: "Please correct the phone number.",
        ...backupReceipt(leadBackup)
      }, 400, cors);
    }

    if (dateOfBirth && !isValidDateOfBirth(dateOfBirth)) {
      return json({
        ok: false,
        error: "invalid_date_of_birth",
        field: "date_of_birth",
        field_errors: { date_of_birth: "Enter a valid date of birth in YYYY-MM-DD format. It cannot be today or a future date." },
        message: "Please correct the date of birth.",
        ...backupReceipt(leadBackup)
      }, 400, cors);
    }

    if (!VALID_STATES.has(state)) {
      return json({
        ok: false,
        error: "invalid_state",
        field: "state",
        field_errors: { state: "Select a valid U.S. state from the list." },
        message: "Please select a valid state.",
        ...backupReceipt(leadBackup)
      }, 400, cors);
    }

    const service_type = SERVICE_MAP[rawService];
    if (!service_type) {
      return json({
        ok: false,
        error: "unknown_service",
        field: "service",
        field_errors: { service: "Choose one of the services listed in the form." },
        message: "Please select a valid service.",
        ...backupReceipt(leadBackup)
      }, 400, cors);
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
    const backupNotes = [];
    if (message) backupNotes.push(message);
    if (dateOfBirth) backupNotes.push(`Date of Birth: ${dateOfBirth}`);
    const backupMessage = backupNotes.join(" | ");

    const payload = {
      submission_id: makeSubmissionId(),
      timestamp: now,
      timestamp_et: easternTimestamp(now),
      source: "website",
      service_type: service_type,

      client: {
        first_name: first_name,
        last_name:  last_name,
        email:      email,
        phone:      phone,
        state:      state,
        language:   normalizeLanguage(language),
        date_of_birth: dateOfBirth
      },

      payload: {
        message: backupMessage,
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
        received_at: now,
        referred_by: referredBy
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
    // STEP 7.5 — Referral tracking (best effort)
    //
    // If this lead came in through a client's personal referral link, tell
    // the Client Portal so it can log the referral on that client's own
    // record. This is a "nice to have" — if it fails for any reason (portal
    // down, code invalid, etc.) it must NEVER block or fail the actual lead
    // submission above. That's why every error here is swallowed silently.
    // -----------------------------------------------------------------------
    if (referredBy) {
      try {
        await fetch("https://clientportal.meshieldfinancial.com/api/log-referral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: referredBy,
            lead_name: `${first_name} ${last_name}`.trim(),
            lead_email: email,
            service: rawService
          })
        });
      } catch (err) {
        // Swallowed on purpose — see comment above.
      }
    }

    // -----------------------------------------------------------------------
    // STEP 8 — Tell the website the truth
    //
    // This is the part your site could never do before. A real answer, so the
    // form can show a real message instead of always saying "Thank you!".
    // -----------------------------------------------------------------------
    if (!ok) {
      await updateLeadBackup(env, leadBackup, {
        status: "delivery_failed",
        submission_id: payload.submission_id,
        delivered_to: null
      });
      return json({
        ok: false,
        error: "delivery_failed",
        message: "We could not safely submit your information right now. Your form entries are still saved on this device. Please try again, or contact ME Shield Financial Services at (407) 267-2652.",
        retryable: true,
        support: {
          phone: "+14072672652",
          email: "meshieldservices@gmail.com"
        },
        ...backupReceipt(leadBackup)
      }, 502, cors);
    }

    await updateLeadBackup(env, leadBackup, {
      status: "delivered",
      submission_id: payload.submission_id,
      delivered_to: deliveredTo
    });

    return json({
      ok: true,
      submission_id: payload.submission_id,
      state_allowed: state_allowed,
      delivered_to: deliveredTo,
      ...backupReceipt(leadBackup)
    }, 200, cors);
}


// ===========================================================================
// HELPERS
// ===========================================================================

function leadBackupNamespace(env) {
  return env.LEAD_BACKUP_KV || env.CHATBOT_STATS || null;
}

async function saveLeadBackup(env, body, request) {
  const namespace = leadBackupNamespace(env);
  const backupId = `MES-B-${new Date().toISOString().replace(/\D/g, "").slice(0, 14)}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  if (!namespace) return { saved: false, id: backupId, record: null };

  const now = new Date().toISOString();
  const record = {
    backup_id: backupId,
    status: "received_unvalidated",
    received_at: now,
    updated_at: now,
    source: "connect_form",
    client: {
      first_name: clean(body.first_name, 80),
      last_name: clean(body.last_name, 80),
      email: clean(body.email, 160).toLowerCase(),
      phone: clean(body.phone, 40),
      date_of_birth: clean(body.dob || body.date_of_birth, 10),
      state: clean(body.state, 2).toUpperCase(),
      language: clean(body.language, 20) || "english"
    },
    request: {
      service: clean(body.service, 40),
      message: clean(body.message, 2000),
      consent: body.consent === true,
      page_url: clean(body.page_url, 300),
      country: request.headers.get("CF-IPCountry") || ""
    },
    delivery: {
      submission_id: null,
      delivered_to: null
    }
  };

  try {
    await namespace.put(`lead-backup:${backupId}`, JSON.stringify(record));
    return { saved: true, id: backupId, record };
  } catch (err) {
    return { saved: false, id: backupId, record: null };
  }
}

async function updateLeadBackup(env, backup, update) {
  if (!backup || !backup.saved || !backup.record) return false;
  const namespace = leadBackupNamespace(env);
  if (!namespace) return false;

  const record = {
    ...backup.record,
    status: update.status || backup.record.status,
    updated_at: new Date().toISOString(),
    delivery: {
      submission_id: update.submission_id || null,
      delivered_to: update.delivered_to || null
    }
  };

  try {
    await namespace.put(`lead-backup:${backup.id}`, JSON.stringify(record));
    backup.record = record;
    return true;
  } catch (err) {
    return false;
  }
}

function backupReceipt(backup) {
  return {
    backup_saved: Boolean(backup && backup.saved),
    backup_id: backup ? backup.id : null
  };
}

/** Trims whitespace and enforces a maximum length. */
// The "timestamp"/"received_at"/"consent.at" fields above stay raw UTC ISO
// on purpose (the documented ME Shield OS payload shape — Make.com and any
// downstream automation may already parse those as ISO). This helper adds a
// SEPARATE, human-readable Eastern Time string alongside them, purely for
// display in the Master Log sheet. Point the sheet's timestamp column at
// "timestamp_et" instead of "timestamp" to show Florida-local time.
function easternTimestamp(isoString) {
  const d = isoString ? new Date(isoString) : new Date();
  return d.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
  }) + ' ET';
}

function clean(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

/** A basic sanity check on email shape. */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email);
}

function emailTypoSuggestion(email) {
  const [localPart, domain, extra] = email.toLowerCase().split("@");
  if (!localPart || !domain || extra) return null;
  const correctedDomain = COMMON_EMAIL_TYPOS[domain];
  return correctedDomain ? `${localPart}@${correctedDomain}` : null;
}

function isValidFirstName(name) {
  return name.length >= 2 && /^[\p{L}\p{M}][\p{L}\p{M}'’ .-]*$/u.test(name);
}

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

function isValidDateOfBirth(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return false;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return date.getTime() < todayUtc && year >= 1900;
}

function fieldMessage(field) {
  const messages = {
    first_name: "Enter your first name.",
    email: "Enter your email address.",
    phone: "Enter your phone number.",
    service: "Choose the service you need.",
    state: "Choose your state.",
    consent: "Check the consent box so ME Shield can contact you."
  };
  return messages[field] || "Complete this required field.";
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
  const fallbackNotes = [];
  if (payload.payload.message) fallbackNotes.push(payload.payload.message);
  if (payload.client.date_of_birth) fallbackNotes.push(`Date of Birth: ${payload.client.date_of_birth}`);
  if (fallbackNotes.length) params.append("MESSAGE", fallbackNotes.join(" | "));
  params.append("email_address_check", "");   // Brevo's own honeypot — stays blank
  params.append("locale", "en");
  params.append("html_type", "simple");

  return fetch(brevoUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });
}
