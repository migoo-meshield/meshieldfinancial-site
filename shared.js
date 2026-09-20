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
      .shared-footer .shared-footer-disc{margin-top:34px!important;padding-top:22px!important;border-top:1px solid rgba(255,255,255,.1)!important;color:rgba(255,255,255,.72)!important;font-size:.68rem!important;line-height:1.65!important;}
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
          <span data-en>Mon–Sat 9am–6pm</span>
          <span data-ht>Lendi–Samdi 9am–6pm</span>
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
    <div><h4 data-en>Company</h4><h4 data-ht>Konpayi</h4><ul><li><a href="/about"><span data-en>About</span><span data-ht>Sou nou</span></a></li><li><a href="/contact"><span data-en>Contact</span><span data-ht>Kontakte</span></a></li><li><a href="/leave-a-review"><span data-en>Leave a Google Review</span><span data-ht>Kite yon Review sou Google</span></a></li><li><a href="/book"><span data-en>Free Consultation</span><span data-ht>Konsiltasyon Gratis</span></a></li><li><a href="https://clientportal.meshieldfinancial.com/public-intake"><span data-en>Client Form</span><span data-ht>Fòm Kliyan</span></a></li></ul></div>
    <div><h4 data-en>Contact</h4><h4 data-ht>Kontakte</h4><ul><li>Apopka, FL 32712</li><li data-en>Mon–Sat: 9am–6pm</li><li data-ht>Lendi–Samdi: 9am–6pm</li><li style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;list-style:none;"><a href="https://www.facebook.com/profile.php?id=61590568017562" target="_blank" rel="noopener" aria-label="Facebook" title="Facebook" class="social-tile" style="width:30px;height:30px;background:#1877F2;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;flex:0 0 auto;"><svg viewBox="0 0 24 24" width="15" height="15" fill="#fff" aria-hidden="true"><path d="M22.675 0h-21.35C.595 0 0 .595 0 1.326v21.348C0 23.404.595 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.405 24 24 23.404 24 22.674V1.326C24 .595 23.405 0 22.675 0z"/></svg></a><a href="https://www.instagram.com/meshieldfinancial/" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram" class="social-tile" style="width:30px;height:30px;background:#fff;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;flex:0 0 auto;"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><defs><linearGradient id="ig-sh1" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FFC107"/><stop offset=".35" stop-color="#F44336"/><stop offset=".7" stop-color="#9C27B0"/><stop offset="1" stop-color="#3F51B5"/></linearGradient></defs><g fill="url(#ig-sh1)"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></g></svg></a><a href="https://www.tiktok.com/@me.shield.financial.serv" target="_blank" rel="noopener" aria-label="TikTok" title="TikTok" class="social-tile" style="width:30px;height:30px;background:#010101;border:1px solid rgba(255,255,255,.28);border-radius:9px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;flex:0 0 auto;"><svg viewBox="0 0 24 24" width="15" height="15" fill="#fff" aria-hidden="true"><path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/></svg></a><a href="https://www.linkedin.com/company/me-shield-financial-services/" target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn" class="social-tile" style="width:30px;height:30px;background:#0A66C2;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;flex:0 0 auto;"><svg viewBox="0 0 24 24" width="15" height="15" fill="#fff" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a><a href="https://wa.me/14072672652" target="_blank" rel="noopener" aria-label="WhatsApp" title="WhatsApp" class="social-tile" style="width:30px;height:30px;background:#25D366;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;flex:0 0 auto;"><svg viewBox="0 0 24 24" width="15" height="15" fill="#fff" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.149-.149.298-.347.446-.521.149-.174.198-.298.297-.497.099-.198.05-.371-.05-.52-.099-.149-.668-1.612-.916-2.207-.242-.579-.487-.5-.668-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.04 3.12 4.943 4.255 2.902 1.135 2.902.757 3.426.71.524-.05 1.758-.719 2.007-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.66 9.66 0 0 1-4.93-1.355l-.354-.21-3.665.962.978-3.575-.232-.367a9.65 9.65 0 0 1-1.479-5.176c0-5.345 4.35-9.694 9.69-9.694 2.588 0 5.02 1.007 6.85 2.838a9.62 9.62 0 0 1 2.84 6.85c-.003 5.344-4.353 9.694-9.694 9.694zm8.412-18.105A11.815 11.815 0 0 0 12.05 0C5.495 0 .157 5.337.157 11.892c0 2.096.547 4.142 1.587 5.937L0 24l6.305-1.654a11.86 11.86 0 0 0 5.74 1.46h.005c6.554 0 11.892-5.337 11.892-11.892a11.83 11.83 0 0 0-3.48-8.234z"/></svg></a></li></ul></div>
  </div><div class="shared-footer-disc"><span data-en>ME Shield Financial Services is a DBA of ME Shield Group LLC. Insurance services are offered by Miguelson Etienne, Licensed Independent Insurance Agent, affiliated with JWANAIX GROUP. Tax preparation is provided by a tax return preparer with an active IRS PTIN; a PTIN is not a professional license or IRS endorsement. Immigration document preparation is not legal advice.</span><span data-ht>ME Shield Financial Services se yon DBA pou ME Shield Group LLC. Miguelson Etienne bay sèvis asirans kòm Ajan Asirans Endepandan Lisansye ki afilye ak JWANAIX GROUP. Preparasyon taks la fèt pa yon preparatè deklarasyon taks ki gen yon PTIN IRS aktif; PTIN lan pa yon lisans pwofesyonèl oswa yon andòsman IRS. Preparasyon dokiman imigrasyon pa konsèy legal.</span></div><div class="shared-footer-bottom"><span>© <span id="year"></span> ME Shield Financial Services</span><span class="shared-footer-legal"><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/accessibility">Accessibility</a></span></div></div>`;
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
  if (document.querySelector('script[src*="chatbot-widget.js"]')) return;
  const s = document.createElement('script');
  // Versioned, or the widget's changes never reach a browser that has it cached.
  s.src = '/chatbot-widget.js?v=20260914-social-hours';
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
    '/infinite-banking-concept',
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

