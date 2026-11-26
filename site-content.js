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
    // The whole photo is shown, never cropped: it keeps its 2:1 shape, as wide as the screen up to 640px, centred on navy.
    const band = document.createElement('section');
    band.id = 'site-holiday';
    band.setAttribute('aria-label', 'Holiday greeting');
    band.style.cssText = 'background:#0b1d3a;color:#fff;display:flex;justify-content:center;';
    const frame = document.createElement('div');
    frame.style.cssText = 'position:relative;width:100%;max-width:640px;aspect-ratio:2 / 1;';
    const img = document.createElement('img');
    img.src = holiday.image; img.alt = holiday.alt || ''; img.width = 1200; img.height = 600;
    img.style.cssText = 'display:block;width:100%;height:100%;object-fit:contain;';
    const text = document.createElement('div');
    text.style.cssText = 'position:absolute;left:0;right:0;bottom:0;padding:28px 16px 12px;text-align:center;background:linear-gradient(to top,rgba(7,19,42,.85),rgba(7,19,42,0));';
    for (const [attr, value] of [['data-en', holiday.greeting.en], ['data-ht', holiday.greeting.ht]]) {
      const line = document.createElement('div');
      line.setAttribute(attr, '');
      line.style.cssText = 'font-family:var(--font-display,Georgia,serif);font-size:clamp(1.15rem,4vw,1.7rem);font-weight:700;text-shadow:0 2px 10px rgba(0,0,0,.6);';
      line.textContent = String(value || '');
      text.append(line);
    }
    frame.append(img, text);
    if (holiday.credit) {
      const credit = document.createElement('div');
      credit.style.cssText = 'position:absolute;right:8px;top:6px;font-size:.66rem;color:rgba(255,255,255,.85);text-shadow:0 1px 4px rgba(0,0,0,.7);';
      credit.textContent = String(holiday.credit).slice(0, 80);
      frame.append(credit);
    }
    band.append(frame);
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
