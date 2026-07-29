// sw.js — minimal service worker, added only so the site qualifies as
// "installable" (Chrome/Android's Add to Home Screen and desktop install
// prompt both require an active service worker plus a valid manifest).
//
// This intentionally does NOT cache anything. Every request passes straight
// through to the network untouched. That's on purpose — this site has live
// forms, a chatbot, and backend API calls, and a caching service worker is
// an easy way to accidentally serve stale content or break a submission.
// If offline support is ever wanted later, this is the file to expand.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // No-op: not calling respondWith() lets the browser handle the
  // request normally, exactly as if this file didn't exist.
});