/* ── Reviews & Testimonials ──
   The homepage carries a five-slide carousel of real Google reviews and
   client testimonials. The service pages used to get a different thing
   entirely: one hard-coded testimonial in a static box. Somebody who read the
   homepage and then opened the insurance page saw the section change shape and
   lose four of the five reviews.
   This builds the same carousel from the same reviews, in the light palette
   those pages use, so the section reads as one thing across the site. */
const SITE_REVIEWS = [
  // Verified against the public Google Business Profile on 2026-09-14.
  { google: true, author: 'Michelda Solitaire',
    en: 'Excellent service! Very professional, helpful, and knowledgeable. They took the time to explain everything clearly and made the whole process easy and stress-free.' },
  { google: true, author: 'David Étienne',
    en: 'The service was done with professionalism, do not hesitate to contact him!' },
  { google: true, author: 'Fendia Etienne',
    en: 'Excellent service from start to finish! Very professional, knowledgeable, and easy to work with. He made the tax process simple.' },
  { google: false, author: 'Marie-Flore D., Miami',
    en: 'Miguelson explained everything in Creole so my mother could understand. We finally have the right coverage.',
    ht: 'Miguelson eksplike tout bagay an Kreyòl pou manman m’ ka konprann. Nou finalman gen bon kouvèti a.' },
  { google: false, author: 'Jean-Pierre B., Orlando',
    en: 'Got a bigger refund than I expected, and he walked me through every line. Great service!',
    ht: 'Mwen jwenn yon ranbousman pi gwo pase mwen te atann, epi li eksplike m’ chak liy. Gwo sèvis!' },
];

