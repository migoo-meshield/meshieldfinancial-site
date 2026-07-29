// Cloudflare Pages Function — /api/portal-auth
// Compatible with Cloudflare Pages Functions runtime

export async function onRequestPost(context) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const BREVO_KEY = context.env.BREVO_API_KEY;
  const KV        = context.env.PORTAL_KV;

  try {
    const body   = await context.request.json();
    const action = body.action;

    // ── REQUEST MAGIC LINK ──────────────────────────────────────────────
    if (action === 'request') {
      const email = (body.email || '').toLowerCase().trim();
      if (!email) return json({ success: false, message: 'Email required' }, CORS);

      const clientData = await KV.get('client:' + email);
      if (!clientData) {
        return json({ success: false, message: 'Email not found. Please contact Miguelson to be added to the portal.' }, CORS);
      }

      // Generate secure random token using Cloudflare global crypto
      const tokenBytes = new Uint8Array(32);
      crypto.getRandomValues(tokenBytes);
      const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');

      const expires = Date.now() + 15 * 60 * 1000;
      await KV.put('token:' + token, JSON.stringify({ email, expires }), { expirationTtl: 900 });

      const client    = JSON.parse(clientData);
      const magicLink = 'https://meshieldfinancial.com/client-portal?token=' + token;

      const emailResult = await sendMagicLinkEmail(BREVO_KEY, email, client.name, magicLink);

      if (!emailResult.ok) {
        console.log('BREVO ERROR:', emailResult.status, emailResult.body);
        return json({ success: false, message: 'Email could not be sent. Please try again or contact support.', debug: emailResult.body }, CORS);
      }

      console.log('BREVO SUCCESS:', emailResult.body);
      return json({ success: true }, CORS);
    }

    // ── VERIFY TOKEN ────────────────────────────────────────────────────
    if (action === 'verify') {
      const token = body.token || '';
      if (!token) return json({ success: false }, CORS);

      const stored = await KV.get('token:' + token);
      if (!stored) return json({ success: false, message: 'Link expired or invalid' }, CORS);

      const { email, expires } = JSON.parse(stored);
      if (Date.now() > expires) {
        await KV.delete('token:' + token);
        return json({ success: false, message: 'Link has expired. Please request a new one.' }, CORS);
      }

      await KV.delete('token:' + token);

      const clientData = await KV.get('client:' + email);
      if (!clientData) return json({ success: false }, CORS);

      const client = JSON.parse(clientData);
      return json({ success: true, client }, CORS);
    }

    // ── SEND MESSAGE ────────────────────────────────────────────────────
    if (action === 'message') {
      const { email, name, message } = body;
      if (!message) return json({ success: false }, CORS);
      const emailResult = await sendMessageEmail(BREVO_KEY, email, name, message);
      if (!emailResult.ok) {
        console.log('BREVO ERROR (message):', emailResult.status, emailResult.body);
      }
      return json({ success: true }, CORS);
    }

    // ── SUBMIT INTAKE (from intake.html) ─────────────────────────────────
    // Added by Claude, July 2026 — this action previously fell through to
    // "Unknown action" below, meaning every intake submission was silently
    // failing. This delivers it to your inbox the same way portal messages
    // already work, with any attached documents included as email attachments.
    if (action === 'submit_intake') {
      const { email, name, service, fields, documents } = body;
      if (!email || !service) return json({ success: false, message: 'Missing required information.' }, CORS);

      const submission_id = makeSubmissionId('INT');
      const emailResult = await sendSubmissionEmail(BREVO_KEY, {
        kind: 'Full Client Intake',
        submission_id, email, name, service, fields,
        files: documents || [],
      });

      if (!emailResult.ok) {
        console.log('BREVO ERROR (submit_intake):', emailResult.status, emailResult.body);
        return json({ success: false, message: 'Could not deliver your intake. Please call or text us so nothing is lost.' }, CORS);
      }
      return json({ success: true, submission_id }, CORS);
    }

    // ── SUBMIT REQUEST / CLAIM (from claim.html) ─────────────────────────
    // Added by Claude, July 2026 — same gap as above. Also delivers any
    // evidence files and the signature (with its date/time/location stamp)
    // as attachments.
    if (action === 'submit_request') {
      const { email, name, service, fields, evidence, signature, signature_meta } = body;
      if (!email || !service) return json({ success: false, message: 'Missing required information.' }, CORS);

      const submission_id = makeSubmissionId('REQ');
      const emailResult = await sendSubmissionEmail(BREVO_KEY, {
        kind: 'Service Request / Claim',
        submission_id, email, name, service, fields,
        files: evidence || [],
        signature, signature_meta,
      });

      if (!emailResult.ok) {
        console.log('BREVO ERROR (submit_request):', emailResult.status, emailResult.body);
        return json({ success: false, message: 'Could not deliver your request. Please call or text us so nothing is lost.' }, CORS);
      }
      return json({ success: true, submission_id }, CORS);
    }

    return json({ success: false, message: 'Unknown action' }, CORS);

  } catch (e) {
    console.log('FUNCTION ERROR:', e.message);
    return json({ success: false, error: e.message }, CORS);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
function json(data, headers) {
  return new Response(JSON.stringify(data), { headers });
}

async function sendMagicLinkEmail(apiKey, to, name, link) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'ME Shield Financial Services', email: 'info@meshieldfinancial.com' },
      to: [{ email: to, name: name || 'Client' }],
      subject: 'Your Secure Portal Link — ME Shield Financial Services',
      htmlContent: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#FAF7F1;border-radius:16px;overflow:hidden;">
          <div style="background:#0B1D3A;padding:28px 32px;text-align:center;">
            <div style="font-family:Georgia,serif;font-size:1.1rem;font-weight:700;color:#fff;">ME Shield Financial Services</div>
            <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.14em;color:rgba(255,255,255,.4);margin-top:4px;">Secure Client Portal</div>
          </div>
          <div style="padding:36px 32px;">
            <p style="font-size:1rem;color:#0B1D3A;font-weight:600;margin-bottom:8px;">Hello ${name || 'Client'},</p>
            <p style="font-size:.92rem;color:#555;line-height:1.7;margin-bottom:28px;">
              You requested access to your ME Shield client portal. Click the button below to sign in securely.
              This link expires in <strong>15 minutes</strong> and can only be used once.
            </p>
            <div style="text-align:center;margin-bottom:28px;">
              <a href="${link}" style="display:inline-block;background:#C9A84C;color:#0B1D3A;font-weight:700;font-size:.95rem;padding:14px 40px;border-radius:50px;text-decoration:none;">
                Access My Portal
              </a>
            </div>
            <p style="font-size:.78rem;color:#aaa;text-align:center;line-height:1.6;">
              If you did not request this link, you can safely ignore this email.
            </p>
          </div>
          <div style="background:#0B1D3A;padding:18px 32px;text-align:center;">
            <p style="font-size:.7rem;color:rgba(255,255,255,.3);margin:0;">
              ME Shield Financial Services &nbsp;·&nbsp; Apopka, FL 32712 &nbsp;·&nbsp; (407) 267-2652
            </p>
          </div>
        </div>
      `,
    }),
  });
  const bodyText = await res.text();
  return { ok: res.ok, status: res.status, body: bodyText };
}

// ── Submission ID — same style as functions/api/intake.js so every
// reference number across the site follows one pattern (e.g. MES-INT-2026-K7F2M9).
function makeSubmissionId(prefix) {
  const year = new Date().getUTCFullYear();
  const time = Date.now().toString(36).slice(-4).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `MES-${prefix}-${year}-${time}${rand}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Turns the flat { field_name: value } object from intake.html / claim.html
