/* shared.js — nav, language switcher, scroll reveal, footer */
/* ── Shared site header ──
   Keep one canonical header for every page. Older pages may still contain a
   local copy; replace it at runtime so navigation, promos, language controls,
   and the mobile menu stay identical site-wide. */
function initSharedHeader() {
  document.querySelectorAll('body > .utility-bar, body > nav.navbar, body > .service-global-header')
    .forEach((element) => element.remove());

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="utility-bar">
      <div class="container utility-bar-inner">
        <div class="utility-left">
          <span><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style="vertical-align:-2px;display:inline-block;margin-right:2px;" aria-hidden="true"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z"/></svg><a href="tel:+14072672652">(407) 267-2652</a></span>
          <span data-en>Mon–Fri 9am–6pm · Sat by appointment</span>
          <span data-ht>Lendi–Vandredi 9am–6pm · Samdi sou randevou</span>
        </div>
        <div class="utility-promos">
          <span class="utility-promo" data-en>FREE CONSULTATION<a href="/book">Book Now</a></span>
          <span class="utility-promo" data-ht>KONSILTASYON GRATIS<a href="/book">Rezève</a></span>
          <span class="utility-promo" data-en>TAX SEASON READY<a href="/tax-preparation">Get Started</a></span>
          <span class="utility-promo" data-ht>SEZON TAKS PARE<a href="/tax-preparation">Kòmanse</a></span>
        </div>
      </div>
    </div>
    <nav class="navbar" aria-label="Primary navigation">
      <div class="container nav-inner">
        <a href="/" class="nav-logo">
          <img src="/logo.png" alt="ME Shield Financial Services logo" class="nav-logo-icon" style="height:42px;width:auto;object-fit:contain;background:none;border-radius:0;"/>
          <div>
            <div class="nav-logo-text">ME Shield Financial</div>
            <div class="nav-logo-sub">Services</div>
          </div>
        </a>
        <ul class="nav-links" id="nav-links">
          <li><a href="/"><span data-en>Home</span><span data-ht>Akèy</span></a></li>
          <li><a href="/about"><span data-en>About</span><span data-ht>Sou nou</span></a></li>
          <li class="nav-dropdown">
            <a href="/services"><span data-en>Services</span><span data-ht>Sèvis</span></a>
            <ul class="nav-dropdown-menu">
              <li><a href="/insurance"><span data-en>Insurance</span><span data-ht>Asirans</span></a></li>
              <li><a href="/tax-preparation"><span data-en>Tax Preparation</span><span data-ht>Preparasyon Taks</span></a></li>
              <li><a href="/immigration-forms"><span data-en>Immigration Forms Filing</span><span data-ht>Ranpli Fòmilè Imigrasyon</span></a></li>
              <li><a href="/business-filing"><span data-en>Business Filing</span><span data-ht>Depo Biznis</span></a></li>
              <li><a href="/infinite-banking"><span data-en>Infinite Banking</span><span data-ht>Bank Enfini</span></a></li>
            </ul>
          </li>
          <li><a href="/blog"><span data-en>Blog</span><span data-ht>Blòg</span></a></li>
          <li><a href="/faq">FAQ</a></li>
          <li><a href="/contact"><span data-en>Contact</span><span data-ht>Kontakte</span></a></li>
        </ul>
        <div class="nav-right">
          <div class="lang-toggle" aria-label="Language">
            <button class="lang-btn active" data-lang="en" type="button" onclick="setSiteLang('en')">EN</button>
            <button class="lang-btn" data-lang="ht" type="button" onclick="setSiteLang('ht')">HT</button>
          </div>
          <a href="/book" class="btn btn-gold" style="padding:9px 20px;font-size:.85rem;">
            <span data-en>Book Free Consult</span>
            <span data-ht>Rezève Konsiltasyon</span>
          </a>
          <button class="hamburger" id="hamburger" type="button" aria-label="Open navigation menu" aria-expanded="false"></button>
        </div>
      </div>
    </nav>`;

  const fragment = document.createDocumentFragment();
  while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);
  document.body.prepend(fragment);
}

/* ── Accessibility foundations ── */
function initAccessibility() {
  let main = document.querySelector('main');
  if (!main) {
    main = document.createElement('main');
    main.id = 'main-content';
    const movable = Array.from(document.body.children).filter((element) =>
      !element.matches('.utility-bar, nav.navbar, footer, script, .nav-scrim')
    );
    if (movable.length) {
      movable[0].before(main);
      movable.forEach((element) => main.appendChild(element));
    }
  } else if (!main.id) {
    main.id = 'main-content';
  }

  if (main && !document.querySelector('.skip-link')) {
    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#main-content';
    skip.innerHTML = '<span data-en>Skip to main content</span><span data-ht>Ale dirèk nan kontni prensipal</span>';
    document.body.prepend(skip);
  }

  let generatedId = 0;
  document.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach((field) => {
    if (!field.id) field.id = `accessible-field-${++generatedId}`;
    const hasName = field.getAttribute('aria-label') || field.getAttribute('aria-labelledby') ||
      Array.from(field.labels || []).some((label) => label.textContent.trim());
    if (hasName) return;

    const group = field.closest('.form-group, .fg');
    const labels = group ? Array.from(group.querySelectorAll(':scope > label')) : [];
    if (labels.length) {
      labels.forEach((label) => label.setAttribute('for', field.id));
      return;
    }

    const appointment = field.closest('.appt-type');
    const appointmentName = appointment && appointment.querySelector('.appt-type-title, strong');
    if (appointmentName) field.setAttribute('aria-label', appointmentName.textContent.trim());
  });

  document.querySelectorAll('.star-row input[type="radio"]').forEach((radio) => {
    radio.setAttribute('aria-label', `${radio.value} out of 5 stars`);
  });
}

/* ── SEO / clean URL normalization ──
   Cloudflare redirects legacy *.html URLs to extensionless URLs. Keep the
   DOM aligned with the sitemap so crawlers and visitors link directly to the
   canonical destination instead of discovering a redirect first. */
function initCleanUrls() {
  const cleanPath = (pathname) => {
    if (pathname === '/index.html') return '/';
    return pathname.replace(/\.html$/, '');
  };

  document.querySelectorAll('a[href]').forEach((a) => {
    const raw = a.getAttribute('href');
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') ||
        raw.startsWith('tel:') || raw.startsWith('javascript:')) return;
    try {
      const url = new URL(raw, window.location.href);
      if (url.origin !== window.location.origin || !/\.html$/.test(url.pathname)) return;
      url.pathname = cleanPath(url.pathname);
      a.setAttribute('href', url.pathname + url.search + url.hash);
    } catch (_) {
      // Ignore malformed/non-navigation href values.
    }
  });

  if (!document.querySelector('link[rel="canonical"]')) {
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = window.location.origin + cleanPath(window.location.pathname);
    document.head.appendChild(canonical);
  }
}

/* ── Language Switcher ── */
function initLang() {
  const saved = localStorage.getItem('me-shield-lang') || 'en';
  setSiteLang(saved, false);
}
function setSiteLang(lang, save = true) {
  document.body.classList.remove('lang-en', 'lang-ht');
  document.body.classList.add('lang-' + lang);
  document.documentElement.lang = lang === 'ht' ? 'ht' : 'en';
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  const articleTranslations = document.querySelectorAll('.article-content.lang-en, .article-content.lang-ht');
  if (articleTranslations.length) {
    articleTranslations.forEach((section) => {
      section.classList.toggle('visible', section.classList.contains('lang-' + lang));
    });
    document.querySelectorAll('.article-body .lang-btn').forEach((button) => {
      button.classList.toggle('active', button.id === 'btn-' + lang);
    });
  }
  if (save) localStorage.setItem('me-shield-lang', lang);
}
/* ── Hamburger / off-canvas mobile menu ── */
function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;

  btn.innerHTML = '<span data-en>MENU</span><span data-ht>MENI</span>';
  btn.setAttribute('aria-label', 'Open navigation menu');
  if (!links.querySelector('.mobile-book-item')) {
    const item = document.createElement('li');
    item.className = 'mobile-book-item';
    item.innerHTML = '<a class="mobile-book-link" href="/book"><span data-en>Book Free Consult</span><span data-ht>Rezève Konsiltasyon Gratis</span></a>';
    links.insertBefore(item, links.firstChild);
  }

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
    document.body.classList.remove('menu-open');
    btn.setAttribute('aria-label', 'Open navigation menu');
  }
  function openMenu() {
    links.classList.add('open');
    btn.classList.add('active');
    scrim.classList.add('show');
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    btn.setAttribute('aria-label', 'Close navigation menu');
  }

  btn.addEventListener('click', () => {
    links.classList.contains('open') ? closeMenu() : openMenu();
  });
  scrim.addEventListener('click', closeMenu);
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
}
/* ── Active nav link (works for both old nav and new panel) ── */
function initActiveNav() {
  let page = location.pathname.split('/').pop();
  if (!page) page = 'index';
  const articlePages = [
    'infinite-banking-concept',
    'tax-deductions-self-employed',
    'daca-2026-renewal-guide',
    'term-vs-whole-life-ibc',
    'itin-guide-florida',
    'haitian-diaspora-wealth-building',
    'llc-formation-florida-guide',
    'health-insurance-open-enrollment-florida',
    'choosing-a-trustworthy-financial-advisor',
    'building-an-emergency-fund',
    'naturalization-process-guide',
    'how-much-life-insurance-do-i-need',
    'trump-account',
  ];
  if (articlePages.includes(page)) page = 'blog';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const hrefPage = (a.getAttribute('href') || '').replace(/^\//, '').replace(/\.html$/, '') || 'index';
    if (hrefPage === page) a.classList.add('active');
  });
  const panel = document.getElementById('nav-panel');
  if (panel) {
    panel.querySelectorAll('.nav-panel-link').forEach(a => {
      const hrefPage = (a.getAttribute('href') || '').replace(/^\//, '').replace(/\.html$/, '') || 'index';
      a.classList.toggle('active', hrefPage === page);
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
function initFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}
function initLegalLinks() {
  document.querySelectorAll('.footer-bottom').forEach(footer => {
    if (footer.querySelector('.footer-legal')) return;
    const links = document.createElement('span');
    links.className = 'footer-legal';
    links.innerHTML = '<a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/accessibility">Accessibility</a>';
    footer.appendChild(links);
  });
}
function loadChatbot() {
  if (document.querySelector('script[src$="chatbot-widget.js"]')) return;
  const s = document.createElement('script');
  s.src = '/chatbot-widget.js';
  s.defer = true;
  document.body.appendChild(s);
}
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
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      fade.classList.add('active');
      setTimeout(() => { window.location.href = href; }, 300);
    });
  });
}
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
function initPWA() {
  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);
  }
  if (!document.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#0B1D3A';
    document.head.appendChild(meta);
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
  let installPrompt;
  const install = document.createElement('button');
  install.className = 'pwa-install';
  install.hidden = true;
  install.innerHTML = '<span data-en>Install ME Shield</span><span data-ht>Enstale ME Shield</span>';
  document.body.appendChild(install);
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    install.hidden = false;
  });
  install.addEventListener('click', async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      install.hidden = true;
      return;
    }
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      alert(document.body.classList.contains('lang-ht') ? 'Sou iPhone: peze Share, epi chwazi Add to Home Screen.' : 'On iPhone: tap Share, then choose Add to Home Screen.');
    }
  });
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (ios && !standalone) install.hidden = false;
}

document.addEventListener('DOMContentLoaded', () => {
  initSharedHeader();
  initAccessibility();
  initCleanUrls();
  initLang();
  initHamburger();
  initCleanUrls(); // normalize links injected by the mobile menu before nav matching
  initActiveNav();
  initReveal();
  initBackToTop();
  initFooterYear();
  initLegalLinks();
  initCleanUrls(); // normalize legal links injected above
  loadChatbot();
  initParallax();
  initFormEnhancer();
  initTabs();
  initPWA();
});