function initGoogleReviewSection() {
  // Live URLs are clean (/insurance); a local file or a direct link is
  // /insurance.html. Match on the same shape either way, or the section
  // silently fails to appear on exactly the pages being tested.
  const path = (window.location.pathname.replace(/\/(index)?(\.html)?$/, '').replace(/\.html$/, '')) || '/';
  // The homepage builds its own copy of this in its own markup.
  if (path === '/') return;
  const eligiblePages = new Set([
    '/insurance', '/tax-preparation', '/business-filing',
    '/immigration-forms', '/infinite-banking', '/services', '/about',
  ]);
  if (!eligiblePages.has(path) || document.querySelector('.google-review-cta')) return;

  if (!document.getElementById('google-review-cta-styles')) {
    const styles = document.createElement('style');
    styles.id = 'google-review-cta-styles';
    styles.textContent = `
      .google-review-cta{padding:72px 20px;background:#f8f5ee;text-align:center;border-top:1px solid rgba(201,168,76,.18)}
      .google-review-cta-inner{width:min(760px,100%);margin:0 auto;padding:42px 34px;background:#fff;border:1px solid rgba(201,168,76,.24);border-radius:18px;box-shadow:0 16px 45px rgba(11,29,58,.08)}
      .google-review-cta h2{margin:0 0 8px;color:#0b1d3a;font-family:Georgia,'Times New Roman',serif;font-size:clamp(1.7rem,4vw,2.35rem)}
      .google-review-cta .rv-eyebrow{font-size:.75rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#c9a84c;margin-bottom:10px}
      .google-review-cta p{max-width:620px;margin:0 auto 24px;color:#4d5564;font-size:1rem;line-height:1.7}
      .rv-carousel{position:relative;overflow:hidden;margin:24px 0 4px}
      .rv-track{display:flex;transition:transform .62s cubic-bezier(.65,0,.35,1)}
      .rv-slide{min-width:100%;display:flex;flex-direction:column;justify-content:center;min-height:230px;padding:26px 28px;border-radius:14px;background:#0b1d3a;color:#fff;text-align:left;box-sizing:border-box}
      .rv-source{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
      .rv-stars{color:#c9a84c;letter-spacing:.13em;font-size:.95rem;white-space:nowrap}
      .rv-badge{display:inline-flex;align-items:center;gap:7px;color:rgba(255,255,255,.72);font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
      .rv-badge-dot{width:9px;height:9px;border-radius:50%;background:#4285f4;box-shadow:10px 0 #ea4335,20px 0 #fbbc05,30px 0 #34a853;margin-right:30px}
      .rv-slide blockquote{margin:0;color:#fff;font-family:Georgia,'Times New Roman',serif;font-size:clamp(1.02rem,2vw,1.2rem);font-style:italic;line-height:1.6}
      .rv-author{margin-top:18px;color:#c9a84c;font-size:.83rem;font-weight:700}
      .rv-controls{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:16px}
      .rv-arrows{display:flex;gap:9px}
      .rv-arrow,.rv-pause{border:1px solid rgba(11,29,58,.22);background:#fff;color:#0b1d3a;cursor:pointer;border-radius:999px;min-height:38px;transition:background .2s,border-color .2s,transform .2s}
      .rv-arrow{width:38px;font-size:1rem}
      .rv-pause{padding:7px 13px;font:700 .7rem inherit}
      .rv-arrow:hover,.rv-pause:hover,.rv-arrow:focus-visible,.rv-pause:focus-visible{background:rgba(201,168,76,.18);border-color:#c9a84c;transform:translateY(-2px);outline:none}
      .rv-dots{display:flex;justify-content:center;gap:7px}
      .rv-dot{width:8px;height:8px;padding:0;border:0;border-radius:999px;background:rgba(11,29,58,.25);cursor:pointer;transition:width .2s,background .2s}
      .rv-dot.active{width:22px;background:#c9a84c}
      .google-review-cta .google-review-button{display:inline-flex;align-items:center;justify-content:center;margin-top:22px;padding:14px 24px;border-radius:999px;background:#c9a84c;color:#0b1d3a!important;text-decoration:none;font-weight:800;box-shadow:0 8px 22px rgba(201,168,76,.24);transition:transform .2s ease,box-shadow .2s ease}
      .google-review-cta .google-review-button:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(201,168,76,.34)}
      .google-review-cta-note{display:block;margin-top:15px;color:#6c7380;font-size:.78rem}
      @media(max-width:600px){.google-review-cta{padding:52px 16px}.google-review-cta-inner{padding:30px 18px}.rv-slide{min-height:260px;padding:22px}.google-review-cta .google-review-button{width:100%}}
      @media (prefers-reduced-motion:reduce){.rv-track,.rv-arrow,.rv-pause,.rv-dot{transition:none!important}}
    `;
    document.head.appendChild(styles);
  }

  const escape = (text) => String(text).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const slides = SITE_REVIEWS.map((review, index) => `
    <article class="rv-slide" aria-label="${index + 1} of ${SITE_REVIEWS.length}">
      <div class="rv-source">
        <span class="rv-stars" aria-label="5 stars">★★★★★</span>
        <span class="rv-badge">${review.google
          ? '<span class="rv-badge-dot"></span>Google Review'
          : '<span data-en>Client testimonial</span><span data-ht>Temwayaj kliyan</span>'}</span>
      </div>
      ${review.ht
        ? `<blockquote data-en>“${escape(review.en)}”</blockquote><blockquote data-ht>“${escape(review.ht)}”</blockquote>`
        : `<blockquote>“${escape(review.en)}”</blockquote>`}
      <div class="rv-author">— ${escape(review.author)}</div>
    </article>`).join('');

  const dots = SITE_REVIEWS.map((_, index) =>
    `<button class="rv-dot${index === 0 ? ' active' : ''}" type="button" data-rv-index="${index}" aria-label="Review ${index + 1}"></button>`).join('');

  const section = document.createElement('section');
  section.className = 'google-review-cta reveal';
  section.setAttribute('aria-labelledby', 'google-review-heading');
  section.innerHTML = `
    <div class="google-review-cta-inner">
      <div class="rv-eyebrow"><span data-en>WHAT CLIENTS SAY</span><span data-ht>SA KLIYAN DI</span></div>
      <h2 id="google-review-heading"><span data-en>Reviews &amp; Testimonials</span><span data-ht>Reviews ak Temwayaj</span></h2>
      <p data-en>If ME Shield Financial Services helped you, your honest review can help another family or small-business owner find clear, trustworthy support.</p>
      <p data-ht>Si ME Shield Financial Services te ede ou, yon review onèt ka ede yon lòt fanmi oswa pwopriyetè ti biznis jwenn sèvis klè yo ka fè konfyans.</p>
      <div class="rv-carousel" role="region" aria-roledescription="carousel" aria-label="Client reviews and testimonials" tabindex="0">
        <div class="rv-track">${slides}</div>
      </div>
      <div class="rv-controls">
        <div class="rv-arrows">
          <button class="rv-arrow" type="button" data-rv-step="-1" aria-label="Previous review">‹</button>
          <button class="rv-arrow" type="button" data-rv-step="1" aria-label="Next review">›</button>
        </div>
        <div class="rv-dots" aria-label="Choose a review">${dots}</div>
        <button class="rv-pause" type="button" data-rv-pause aria-label="Pause the reviews">Pause</button>
      </div>
      <a class="google-review-button" href="https://g.page/r/CaF7fP4t8WEjEBM/review" target="_blank" rel="noopener">
        <span data-en>Leave a Google Review →</span><span data-ht>Kite yon Review sou Google →</span>
      </a>
      <span class="google-review-cta-note"><span data-en>Your review is posted directly on Google.</span><span data-ht>Review ou a ap poste dirèkteman sou Google.</span></span>
    </div>`;

  const footer = document.querySelector('body > footer');
  if (footer) footer.before(section); else document.body.append(section);

  wireReviewCarousel(section);
}

