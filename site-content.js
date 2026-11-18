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

  async function load() {
    try {
      const response = await fetch(endpoint, { credentials: 'omit' });
      if (!response.ok) return;
      const data = await response.json();
      if (!data.success || !data.content) return;
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
