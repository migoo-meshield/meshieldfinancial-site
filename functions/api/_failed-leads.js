// Shared helper — not a route. Pages ignores files that start with "_".
//
// A lead that passes every validation check and THEN cannot be delivered is
// the one kind of lost lead nobody ever finds out about. Make.com is switched
// off or out of operations, the Brevo fallback is missing or rejects it, the
// visitor reads an apology and closes the tab. The lead existed for about two
// seconds, in their browser, and nowhere else.
//
// This writes that lead into the FAILED_LEADS KV namespace, which the team
// portal's Failed Leads widget reads through /api/failed-leads. The point is
// simply that the name and phone number survive the outage, so the lead can
// be called back by hand.
//
// It needs the binding on the WEBSITE project:
//   Workers & Pages -> (this project) -> Settings -> Bindings ->
//   KV namespace, variable name FAILED_LEADS.
//
// Without the binding it does nothing and never throws. Failing to record a
// lost lead must never also break the answer the visitor is waiting for.

const KEY_PREFIX = 'failed-lead:';

// Keep a failed lead for a little over a year. Long enough that a lead lost
// in a January outage is still there the following January; short enough that
// the namespace does not grow forever.
const KEEP_FOR_SECONDS = 400 * 24 * 60 * 60;

// KV list() returns keys in lexicographic order and the portal reads the
// first 100 of them. A plain timestamp in the key would sort the OLDEST
// failures first, so once 100 had piled up a NEW failure would never appear
// in the widget — the exact opposite of what this is for. Inverting the
// timestamp makes the newest key sort first.
const INVERT_FROM = 1e14;

/**
 * Record a lead that could not be delivered.
 *
 * Returns { saved, key } and never throws.
 */
export async function recordFailedLead(env, details) {
  const namespace = env && env.FAILED_LEADS;
  const at = new Date().toISOString();

  if (!namespace || typeof namespace.put !== 'function') {
    return { saved: false, key: null };
  }

  const id = (details && details.submissionId)
    ? String(details.submissionId).slice(0, 60)
    : `MES-F-${at.replace(/\D/g, '').slice(0, 14)}`;

  const key = `${KEY_PREFIX}${String(INVERT_FROM - Date.now()).padStart(14, '0')}:${id}`;

  // Field names here are the ones /api/failed-leads already looks for:
  // name, email, phone, service, reason, failedAt.
  const record = {
    name: text(details.name, 120),
    email: text(details.email, 160),
    phone: text(details.phone, 40),
    service: text(details.service, 80),
    reason: text(details.reason, 300),
    failedAt: at,
    source: text(details.source, 40),
    state: text(details.state, 2),
    language: text(details.language, 20),
    message: text(details.message, 1000),
    pageUrl: text(details.pageUrl, 300),
    country: text(details.country, 8),
    submissionId: text(details.submissionId, 60),
    backupId: text(details.backupId, 60),
  };

  try {
    await namespace.put(key, JSON.stringify(record), {
      expirationTtl: KEEP_FOR_SECONDS,
      metadata: { at },
    });
    return { saved: true, key };
  } catch (err) {
    return { saved: false, key: null };
  }
}

/**
 * Put into words why the delivery failed, from what the caller knows.
 * The widget shows this to whoever is about to make the call-back, so it
 * says what broke rather than just "error".
 */
export function deliveryFailureReason(env) {
  const hasMake = Boolean(env && env.MAKE_WEBHOOK_URL);
  const hasFallback = Boolean(env && env.BREVO_FALLBACK_URL);

  if (!hasMake && !hasFallback) {
    return 'Neither Make.com nor the Brevo fallback is configured on the site — the lead had nowhere to go.';
  }
  if (!hasMake) {
    return 'MAKE_WEBHOOK_URL is not set and the Brevo fallback did not accept the lead.';
  }
  if (!hasFallback) {
    return 'Make.com did not accept the lead and no Brevo fallback URL is configured.';
  }
  return 'Make.com did not accept the lead and the Brevo fallback failed as well.';
}

function text(value, maxLength) {
  if (value === null || value === undefined) return '';
  return String(value).trim().slice(0, maxLength);
}
