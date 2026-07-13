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
/* ── Hamburger (legacy — kept for backward compatibility) ── */
function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  // New side-panel pages don't use #nav-links — skip
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    links.classList.toggle('open');
    btn.setAttribute('aria-expanded', links.classList.contains('open'));
  });
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
document.addEventListener('DOMContentLoaded', () => {
  initLang();
  initHamburger();
  initActiveNav();
  initReveal();
  initBackToTop();
  initFooterYear();
});
