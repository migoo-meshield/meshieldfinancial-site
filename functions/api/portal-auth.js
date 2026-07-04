// Cloudflare Pages Function — /api/portal-auth
// Handles: request magic link, verify token, send message
// Env vars needed: BREVO_API_KEY, PORTAL_SECRET

import * as crypto from 'node:crypto';

export async function onRequestPost(context) {
  const CORS = {
    'Access-Control-Allow-Origin': 'https://meshieldfinancial.com',
    'Content-Type': 'application/json',
  };

  const BREVO_KEY  = context.env.BREVO_API_KEY;
  const SECRET     = context.env.PORTAL_SECRET || 'meshield2026portal';
  const KV         = context.env.PORTAL_KV; // KV namespace for tokens

  try {
    const body   = await context.request.json();
    const action = body.action;

    // ── REQUEST MAGIC LINK ──────────────────────────────────────────────
    if(action === 'request') {
      const email = (body.email || '').toLowerCase().trim();
      if(!email) return json({ success: false, message: 'Email required' }, CORS);

      // Check if client exists in KV
      const clientData = await KV.get('client:' + email);
      if(!clientData) {
        return json({ success: false, message: 'Email not found. Please contact Miguelson to be added.' }, CORS);
      }

      // Generate token
      const token   = generateToken();
      const expires = Date.now() + 15 * 60 * 1000; // 15 min
      await KV.put('token:' + token, JSON.stringify({ email, expires }), { expirationTtl: 900 });

      const magicLink = `https://meshieldfinancial.com/client-portal?token=${token}`;
      const client    = JSON.parse(clientData);

      // Send email via Brevo
      await sendMagicLinkEmail(BREVO_KEY, email, client.name, magicLink);

      return json({ success: true }, CORS);
    }

    // ── VERIFY TOKEN ────────────────────────────────────────────────────
    if(action === 'verify') {
      const token = body.token || '';
      if(!token) return json({ success: false }, CORS);

      const stored = await KV.get('token:' + token);
      if(!stored) return json({ success: false, message: 'Link expired or invalid' }, CORS);

      const { email, expires } = JSON.parse(stored);
      if(Date.now() > expires) {
        await KV.delete('token:' + token);
        return json({ success: false, message: 'Link expired' }, CORS);
      }

      // One-time use — delete token
      await KV.delete('token:' + token);

      // Get client data
      const clientData = await KV.get('client:' + email);
      if(!clientData) return json({ success: false }, CORS);

      const client = JSON.parse(clientData);
      return json({ success: true, client }, CORS);
    }

    // ── SEND MESSAGE ────────────────────────────────────────────────────
    if(action === 'message') {
      const { email, name, message } = body;
      if(!message) return json({ success: false }, CORS);

      await sendMessageEmail(BREVO_KEY, email, name, message);
      return json({ success: true }, CORS);
    }

    return json({ success: false, message: 'Unknown action' }, CORS);

  } catch(e) {
    return json({ success: false, error: e.message }, CORS);
  }
}

// ── HELPERS ──────────────────────────────────────────────────────────────
function json(data, headers) {
  return new Response(JSON.stringify(data), { headers });
}

function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('');
}

async function sendMagicLinkEmail(apiKey, to, name, link) {
  return fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'ME Shield Financial Services', email: 'info@meshieldfinancial.com' },
      to: [{ email: to, name: name }],
      subject: 'Your Secure Portal Link — ME Shield Financial Services',
      htmlContent: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#FAF7F1;border-radius:16px;overflow:hidden;">
          <div style="background:#0B1D3A;padding:28px 32px;text-align:center;">
            <div style="font-family:Georgia,serif;font-size:1.1rem;font-weight:700;color:#fff;">ME Shield Financial Services</div>
            <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.14em;color:rgba(255,255,255,.4);margin-top:4px;">Secure Client Portal</div>
          </div>
          <div style="padding:36px 32px;">
            <p style="font-size:1rem;color:#0B1D3A;font-weight:600;margin-bottom:8px;">Hello ${name},</p>
            <p style="font-size:.92rem;color:#555;line-height:1.7;margin-bottom:28px;">
              You requested access to your ME Shield client portal. Click the button below to sign in securely. This link expires in <strong>15 minutes</strong>.
            </p>
            <div style="text-align:center;margin-bottom:28px;">
              <a href="${link}" style="display:inline-block;background:#C9A84C;color:#0B1D3A;font-weight:700;font-size:.95rem;padding:14px 40px;border-radius:50px;text-decoration:none;">
                Access My Portal →
              </a>
            </div>
            <p style="font-size:.78rem;color:#aaa;text-align:center;line-height:1.6;">
              If you did not request this link, you can safely ignore this email.<br/>
              This link can only be used once.
            </p>
          </div>
          <div style="background:#0B1D3A;padding:18px 32px;text-align:center;">
            <p style="font-size:.7rem;color:rgba(255,255,255,.3);margin:0;">
              ME Shield Financial Services · Apopka, FL 32712 · (407) 267-2652
            </p>
          </div>
        </div>
      `,
    }),
  });
}

async function sendMessageEmail(apiKey, clientEmail, clientName, message) {
  return fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'ME Shield Portal', email: 'info@meshieldfinancial.com' },
      to: [{ email: 'info@meshieldfinancial.com', name: 'Miguelson Etienne' }],
      replyTo: { email: clientEmail, name: clientName },
      subject: `Portal Message from ${clientName}`,
      htmlContent: `
        <p><strong>From:</strong> ${clientName} (${clientEmail})</p>
        <p><strong>Message:</strong></p>
        <p style="background:#f5f5f5;padding:16px;border-radius:8px;">${message}</p>
        <p><a href="https://meshieldfinancial.com/client-portal">Open Portal</a></p>
      `,
    }),
  });
}