function wireReviewCarousel(section) {
  const track = section.querySelector('.rv-track');
  const dots = [...section.querySelectorAll('.rv-dot')];
  const pauseButton = section.querySelector('[data-rv-pause]');
  const total = dots.length;
  if (!track || !total) return;

  let index = 0;
  let timer = null;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const show = (next) => {
    index = (next + total) % total;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };
  const start = () => {
    if (calm || timer) return;
    timer = setInterval(() => show(index + 1), 7000);
    pauseButton.textContent = 'Pause';
    pauseButton.setAttribute('aria-label', 'Pause the reviews');
  };
  const stop = () => {
    clearInterval(timer); timer = null;
    pauseButton.textContent = 'Play';
    pauseButton.setAttribute('aria-label', 'Play the reviews');
  };

  section.querySelectorAll('[data-rv-step]').forEach((button) => {
    button.addEventListener('click', () => { stop(); show(index + Number(button.dataset.rvStep)); });
  });
  dots.forEach((dot) => dot.addEventListener('click', () => { stop(); show(Number(dot.dataset.rvIndex)); }));
  pauseButton.addEventListener('click', () => (timer ? stop() : start()));

  const carousel = section.querySelector('.rv-carousel');
  carousel.addEventListener('mouseenter', () => timer && stop());
  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { stop(); show(index - 1); }
    if (event.key === 'ArrowRight') { stop(); show(index + 1); }
  });

  // Nothing rotates while the section is off screen or the tab is in the
  // background — an interval firing behind a hidden page is pure waste.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
    }, { threshold: 0.35 }).observe(carousel);
  } else {
    start();
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : null));

  if (calm) stop();
}


