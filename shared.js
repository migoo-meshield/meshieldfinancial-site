/* shared.js — nav, language switcher, scroll reveal, footer */
/* ── Language Switcher ── */
function initLang() {
  const saved = localStorage.getItem('me-shield-lang') || 'en';
  setLang(saved, false);
}
function setLang(lang, save = true) {
  document.body.classList.remove('lang-en', 'lang-ht');
  document.body.classList.add('lang-' + lang);
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  if (save) localStorage.setItem('me-shield-lang', lang);
}
/* ── Hamburger / off-canvas mobile menu ──
   Upgraded by Claude: adds a dark scrim behind the panel, closes on
   scrim click or link click, and drives the slide-in animation defined
   in style.css (.nav-links transform). */
function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  // New side-panel pages don't use #nav-links — skip
  if (!btn || !links) return;

  let scrim = document.querySelector('.nav-scrim');
  if (!scrim) {
    scrim = document.createElement('div');
    scrim.className = 'nav-scrim';
    document.body.appendChild(scrim);
  }

  function closeMenu() {
    links.classList.remove('open');
    btn.classList.remove('active');
    scrim.classList.remove('show');
    btn.setAttribute('aria-expanded', 'false');
  }
  function openMenu() {
    links.classList.add('open');
    btn.classList.add('active');
    scrim.classList.add('show');
    btn.setAttribute('aria-expanded', 'true');
  }

  btn.addEventListener('click', () => {
    links.classList.contains('open') ? closeMenu() : openMenu();
  });
  scrim.addEventListener('click', closeMenu);
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
}
/* ── Active nav link (works for both old nav and new panel) ── */
function initActiveNav() {
  let page = location.pathname.split('/').pop();
  if (!page) page = 'index.html';
  const articlePages = [
    'infinite-banking-concept.html',
    'tax-deductions-self-employed.html',
    'daca-2026-renewal-guide.html',
    'term-vs-whole-life-ibc.html',
    'itin-guide-florida.html',
    'haitian-diaspora-wealth-building.html',
    'llc-formation-florida-guide.html',
    'health-insurance-open-enrollment-florida.html',
    'choosing-a-trustworthy-financial-advisor.html',
    'building-an-emergency-fund.html',
    'naturalization-process-guide.html',
    'how-much-life-insurance-do-i-need.html',
    'trump-account.html',
  ];
  if (articlePages.includes(page)) page = 'blog.html';
  // Old nav
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
  // New side panel nav
  const panel = document.getElementById('nav-panel');
  if (panel) {
    panel.querySelectorAll('.nav-panel-link').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === page);
    });
  }
}
/* ── Scroll reveal ── */
function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(t => obs.observe(t));
}
/* ── Back to top button ── */
function initBackToTop() {
  if (document.querySelector('.back-to-top')) return;
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 5l-7 7 1.41 1.41L11 8.83V19h2V8.83l4.59 4.58L19 12z"/></svg>';
  document.body.appendChild(btn);
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  });
}
/* ── Footer year ── */
function initFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}
/* ── Load AI Chatbot widget ── */
/* Replaces Brevo live chat — answers visitors automatically, day or night,   */
/* and hands off to Miguelson directly when needed.                          */
function loadChatbot() {
  if (document.querySelector('script[src="/chatbot-widget.js"]')) return; // avoid loading twice
  const s = document.createElement('script');
  s.src = '/chatbot-widget.js';
  s.defer = true;
  document.body.appendChild(s);
}

/* ============================================================
   MODERN INTERACTION LAYER — added by Claude, July 2026
   Page transitions, parallax on hero photos, a real quick-quote
   modal wired to /api/intake, and a generic form-validation
   enhancer. All of this is additive — nothing above was changed
   in a way that removes existing behavior.
   ============================================================ */

/* ── Page transitions ──
   Fades to navy, then navigates, on same-site link clicks. Skips
   anchors, new tabs, mailto/tel, and external links. */
function initPageTransitions() {
  let fade = document.querySelector('.page-fade');
  if (!fade) {
    fade = document.createElement('div');
    fade.className = 'page-fade';
    document.body.appendChild(fade);
  }

  document.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto:') || href.startsWith('tel:') ||
        a.target === '_blank' || a.hasAttribute('download')) return;
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let cmd/ctrl-click open new tab normally
      e.preventDefault();
      fade.classList.add('active');
      setTimeout(() => { window.location.href = href; }, 300);
    });
  });
}

