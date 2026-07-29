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
   Page transitions, parallax on hero photos, and a generic
   form-validation enhancer. All of this is additive — nothing
   above was changed in a way that removes existing behavior.
   (A floating Quick Quote button + modal was built here too, but
   removed on request since it duplicated the existing AI chatbot's
   spot and job — the reusable .modal-scrim/.modal-box CSS is still
   in style.css if you want a popup for something else later.)
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

/* ── Generic interactive-form feedback ──
   Adds live "required" checking to any .form-group input on the page
   (contact.html, book.html, etc.) without needing per-page markup
   changes — it just watches whatever .form-group fields already exist. */
function initFormEnhancer() {
  document.querySelectorAll('form').forEach((form) => {
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
  initFormEnhancer();
  initTabs();
});