// into a readable HTML table for the email body. Handles the flattened
// repeater field names (e.g. "vehicles[0][ymm]") without any special parsing.
function formatFieldsHtml(fields) {
  if (!fields || typeof fields !== 'object' || !Object.keys(fields).length) {
    return '<p style="color:#888;font-size:12px;">(no additional fields submitted)</p>';
  }
  const rows = Object.entries(fields).map(([k, v]) => {
    const val = (v === true) ? 'Yes' : (v === false) ? 'No' : (v === '' || v == null) ? '—' : String(v);
    return `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:600;color:#0B1D3A;white-space:nowrap;vertical-align:top;font-size:12px;">${escapeHtml(k)}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;color:#333;font-size:12px;">${escapeHtml(val)}</td></tr>`;
  }).join('');
  return `<table style="width:100%;border-collapse:collapse;">${rows}</table>`;
}

/**
 * Delivers an intake.html or claim.html submission to your inbox via Brevo,
 * with any attached documents / evidence / signature included as real email
 * attachments (Brevo's attachment field takes plain base64, no data: prefix —
 * intake.html/claim.html already strip that client-side for documents and
 * evidence; the signature comes through as a full data URL, so it's stripped
 * here instead).
 *
 * NOTE: Brevo's transactional email API has a request size ceiling (their
 * docs cite ~10MB total). Three 5MB documents plus a signature could in rare
 * cases approach that. If a submission with large attachments ever fails to
 * send, that's the likely cause — worth keeping an eye on.
 */
