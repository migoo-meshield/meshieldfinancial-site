/* Shared appearance preference. Runs in <head> to avoid a light flash. */
(function () {
  'use strict';
  const key = 'meshield-theme';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try { preference = localStorage.getItem(key); } catch (_) {}
  function apply() {
    const dark = preference === 'dark' || (preference !== 'light' && system.matches);
    root.dataset.theme = dark ? 'dark' : 'light';
    updateButton();
  }
  function updateButton() {
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    const ht = root.lang === 'ht' || document.body.classList.contains('lang-ht');
    const dark = root.dataset.theme === 'dark';
    button.textContent = dark ? '☀' : '☾';
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', ht ? 'Chanje ant mòd klè ak mòd nwa' : 'Toggle dark mode');
    button.title = ht ? (dark ? 'Chwazi mòd klè' : 'Chwazi mòd nwa') : (dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  apply();
  system.addEventListener('change', apply);
  window.addEventListener('storage', function (event) {
    if (event.key === key || event.key === null) { preference = event.newValue; apply(); }
  });
  document.addEventListener('DOMContentLoaded', function () {
    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.type = 'button';
    button.addEventListener('click', function () {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, preference); } catch (_) {}
      apply();
    });
    document.body.appendChild(button);
    updateButton();
    new MutationObserver(updateButton).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(updateButton).observe(root, { attributes: true, attributeFilter: ['lang'] });
  });
}());
