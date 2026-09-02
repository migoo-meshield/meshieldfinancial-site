/* shared.js — nav, language switcher, scroll reveal, footer */
/* ── Shared site header ──
   Keep one canonical header for every page. Older pages may still contain a
   local copy; replace it at runtime so navigation, promos, language controls,
   and the mobile menu stay identical site-wide. */
function initSharedHeader() {
  document.querySelectorAll('body > .site-header-shell, body > .site-header-spacer, body > .utility-bar, body > nav.navbar, body > .service-global-header')
    .forEach((element) => element.remove());

  if (!document.getElementById('shared-header-runtime-styles')) {
    const styles = document.createElement('style');
    styles.id = 'shared-header-runtime-styles';
    styles.textContent = `
      html,body{max-width:100%;overflow-x:hidden;}
      .site-header-shell{position:fixed;top:0;left:0;right:0;z-index:1300;width:100%;}
      .site-header-shell .navbar{position:relative!important;top:auto!important;width:100%;}
      .site-header-spacer{width:100%;height:var(--site-header-height,110px);}
      .site-header-shell .nav-intake-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;padding:9px 18px!important;border:1px solid #c9a84c!important;border-radius:999px!important;background:transparent!important;color:#c9a84c!important;font-size:.82rem!important;font-weight:800!important;text-decoration:none!important;white-space:nowrap!important;}
      .site-header-shell .nav-intake-btn:hover{background:#c9a84c!important;color:#0b1d3a!important;}
      .pwa-install{position:fixed!important;left:18px!important;bottom:18px!important;z-index:1280!important;border:1px solid rgba(201,168,76,.8)!important;background:#0b1d3a!important;color:#c9a84c!important;border-radius:999px!important;padding:11px 16px!important;box-shadow:0 12px 30px rgba(11,29,58,.28)!important;font:700 .78rem Inter,Arial,sans-serif!important;cursor:pointer!important;}
      .shared-footer{background:#0b1d3a!important;color:rgba(255,255,255,.68)!important;padding:58px 0 28px!important;border-top:1px solid rgba(255,255,255,.08)!important;font-family:Inter,Arial,sans-serif!important;font-size:16px!important;line-height:1.6!important;}
      .shared-footer *{box-sizing:border-box!important;}
      .shared-footer .shared-footer-inner{width:min(1120px,calc(100% - 40px))!important;margin:0 auto!important;}
      .shared-footer .shared-footer-grid{display:grid!important;grid-template-columns:1.35fr .8fr .8fr .8fr!important;gap:46px!important;align-items:start!important;}
      .shared-footer .shared-footer-brand{display:flex!important;align-items:center!important;gap:12px!important;margin-bottom:18px!important;}
      .shared-footer .shared-footer-brand img{width:auto!important;height:48px!important;object-fit:contain!important;}
      .shared-footer .shared-footer-name{color:#fff!important;font-family:Georgia,'Times New Roman',serif!important;font-size:1rem!important;font-weight:700!important;line-height:1.25!important;}
      .shared-footer .shared-footer-dba{color:#c9a84c!important;font-size:.68rem!important;letter-spacing:.09em!important;text-transform:uppercase!important;}
      .shared-footer h4{color:#fff!important;font-family:Georgia,'Times New Roman',serif!important;font-size:1rem!important;line-height:1.25!important;margin:0 0 17px!important;}
      .shared-footer p{color:rgba(255,255,255,.62)!important;font-size:.82rem!important;line-height:1.7!important;margin:0 0 12px!important;}
      .shared-footer ul{display:flex!important;flex-direction:column!important;gap:9px!important;list-style:none!important;margin:0!important;padding:0!important;}
      .shared-footer li{color:rgba(255,255,255,.62)!important;font-size:.8rem!important;line-height:1.5!important;list-style:none!important;margin:0!important;padding:0!important;}
      .shared-footer a{color:rgba(255,255,255,.68)!important;text-decoration:none!important;font-size:inherit!important;}
      .shared-footer a:hover{color:#c9a84c!important;}
      .shared-footer .shared-footer-contact a{color:#c9a84c!important;}
      .shared-footer .shared-footer-disc{margin-top:34px!important;padding-top:22px!important;border-top:1px solid rgba(255,255,255,.1)!important;color:rgba(255,255,255,.42)!important;font-size:.68rem!important;line-height:1.65!important;}
      .shared-footer .shared-footer-bottom{display:flex!important;justify-content:space-between!important;gap:18px!important;margin-top:20px!important;padding-top:18px!important;border-top:1px solid rgba(255,255,255,.1)!important;color:rgba(255,255,255,.55)!important;font-size:.72rem!important;}
      .shared-footer .shared-footer-legal a{color:#c9a84c!important;}
      .skip-link{position:fixed;top:8px;left:8px;z-index:1000001;padding:10px 14px;border-radius:8px;background:#fff;color:#081a35;font-weight:700;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,.2);transform:translateY(-180%);transition:transform .2s ease;}
      .skip-link:focus,.skip-link:focus-visible{transform:translateY(0);}
      @media(max-width:900px){
        .site-header-shell .nav-right>.btn-gold,.site-header-shell .nav-right>.nav-intake-btn{display:none!important;}
        .site-header-shell .nav-inner{gap:8px;}
        .site-header-shell .nav-logo{min-width:0;gap:8px;overflow:hidden;}
        .site-header-shell .nav-logo-text{font-size:.94rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .site-header-shell .nav-logo-sub{display:none;}
        .site-header-shell .nav-right{gap:8px;flex-shrink:0;}
        .site-header-shell .hamburger{display:flex;flex-shrink:0;position:relative;z-index:1202;}
        .site-header-shell .nav-links{z-index:1200;}
        .nav-scrim{z-index:1199;}
      }
      @media(max-width:700px){
        .site-header-shell .utility-bar{display:none!important;}
        .shared-footer .shared-footer-grid{grid-template-columns:1fr 1fr!important;gap:32px 24px!important;}
      }
      @media(max-width:430px){
        .site-header-shell .nav-logo-text{font-size:.82rem;}
        .site-header-shell .nav-logo-icon{height:36px!important;max-width:44px;}
        .site-header-shell .lang-btn{padding:5px 7px;}
        .shared-footer .shared-footer-grid{grid-template-columns:1fr!important;}
        .shared-footer .shared-footer-bottom{flex-direction:column!important;text-align:center!important;}
      }
    `;
    document.head.appendChild(styles);
  }

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <header class="site-header-shell">
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
          <a href="https://clientportal.meshieldfinancial.com/public-intake" class="btn btn-outline nav-intake-btn">
            <span data-en>Client Form</span>
            <span data-ht>Fòm Kliyan</span>
          </a>
          <a href="/book" class="btn btn-gold" style="padding:9px 20px;font-size:.85rem;">
            <span data-en>Book Free Consult</span>
            <span data-ht>Rezève Konsiltasyon</span>
          </a>
          <button class="hamburger" id="hamburger" type="button" aria-label="Open navigation menu" aria-expanded="false"></button>
        </div>
      </div>
    </nav>
    </header>
    <div class="site-header-spacer" aria-hidden="true"></div>`;

  const fragment = document.createDocumentFragment();
  while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);
  document.body.prepend(fragment);

  const header = document.querySelector('.site-header-shell');
  const spacer = document.querySelector('.site-header-spacer');
  const syncHeaderHeight = () => {
    if (header && spacer) spacer.style.height = `${Math.ceil(header.getBoundingClientRect().height)}px`;
  };
  syncHeaderHeight();
  window.addEventListener('load', syncHeaderHeight, { once: true });
  window.addEventListener('resize', syncHeaderHeight);
}

/* ── Accessibility foundations ── */
function initAccessibility() {
  let main = document.querySelector('main');
  if (!main) {
    main = document.createElement('main');
    main.id = 'main-content';
    const movable = Array.from(document.body.children).filter((element) =>
      !element.matches('.site-header-shell, .site-header-spacer, .utility-bar, nav.navbar, footer, script, .nav-scrim')
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

  /* Footer column labels are visual labels, not subsections of page content.
     Use neutral elements so they do not create skipped heading levels. */
  document.querySelectorAll('footer h4').forEach((heading) => {
    const label = document.createElement('div');
    label.className = `${heading.className} footer-heading`.trim();
    Array.from(heading.attributes).forEach((attribute) => {
      if (attribute.name !== 'class') label.setAttribute(attribute.name, attribute.value);
    });
    label.innerHTML = heading.innerHTML;
    heading.replaceWith(label);
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
  if (!links.querySelector('.mobile-intake-item')) {
    const intakeItem = document.createElement('li');
    intakeItem.className = 'mobile-book-item mobile-intake-item';
    intakeItem.innerHTML = '<a class="mobile-book-link mobile-intake-link" href="https://clientportal.meshieldfinancial.com/public-intake"><span data-en>Complete Client Form</span><span data-ht>Ranpli Fòm Kliyan</span></a>';
    links.insertBefore(intakeItem, links.firstChild);
  }

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
function initSharedFooter() {
  const old = document.querySelector('body > footer');
  if (!old) return;
  const footer = document.createElement('footer');
  footer.className = 'shared-footer';
  footer.innerHTML = `<div class="shared-footer-inner"><div class="shared-footer-grid">
    <div><div class="shared-footer-brand"><img src="/logo.png" alt="ME Shield Financial Services logo"><div><div class="shared-footer-name">ME Shield Financial Services</div><div class="shared-footer-dba">A DBA of ME Shield Group LLC</div></div></div><p data-en>Insurance (FL, MA, NJ), tax, immigration forms, business filing and financial education—in English and Haitian Creole.</p><p data-ht>Asirans (FL, MA, NJ), taks, fòm imigrasyon, depo biznis ak edikasyon finansyè—an Anglè ak Kreyòl.</p><p class="shared-footer-contact"><a href="tel:+14072672652">(407) 267-2652</a><br><a href="mailto:info@meshieldfinancial.com">info@meshieldfinancial.com</a></p></div>
    <div><h4 data-en>Services</h4><h4 data-ht>Sèvis</h4><ul><li><a href="/insurance"><span data-en>Insurance</span><span data-ht>Asirans</span></a></li><li><a href="/tax-preparation"><span data-en>Tax Preparation</span><span data-ht>Preparasyon Taks</span></a></li><li><a href="/immigration-forms"><span data-en>Immigration Forms</span><span data-ht>Fòm Imigrasyon</span></a></li><li><a href="/business-filing"><span data-en>Business Filing</span><span data-ht>Depo Biznis</span></a></li><li><a href="/infinite-banking"><span data-en>Infinite Banking</span><span data-ht>Bank Enfini</span></a></li></ul></div>
    <div><h4 data-en>Company</h4><h4 data-ht>Konpayi</h4><ul><li><a href="/about"><span data-en>About</span><span data-ht>Sou nou</span></a></li><li><a href="/contact"><span data-en>Contact</span><span data-ht>Kontakte</span></a></li><li><a href="/book"><span data-en>Free Consultation</span><span data-ht>Konsiltasyon Gratis</span></a></li><li><a href="https://clientportal.meshieldfinancial.com/public-intake"><span data-en>Client Form</span><span data-ht>Fòm Kliyan</span></a></li></ul></div>
    <div><h4 data-en>Contact</h4><h4 data-ht>Kontakte</h4><ul><li>Apopka, FL 32712</li><li data-en>Mon–Fri: 9am–6pm</li><li data-ht>Lendi–Vandredi: 9am–6pm</li><li><a href="https://www.facebook.com/profile.php?id=61590568017562">Facebook</a> · <a href="https://www.instagram.com/meshieldfinancial/">Instagram</a></li></ul></div>
  </div><div class="shared-footer-disc"><span data-en>ME Shield Financial Services is a DBA of ME Shield Group LLC. Insurance services are offered by Miguelson Etienne, Licensed Independent Insurance Agent, affiliated with JWANAIX GROUP. Tax services are provided by an IRS PTIN-registered preparer. Immigration form preparation is not legal advice.</span><span data-ht>ME Shield Financial Services se yon DBA pou ME Shield Group LLC. Miguelson Etienne bay sèvis asirans kòm Ajan Asirans Endepandan Lisansye ki afilye ak JWANAIX GROUP. Preparasyon fòm imigrasyon pa konsèy legal.</span></div><div class="shared-footer-bottom"><span>© <span id="year"></span> ME Shield Financial Services</span><span class="shared-footer-legal"><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/accessibility">Accessibility</a></span></div></div>`;
  old.replaceWith(footer);
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

/* ── Article trust signals + page structured data ── */
function initTrustAndStructuredData() {
  const path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  const articles = new Set([
    '/2026-standard-deduction-increase', '/50-30-20-budget-rule',
    '/building-an-emergency-fund', '/business-liability-insurance-florida',
    '/choosing-a-trustworthy-financial-advisor', '/daca-2026-renewal-guide',
    '/haitian-diaspora-wealth-building', '/haitian-household-money-habits',
    '/health-insurance-open-enrollment-florida', '/homeowners-renters-insurance-florida-guide',
    '/how-much-life-insurance-do-i-need', '/hurricane-season-financial-preparedness',
    '/hurricane-season-home-insurance-checklist', '/immigration-forms-checklist',
    '/infinite-banking-concept', '/infinite-banking-concept-explained',
    '/itin-guide-florida', '/llc-formation-florida-guide',
    '/llc-registration-mistakes-florida', '/naturalization-process-guide',
    '/registered-agent-florida-llc', '/tax-deductions-self-employed',
    '/tax-prep-checklist', '/term-vs-whole-life-ibc', '/tps-haiti-2026-update',
    '/trump-account', '/umbrella-flood-insurance-florida',
    '/uscis-processing-times-august-2026', '/whole-life-vs-universal-life'
  ]);
  const services = new Map([
    ['/insurance', 'Insurance services'],
    ['/tax-preparation', 'Tax return preparation'],
    ['/immigration-forms', 'Immigration form and document preparation assistance'],
    ['/business-filing', 'Business document preparation and filing assistance'],
    ['/infinite-banking', 'Whole-life insurance education and consultation']
  ]);
  const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.origin + path;
  const description = document.querySelector('meta[name="description"]')?.content || '';
  const title = document.querySelector('h1')?.textContent.trim() || document.title.split('—')[0].trim();
  const ogImage = document.querySelector('meta[property="og:image"]')?.content || `${window.location.origin}/logo.png`;
  const hasSchemaType = (type) => Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
    .some((script) => script.textContent.includes(`"@type": "${type}"`) || script.textContent.includes(`"@type":"${type}"`));
  const addSchema = (value, id) => {
    if (document.getElementById(id)) return;
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(value);
    document.head.appendChild(script);
  };

  if (articles.has(path)) {
    if (!document.getElementById('article-trust-runtime-styles')) {
      const styles = document.createElement('style');
      styles.id = 'article-trust-runtime-styles';
      styles.textContent = `
        .article-trust-card{max-width:760px;margin:36px auto 0;padding:20px 22px;border:1px solid rgba(11,28,58,.12);border-left:4px solid #c9a84c;border-radius:10px;background:#f8f5ee;color:#3f3f52;font-size:.9rem;line-height:1.65}
        .article-trust-card strong{display:block;color:#0b1c3a;font-size:1rem;margin-bottom:4px}
        .article-trust-card a{color:#735b12;font-weight:700;text-decoration:underline;text-underline-offset:2px}
      `;
      document.head.appendChild(styles);
    }
    const body = document.querySelector('.article-body, .article-content, article');
    if (body && !body.querySelector('.article-trust-card')) {
      const card = document.createElement('aside');
      card.className = 'article-trust-card';
      card.setAttribute('aria-label', 'About the author');
      card.innerHTML = `
        <strong><span data-en>About the author</span><span data-ht>Konsènan otè a</span></strong>
        <span data-en><a href="/about">Miguelson Etienne</a> is the founder of ME Shield Financial Services, a Licensed Independent Insurance Agent, and a tax return preparer with an active IRS PTIN. ME Shield provides insurance services, tax preparation, financial education, business filing, and immigration document-preparation assistance. ME Shield is not a law firm, CPA firm, broker-dealer, or registered investment adviser.</span>
        <span data-ht><a href="/about">Miguelson Etienne</a> se fondatè ME Shield Financial Services, yon Ajan Asirans Endepandan Lisansye, ak yon preparatè deklarasyon taks ki gen yon PTIN IRS aktif. ME Shield bay sèvis asirans, preparasyon taks, edikasyon finansye, depo biznis ak asistans pou prepare dokiman imigrasyon. ME Shield pa yon kabinè avoka, kabinè CPA, broker-dealer oswa konseye envestisman anrejistre.</span>
      `;
      const cta = body.querySelector('.article-cta, .cta-box');
      if (cta) cta.before(card); else body.appendChild(card);
    }
    document.querySelectorAll('.author-row .name').forEach((name) => {
      if (name.querySelector('a')) return;
      const link = document.createElement('a');
      link.href = '/about';
      link.textContent = name.textContent.trim();
      link.style.color = 'inherit';
      name.textContent = '';
      name.appendChild(link);
    });
    if (!hasSchemaType('BlogPosting')) {
      addSchema({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BlogPosting', '@id': `${canonical}#article`, headline: title,
            description, url: canonical, mainEntityOfPage: canonical,
            image: ogImage,
            author: {'@type': 'Person', name: 'Miguelson Etienne', url: `${window.location.origin}/about`},
            publisher: {'@type': 'Organization', name: 'ME Shield Financial Services', url: `${window.location.origin}/`, logo: {'@type': 'ImageObject', url: `${window.location.origin}/logo.png`}}
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {'@type': 'ListItem', position: 1, name: 'Home', item: `${window.location.origin}/`},
              {'@type': 'ListItem', position: 2, name: 'Blog', item: `${window.location.origin}/blog`},
              {'@type': 'ListItem', position: 3, name: title, item: canonical}
            ]
          }
        ]
      }, 'generated-article-schema');
    }
  }

  if (services.has(path) && !hasSchemaType('Service')) {
    addSchema({
      '@context': 'https://schema.org', '@type': 'Service',
      '@id': `${canonical}#service`, name: services.get(path), url: canonical,
      description, serviceType: services.get(path),
      provider: {'@type': 'Organization', name: 'ME Shield Financial Services', url: `${window.location.origin}/`, telephone: '+1-407-267-2652'},
      availableLanguage: ['English', 'Haitian Creole']
    }, 'generated-service-schema');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSharedFooter();
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
  initTrustAndStructuredData();
});