/* ── Sticky consultation CTA ──
   The client form sits on one page. Anyone reading an article, a service page
   or the homepage had nothing reminding them it exists, and no route to it
   short of finding the nav. This carries the offer with them.

   The restraint is the point. It waits until a screen and a half has been
   read, so it reads as an offer rather than an interruption; it is dismissible
   and the dismissal is remembered for a week; and it never appears on the
   pages where it would be noise — the contact page itself, the booking page,
   and the legal pages, where a sales bar over a privacy policy looks careless.
   It also steps the chat bubble and the back-to-top button up while it shows,
   so nothing ends up stacked on top of anything else. */
const CTA_DISMISSED_KEY = 'meshield-cta-dismissed';
const CTA_QUIET_DAYS = 7;
const CTA_HIDDEN_PAGES = new Set([
  '/contact', '/book', '/privacy', '/terms', '/accessibility', '/404',
]);
// The same destination as the header's "Client Form" button. marketing-source.js
// watches for links to the client portal and tags them with the visitor's
// first-touch campaign, including ones added after load like this one — so a
// lead that arrives through the bar is still attributed to where it came from.
const CTA_FORM_URL = 'https://clientportal.meshieldfinancial.com/public-intake';

/* The five service pages carry their own inline stylesheet and never link
   style.css — and those are precisely the pages this offer belongs on. So the
   component brings its own styles, the way the review section does, and works
   the same on all forty-four pages. Colours are written out rather than taken
   from custom properties for the same reason. */
