// src/serviceWorkerRegistration.ts
// Adapted from CRA PWA boilerplate

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 IPv4 localhost.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/
    )
);

export function register() {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

    if (isLocalhost) {
      // This is running on localhost. Check if a service worker still exists or not.
      fetch(swUrl)
        .then(response => {
          if (
            response.status === 404 ||
            response.headers.get('content-type')!.indexOf('javascript') === -1
          ) {
            // No service worker found. Unregister.
            navigator.serviceWorker.ready.then(reg => reg.unregister());
          } else {
            // Service worker found, proceed normally.
            registerValidSW(swUrl);
          }
        })
        .catch(() => {
          console.log('No internet connection, app running in offline mode.');
        });
    } else {
      // Not localhost. Just register service worker
      registerValidSW(swUrl);
    }
  }
}

function registerValidSW(swUrl: string) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.onstatechange = () => {
          if (installing.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available; please refresh.
              console.log('New content available; please refresh.');
            } else {
              // Content is cached for offline use.
              console.log('Content cached for offline use.');
            }
          }
        };
      };
    })
    .catch(error => {
      console.error('Error during service worker registration:', error);
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}
