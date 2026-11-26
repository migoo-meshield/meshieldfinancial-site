// Optional published copy from the private Team Portal's read-only public endpoint.
// The HTML remains the fallback if the endpoint or network is unavailable.
(() => {
  const endpoint = 'https://meshield-team-portal.pages.dev/api/public-site-content';

  function setHeadline(element, headline, highlight) {
    const index = headline.indexOf(highlight);
    if (!highlight || index < 0) return;
    element.replaceChildren(document.createTextNode(headline.slice(0, index)));
    const em = document.createElement('em');
    em.textContent = highlight;
    element.append(em, document.createTextNode(headline.slice(index + highlight.length)));
  }

  // A holiday greeting band above the hero: a free photo, the greeting in both languages, hidden after `until`.
  // Only photos from our own /holiday/ folder are accepted, whatever the endpoint sends.
  function showHoliday(holiday) {
    if (!holiday || document.getElementById('site-holiday')) return;
    if (!/^https:\/\/meshieldfinancial\.com\/holiday\/[a-z0-9-]{3,40}\.jpg$/.test(String(holiday.image || ''))) return;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(holiday.until || '')) || today > holiday.until) return;
    const anchor = document.querySelector('.home-hero');
    if (!anchor || !holiday.greeting) return;
    const band = document.createElement('section');
    band.id = 'site-holiday';
    band.setAttribute('aria-label', 'Holiday greeting');
    band.style.cssText = 'position:relative;background:#0b1d3a;color:#fff;overflow:hidden;text-align:center;';
    const img = document.createElement('img');
    img.src = holiday.image; img.alt = holiday.alt || ''; img.width = 1200; img.height = 600;
    img.style.cssText = 'display:block;width:100%;height:150px;object-fit:cover;opacity:.55;';
    const text = document.createElement('div');
    text.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 16px;text-shadow:0 2px 12px rgba(0,0,0,.6);';
    for (const [attr, value] of [['data-en', holiday.greeting.en], ['data-ht', holiday.greeting.ht]]) {
      const line = document.createElement('div');
      line.setAttribute(attr, '');
      line.style.cssText = 'font-family:var(--font-display,Georgia,serif);font-size:clamp(1.3rem,4vw,2rem);font-weight:700;';
      line.textContent = String(value || '');
      text.append(line);
    }
    band.append(img, text);
    if (holiday.credit) {
      const credit = document.createElement('div');
      credit.style.cssText = 'position:absolute;right:10px;bottom:4px;font-size:.68rem;color:rgba(255,255,255,.8);';
      credit.textContent = String(holiday.credit).slice(0, 80);
      band.append(credit);
    }
    anchor.before(band);
  }

  async function load() {
    try {
      const response = await fetch(endpoint, { credentials: 'omit' });
      if (!response.ok) return;
      const data = await response.json();
      if (!data.success || !data.content) return;
      showHoliday(data.content.holiday);
      for (const language of ['en', 'ht']) {
        const copy = data.content[language];
        const headline = document.getElementById(`site-hero-title-${language}`);
        const intro = document.getElementById(`site-hero-intro-${language}`);
        if (!copy || !headline || !intro || typeof copy.headline !== 'string' || typeof copy.highlight !== 'string' || typeof copy.intro !== 'string') continue;
        setHeadline(headline, copy.headline, copy.highlight);
        intro.textContent = copy.intro;
      }
    } catch (_) {
      // Keep the complete, reviewed static copy already in index.html.
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
  else load();
})();