function injectCtaStyles() {
  if (document.getElementById('cta-bar-styles')) return;
  const style = document.createElement('style');
  style.id = 'cta-bar-styles';
  style.textContent = `
    .cta-bar{position:fixed;left:0;right:0;bottom:0;z-index:95;display:flex;align-items:center;justify-content:center;gap:20px;
      /* iPhone home-indicator strip: without this the button sits under it. */
      padding:13px 58px calc(13px + env(safe-area-inset-bottom,0px)) 22px;
      background:linear-gradient(180deg,#122348 0%,#0B1C3A 100%);border-top:1px solid rgba(201,168,76,.45);
      box-shadow:0 -10px 34px rgba(11,28,58,.32);transform:translateY(115%);transition:transform .45s cubic-bezier(.22,1,.36,1);
      font-family:'Inter',system-ui,sans-serif;box-sizing:border-box}
    .cta-bar *{box-sizing:border-box}
    .cta-bar.is-open{transform:translateY(0)}
    .cta-bar-text{color:#fff;font-size:.95rem;line-height:1.45;margin:0}
    .cta-bar-text strong{display:block;font-family:'Playfair Display',Georgia,serif;font-size:1.06rem;font-weight:700;color:#fff}
    .cta-bar-text>span{color:rgba(255,255,255,.72);font-size:.84rem}
    .cta-bar-btn{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:9px;
      padding:14px 26px;border-radius:999px;background:#C9A84C;color:#0B1C3A!important;font-weight:800;font-size:.92rem;
      text-decoration:none;white-space:nowrap;box-shadow:0 8px 22px rgba(201,168,76,.32);
      transition:transform .2s ease,box-shadow .2s ease,background .2s ease}
    .cta-bar-btn:hover,.cta-bar-btn:focus-visible{background:#E2C97A;transform:translateY(-2px);
      box-shadow:0 12px 28px rgba(201,168,76,.42);outline:none}
    /* A gold ring that breathes twice on arrival, then stops. Motion that never
       stops stops being noticed and starts being irritating. */
    @keyframes cta-pulse{0%,100%{box-shadow:0 8px 22px rgba(201,168,76,.32),0 0 0 0 rgba(201,168,76,.5)}
      50%{box-shadow:0 8px 22px rgba(201,168,76,.32),0 0 0 12px rgba(201,168,76,0)}}
    .cta-bar.is-open .cta-bar-btn{animation:cta-pulse 2s ease-out .5s 2}
    .cta-bar-close{position:absolute;top:50%;right:14px;transform:translateY(-50%);width:36px;height:36px;border-radius:50%;
      background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);color:rgba(255,255,255,.75);cursor:pointer;
      font-size:18px;line-height:1;display:flex;align-items:center;justify-content:center;padding:0;
      transition:background .2s ease,color .2s ease}
    .cta-bar-close:hover,.cta-bar-close:focus-visible{background:rgba(255,255,255,.18);color:#fff;outline:none}
    /* Nothing may sit on top of the bar or be trapped under it. */
    body.cta-open .back-to-top{bottom:calc(var(--cta-h,68px) + 20px + env(safe-area-inset-bottom,0px))}
    body.cta-open .msc-bubble{bottom:calc(var(--cta-h,68px) + 16px + env(safe-area-inset-bottom,0px))!important}
    body.cta-open .msc-tooltip,body.cta-open .msc-window{bottom:calc(var(--cta-h,68px) + 84px + env(safe-area-inset-bottom,0px))!important}
    /* The iOS "Install ME Shield" prompt sits bottom-left and landed straight
       across the button on an iPhone. It is pinned by the shared header's own
       style block, where every declaration carries !important — so moving it
       needs the same weight, not more specificity. */
    body.cta-open .pwa-install{bottom:calc(var(--cta-h,68px) + 14px + env(safe-area-inset-bottom,0px))!important}
    /* Phones: the sentence shortens and the button takes the full width — a
       narrow tap target beside two lines of text is a miss waiting to happen. */
    @media (max-width:700px){
      .cta-bar{flex-direction:column;align-items:stretch;gap:10px;text-align:center;
        padding:14px 16px calc(14px + env(safe-area-inset-bottom,0px))}
      .cta-bar-text{padding-right:34px}
      .cta-bar-text strong{font-size:1rem}
      /* The second sentence is a nicety on a laptop and a third of the screen
         on a phone. The headline and the button carry the offer on their own. */
      .cta-bar-text>span{display:none}
      .cta-bar-btn{width:100%;padding:15px 20px}
      .cta-bar-close{top:12px;transform:none;right:12px}
    }
    /* One quiet nudge towards the form for someone who has just been sent here,
       so the journey ends looking at the thing it was for. */
    .contact-form-wrap{position:relative}
    @keyframes form-attention{0%{box-shadow:0 0 0 0 rgba(201,168,76,.55)}100%{box-shadow:0 0 0 18px rgba(201,168,76,0)}}
    .contact-form-wrap.form-attention::after{content:'';position:absolute;inset:-14px;border-radius:14px;
      pointer-events:none;animation:form-attention 1.5s ease-out 2}
    @media (prefers-reduced-motion:reduce){
      .cta-bar{transition:none}
      .cta-bar.is-open .cta-bar-btn,.contact-form-wrap.form-attention::after{animation:none}
    }`;
  document.head.appendChild(style);
}