/* ── Subtle parallax on hero photo backgrounds ──
   Shifts background-position slightly as the hero scrolls past,
   using background-position (not background-attachment:fixed,
   which is unreliable on iOS Safari — Migoo's primary device). */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const els = document.querySelectorAll('.page-hero.has-photo, .article-hero');
  if (!els.length) return;
  let ticking = false;
  function update() {
    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const shift = Math.max(-16, Math.min(16, rect.top * 0.06));
      el.style.backgroundPositionY = (50 + shift) + '%';
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}

/* ── Quick Quote modal ──
   Floating gold FAB on every page. Submits straight to the real
   /api/intake Worker using the exact field contract it expects
   (see functions/api/intake.js): first_name, email, service, state,
   and consent are required; company_website is the honeypot. */
function initQuickQuoteModal() {
  if (document.querySelector('.quick-quote-fab')) return;

  const fab = document.createElement('div');
  fab.className = 'quick-quote-fab';
  fab.setAttribute('role', 'button');
  fab.setAttribute('tabindex', '0');
  fab.innerHTML = '<span data-en>⚡ Quick Quote</span><span data-ht>⚡ Estimasyon Rapid</span>';
  document.body.appendChild(fab);

  const scrim = document.createElement('div');
  scrim.className = 'modal-scrim';
  scrim.innerHTML = `
    <div class="modal-box">
      <div class="modal-close" aria-label="Close">&times;</div>
      <div class="eyebrow" data-en>Quick Quote</div>
      <div class="eyebrow" data-ht>Estimasyon Rapid</div>
      <h3 data-en>Tell us what you need</h3>
      <h3 data-ht>Di nou kisa ou bezwen</h3>
      <p style="font-size:.88rem;margin:8px 0 20px 0" data-en>We'll follow up within one business day.</p>
      <p style="font-size:.88rem;margin:8px 0 20px 0" data-ht>Nou va reponn ou nan yon jou ouvrab.</p>
      <form data-quick-quote novalidate>
        <input type="text" name="company_website" autocomplete="off" tabindex="-1"
               style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;" aria-hidden="true">
        <div class="form-row">
          <div class="form-group">
            <label data-en>First name</label><label data-ht>Non</label>
            <input type="text" name="first_name" required>
            <div class="form-error-msg" data-en>Required</div><div class="form-error-msg" data-ht>Obligatwa</div>
          </div>
          <div class="form-group">
            <label data-en>Last name</label><label data-ht>Siyati</label>
            <input type="text" name="last_name">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label data-en>Email</label><label data-ht>Imèl</label>
            <input type="email" name="email" required>
            <div class="form-error-msg" data-en>Valid email required</div><div class="form-error-msg" data-ht>Imèl valab obligatwa</div>
          </div>
          <div class="form-group">
            <label data-en>Phone</label><label data-ht>Telefòn</label>
            <input type="tel" name="phone">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label data-en>Service</label><label data-ht>Sèvis</label>
            <select name="service" required>
              <option value="life-insurance" data-en>Life Insurance</option>
              <option value="life-insurance" data-ht>Asirans Lavi</option>
              <option value="health-insurance" data-en>Health Insurance</option>
              <option value="pc-insurance" data-en>Property &amp; Casualty</option>
              <option value="tax" data-en selected>Tax Preparation</option>
              <option value="immigration" data-en>Immigration Forms</option>
              <option value="business" data-en>Business Filing</option>
              <option value="ibc" data-en>Infinite Banking</option>
              <option value="other" data-en>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label data-en>State</label><label data-ht>Eta</label>
            <input type="text" name="state" maxlength="2" placeholder="FL" style="text-transform:uppercase" required>
            <div class="form-error-msg" data-en>2-letter state</div>
          </div>
        </div>
        <div class="form-group">
          <label data-en>Message (optional)</label><label data-ht>Mesaj (opsyonèl)</label>
          <textarea name="message" rows="3"></textarea>
        </div>
        <div class="form-group" style="display:flex;align-items:flex-start;gap:8px;">
          <input type="checkbox" name="consent" id="qq-consent" required style="width:auto;margin-top:4px;">
          <label for="qq-consent" style="font-weight:400;font-size:.82rem" data-en>I agree to be contacted by ME Shield Financial Services about my request.</label>
          <label for="qq-consent" style="font-weight:400;font-size:.82rem" data-ht>Mwen dakò pou ME Shield Financial Services kontakte m sou demann sa a.</label>
        </div>
        <button type="submit" class="btn btn-gold" style="width:100%;margin-top:8px;">
          <span data-en>Send Request</span><span data-ht>Voye Demann</span>
        </button>
        <div class="alert-success" data-qq-success>
          <span data-en>Thank you — Migoo will reach out within one business day.</span>
          <span data-ht>Mèsi — Migoo va kontakte w nan yon jou ouvrab.</span>
        </div>
      </form>
    </div>`;
  document.body.appendChild(scrim);

  function openModal() { scrim.classList.add('open'); }
  function closeModal() { scrim.classList.remove('open'); }

  fab.addEventListener('click', openModal);
  fab.addEventListener('keydown', (e) => { if (e.key === 'Enter') openModal(); });
  scrim.addEventListener('click', (e) => { if (e.target === scrim) closeModal(); });
  scrim.querySelector('.modal-close').addEventListener('click', closeModal);
  document.querySelectorAll('[data-modal-open="quick-quote"]').forEach((el) => {
    el.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
  });

  const form = scrim.querySelector('[data-quick-quote]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    let valid = true;
    form.querySelectorAll('.form-group').forEach((fg) => fg.classList.remove('has-error'));
    ['first_name', 'email', 'service', 'state'].forEach((key) => {
      const val = (fd.get(key) || '').toString().trim();
      if (!val) { valid = false; const fg = form.querySelector(`[name="${key}"]`)?.closest('.form-group'); fg && fg.classList.add('has-error'); }
    });
    if (!fd.get('consent')) valid = false;
    if (!valid) return;

    const payload = {
      first_name: fd.get('first_name'),
      last_name: fd.get('last_name') || '',
      email: fd.get('email'),
      phone: fd.get('phone') || '',
      state: (fd.get('state') || '').toString().toUpperCase(),
      service: fd.get('service'),
      message: fd.get('message') || '',
      language: document.body.classList.contains('lang-ht') ? 'kreyol' : 'english',
      consent: true,
      company_website: fd.get('company_website') || ''
    };

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok !== false) {
        form.reset();
        form.style.display = 'none';
        const success = form.querySelector('[data-qq-success]');
        if (success) success.style.display = 'flex';
        setTimeout(closeModal, 3200);
      } else {
        btn.disabled = false;
        alert('Something went wrong — please call (407) 267-2652 or try again.');
      }
    } catch (err) {
      btn.disabled = false;
      alert('Network error — please call (407) 267-2652 or try again.');
    }
  });
}

