/* Remember where a visitor came from, and carry it with them.
 *
 * The Marketing Attribution page in the team portal reads real leads, but
 * every lead arrived tagged "Website" with no campaign, so it could never
 * answer the only question worth asking: which of these actually brings
 * people in. Nothing on the site was capturing that.
 *
 * This records the campaign tags and the referrer the FIRST time someone
 * lands, keeps them for the visit, and attaches them to:
 *   - the contact form post, and
 *   - any link that sends them on to the client portal intake,
 * so the tag survives the hop between the two sites.
 *
 * First touch wins: if someone arrives from a Facebook ad, wanders the site,
 * then comes back through a Google search a minute later, the ad is what
 * brought them. Nothing here identifies a person — it is only where the
 * click came from. */
(function () {
  var KEY = 'meshield-marketing-source';
  var FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  function read() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }
  function write(value) {
    try { sessionStorage.setItem(KEY, JSON.stringify(value)); } catch (e) {}
  }

  function capture() {
    var existing = read();
    if (existing && existing.utm_source) return existing;   // first touch wins

    var params = new URLSearchParams(location.search);
    var found = {};
    FIELDS.forEach(function (f) {
      var v = (params.get(f) || '').trim().slice(0, 100);
      if (v) found[f] = v;
    });

    // Common short links people actually paste into a bio or a post.
    if (!found.utm_source) {
      var gclid = params.get('gclid'), fbclid = params.get('fbclid');
      if (gclid) { found.utm_source = 'google'; found.utm_medium = 'cpc'; }
      else if (fbclid) { found.utm_source = 'facebook'; found.utm_medium = 'social'; }
    }

    // No tags at all: fall back to the referring site, which is still far
    // more useful than recording every lead as "Website".
    if (!found.utm_source && document.referrer) {
      try {
        var host = new URL(document.referrer).hostname.replace(/^www\./, '');
        if (host && host !== location.hostname.replace(/^www\./, '')) {
          found.utm_source = host.slice(0, 100);
          found.utm_medium = /google|bing|duckduckgo|yahoo/.test(host) ? 'organic'
            : /facebook|instagram|tiktok|linkedin|twitter|x\.com|t\.co/.test(host) ? 'social'
            : 'referral';
        }
      } catch (e) {}
    }

    if (!Object.keys(found).length && existing) return existing;
    found.landing_page = (location.pathname + location.search).slice(0, 200);
    found.referrer = String(document.referrer || '').slice(0, 200);
    found.first_seen = new Date().toISOString();
    write(found);
    return found;
  }

  var source = capture();
  window.meshieldMarketingSource = function () { return read() || {}; };

  /* Carry the tag across to the client portal, which is a different site and
     would otherwise lose it completely. */
  function tagPortalLinks() {
    if (!source || !source.utm_source) return;
    document.querySelectorAll('a[href*="clientportal.meshieldfinancial.com"]').forEach(function (a) {
      try {
        var url = new URL(a.href);
        if (url.searchParams.get('utm_source')) return;
        FIELDS.forEach(function (f) { if (source[f]) url.searchParams.set(f, source[f]); });
        a.href = url.toString();
      } catch (e) {}
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tagPortalLinks);
  else tagPortalLinks();

  // shared.js writes the header and footer after this runs, and other scripts
  // add links later still. Watching the document is the only way to be sure
  // every portal link gets tagged, whenever it appears — a timeout just races
  // whatever renders last.
  if (window.MutationObserver) {
    var pending = 0;
    new MutationObserver(function () {
      clearTimeout(pending);
      pending = setTimeout(tagPortalLinks, 40);
    }).observe(document.documentElement, { childList: true, subtree: true });
  } else {
    window.addEventListener('load', tagPortalLinks);
    setTimeout(tagPortalLinks, 1200);
  }
})();