async function sendSubmissionEmail(apiKey, { kind, submission_id, email, name, service, fields, files, signature, signature_meta }) {
  const attachments = [];
  (files || []).forEach(f => {
    if (f && f.data) attachments.push({ name: f.filename || 'attachment', content: f.data });
  });
  if (signature) {
    const raw = signature.includes(',') ? signature.split(',')[1] : signature;
    attachments.push({ name: 'signature.png', content: raw });
  }

  let stampLine = '';
  if (signature_meta && (signature_meta.timestamp || signature_meta.location)) {
    const parts = [];
    if (signature_meta.timestamp) parts.push('Signed ' + signature_meta.timestamp);
    if (signature_meta.location) parts.push('Location ' + signature_meta.location);
    stampLine = `<p style="font-size:12px;color:#657789;margin:4px 0 0;">${escapeHtml(parts.join(' · '))}</p>`;
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'ME Shield Portal', email: 'info@meshieldfinancial.com' },
      to: [{ email: 'info@meshieldfinancial.com', name: 'Miguelson Etienne' }],
      replyTo: { email: email || 'client@unknown.com', name: name || 'Client' },
      subject: `${kind} — ${service} — ${name || email} (${submission_id})`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
          <p><strong>Type:</strong> ${escapeHtml(kind)}</p>
          <p><strong>Service:</strong> ${escapeHtml(service)}</p>
          <p><strong>Client:</strong> ${escapeHtml(name || '')} (${escapeHtml(email || '')})</p>
          <p><strong>Reference:</strong> ${submission_id}</p>
          ${stampLine}
          <p style="margin-top:18px;"><strong>Details:</strong></p>
          ${formatFieldsHtml(fields)}
          ${attachments.length ? `<p style="margin-top:14px;font-size:12px;color:#657789;">${attachments.length} file(s) attached to this email — ${attachments.map(a => escapeHtml(a.name)).join(', ')}.</p>` : ''}
        </div>
      `,
      attachment: attachments.length ? attachments : undefined,
    }),
  });
  const bodyText = await res.text();
  return { ok: res.ok, status: res.status, body: bodyText };
}

async function sendMessageEmail(apiKey, clientEmail, clientName, message) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'ME Shield Portal', email: 'info@meshieldfinancial.com' },
      to: [{ email: 'info@meshieldfinancial.com', name: 'Miguelson Etienne' }],
      replyTo: { email: clientEmail || 'client@unknown.com', name: clientName || 'Client' },
      subject: 'Portal Message from ' + (clientName || 'Client'),
      htmlContent: `
        <p><strong>From:</strong> ${clientName || 'Client'} (${clientEmail || 'unknown'})</p>
        <p><strong>Message:</strong></p>
        <p style="background:#f5f5f5;padding:16px;border-radius:8px;line-height:1.7;">${message}</p>
      `,
    }),
  });
  const bodyText = await res.text();
  return { ok: res.ok, status: res.status, body: bodyText };
}