/* ── Generic interactive-form feedback ──
   Adds live "required" checking to any .form-group input on the page
   (contact.html, book.html, etc.) without needing per-page markup
   changes — it just watches whatever .form-group fields already exist. */
function initFormEnhancer() {
  document.querySelectorAll('form').forEach((form) => {
    if (form.hasAttribute('data-quick-quote')) return; // handled separately above
    form.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach((field) => {
      field.addEventListener('blur', () => {
        const fg = field.closest('.form-group');
        if (!fg) return;
        if (field.hasAttribute('required') && !field.value.trim()) {
          fg.classList.add('has-error');
          fg.classList.remove('has-success');
        } else if (field.value.trim()) {
          fg.classList.remove('has-error');
          fg.classList.add('has-success');
        }
      });
    });
  });
}

/* ── Tabs / switchable sections engine ──
   Generic: initializes any block marked up as:
   <div class="tabs-nav"><button data-tab="a" class="active">A</button>...</div>
   <div class="tab-panel active" data-tab-panel="a">...</div>
   Currently a no-op until a page adds this markup — ready to use. */
function initTabs() {
  document.querySelectorAll('.tabs-nav').forEach((nav) => {
    const group = nav.closest('[data-tabs]') || nav.parentElement;
    if (!group) return;
    nav.querySelectorAll('button[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        nav.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        group.querySelectorAll('.tab-panel').forEach((p) => {
          p.classList.toggle('active', p.getAttribute('data-tab-panel') === btn.dataset.tab);
        });
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLang();
  initHamburger();
  initActiveNav();
  initReveal();
  initBackToTop();
  initFooterYear();
  loadChatbot();
  initPageTransitions();
  initParallax();
  initQuickQuoteModal();
  initFormEnhancer();
  initTabs();
});