function initStickyCta() {
  const path = (window.location.pathname.replace(/\/(index)?(\.html)?$/, '').replace(/\.html$/, '')) || '/';
  injectCtaStyles();
  if (CTA_HIDDEN_PAGES.has(path)) { highlightContactForm(path); return; }
  if (document.querySelector('.cta-bar')) return;

  try {
    const until = Number(localStorage.getItem(CTA_DISMISSED_KEY) || 0);
    if (until && Date.now() < until) return;
  } catch (_) { /* private browsing — show it, that is the safe way to be wrong */ }

  const bar = document.createElement('aside');
  bar.className = 'cta-bar';
  bar.setAttribute('aria-label', 'Free consultation');
  bar.innerHTML = `
    <div class="cta-bar-text">
      <strong><span data-en>Ready to start? Complete the Client Form.</span><span data-ht>Pare pou kòmanse? Ranpli Fòm Kliyan an.</span></strong>
      <span data-en>A few minutes, and the consultation is free — in English or Haitian Creole.</span>
      <span data-ht>Kèk minit, epi konsiltasyon an gratis — an Anglè oswa an Kreyòl.</span>
    </div>
    <a class="cta-bar-btn" href="${CTA_FORM_URL}">
      <span data-en>Open the Client Form</span><span data-ht>Louvri Fòm Kliyan an</span>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 4l-1.4 1.4L16.2 11H4v2h12.2l-5.6 5.6L12 20l8-8z"/></svg>
    </a>
    <button class="cta-bar-close" type="button" aria-label="Close">&times;</button>`;
  document.body.appendChild(bar);
  // Measure the bar rather than guessing: the text wraps differently in Creole
  // and on a narrow screen, and a guessed height leaves the chat bubble either
  // overlapping it or floating in mid-air.
  const setHeight = () => document.documentElement.style.setProperty('--cta-h', Math.ceil(bar.offsetHeight) + 'px');
  setHeight();
  window.addEventListener('resize', setHeight, { passive: true });

  const open = () => { bar.classList.add('is-open'); document.body.classList.add('cta-open'); };
  const close = () => {
    bar.classList.remove('is-open');
    document.body.classList.remove('cta-open');
    try { localStorage.setItem(CTA_DISMISSED_KEY, String(Date.now() + CTA_QUIET_DAYS * 864e5)); } catch (_) {}
    setTimeout(() => bar.remove(), 500);
  };

  bar.querySelector('.cta-bar-close').addEventListener('click', close);
  // Following the offer is not a dismissal, but the bar should not ride along
  // to the page it just sent you to.
  bar.querySelector('.cta-bar-btn').addEventListener('click', () => document.body.classList.remove('cta-open'));

  // A screen and a half of reading, or the bottom third of a short page —
  // whichever comes first, so a short page is not left without it.
  const trigger = Math.min(window.innerHeight * 1.4, Math.max(400, document.body.scrollHeight * 0.3));
  let shown = false;
  const check = () => {
    if (shown || window.scrollY < trigger) return;
    shown = true; open();
    window.removeEventListener('scroll', check);
  };
  window.addEventListener('scroll', check, { passive: true });
  check();
}

/* One quiet nudge towards the form for someone who has just been sent here,
   so the journey ends looking at the thing it was for. */
function highlightContactForm(path) {
  if (path !== '/contact') return;
  const form = document.querySelector('.contact-form-wrap');
  if (!form || !('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      form.classList.add('form-attention');
      obs.disconnect();
    });
  }, { threshold: 0.25 });
  obs.observe(form);
}

document.addEventListener('DOMContentLoaded', () => {
  initSharedFooter();
  initSharedHeader();
  initGoogleReviewSection();
  initAccessibility();
  initCleanUrls();
  initLang();
  initHamburger();
  initCleanUrls(); // normalize links injected by the mobile menu before nav matching
  initActiveNav();
  initReveal();
  initBackToTop();
  initStickyCta();
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
