/* Corion Gutachter — Analytics + Cookie Consent
   GA4 Measurement ID: G-RYF77GKESM
   Respects EU/German cookie law: consent denied until user accepts.
*/

// 1. Bootstrap dataLayer + gtag immediately (needed before any inline scripts)
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// 2. Set consent denied by default (Consent Mode v2)
gtag('consent', 'default', {
  'ad_storage':              'denied',
  'analytics_storage':       'denied',
  'functionality_storage':   'denied',
  'personalization_storage': 'denied',
  'security_storage':        'granted'
});

// 3. Language detection
window.currentLanguage = location.pathname.startsWith('/ro') ? 'ro' : 'de';

// 4. GA initialization (called only after user consent)
window.trackGaEventInitialized = false;
window.initializeAndMarkGA = function() {
  if (window.trackGaEventInitialized) return;
  // Dynamically load the GA script (respects consent)
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-RYF77GKESM';
  document.head.appendChild(s);
  // Grant analytics consent
  gtag('consent', 'update', { 'analytics_storage': 'granted' });
  gtag('js', new Date());
  gtag('config', 'G-RYF77GKESM', { 'anonymize_ip': true });
  window.trackGaEventInitialized = true;
};

// 5. Helper for manual GA event calls (fires only after consent)
window.trackGaEvent = function(eventName, params) {
  if (!window.trackGaEventInitialized) return;
  gtag('event', eventName, Object.assign(
    { page_path: location.pathname, language: window.currentLanguage },
    params || {}
  ));
};

// 6. Intercept dataLayer.push → forward events to GA automatically
//    (picks up whatsapp_click_ro / lead_form_submit_ro from RO page onclick handlers)
(function() {
  var _orig = dataLayer.push;
  dataLayer.push = function() {
    var result = _orig.apply(dataLayer, arguments);
    if (!window.trackGaEventInitialized) return result;
    for (var i = 0; i < arguments.length; i++) {
      var obj = arguments[i];
      // Only plain {event:...} objects, not gtag's Arguments objects
      if (obj && typeof obj === 'object' && !obj.callee && obj.event) {
        gtag('event', obj.event, Object.assign(
          { page_path: location.pathname, language: window.currentLanguage },
          obj
        ));
      }
    }
    return result;
  };
})();

// 7. Auto-init if user already consented in a previous session
if (localStorage.getItem('cookieConsent') === 'granted') {
  window.initializeAndMarkGA();
}

// 8. Cookie banner + WhatsApp click tracking (after DOM is ready)
document.addEventListener('DOMContentLoaded', function() {

  // Generic WhatsApp click tracking for all pages
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href*="wa.me"]');
    if (link) {
      window.trackGaEvent('whatsapp_click_ro', { language: window.currentLanguage });
    }
  });

  // Skip banner if user already decided
  if (localStorage.getItem('cookieConsent')) return;

  var isRo = window.currentLanguage === 'ro';

  var banner = document.createElement('div');
  banner.id = 'corion-cookie-banner';
  banner.style.cssText = [
    'position:fixed', 'bottom:0', 'left:0', 'right:0', 'z-index:10000',
    'background:#1f2937', 'border-top:2px solid #c00000',
    'padding:14px 20px', 'display:flex', 'flex-wrap:wrap',
    'align-items:center', 'justify-content:space-between', 'gap:10px',
    'font-family:Inter,sans-serif'
  ].join(';');

  var msg = document.createElement('p');
  msg.style.cssText = 'color:#d1d5db;font-size:13px;margin:0;flex:1;min-width:220px;line-height:1.5;';
  msg.innerHTML = isRo
    ? 'Folosim <strong>Google Analytics</strong> (anonim) pentru a înțelege cum este folosit site-ul. Puteți refuza fără consecințe.'
    : 'Wir verwenden <strong>Google Analytics</strong> (anonymisiert) zur Website-Analyse. Sie können ablehnen.';

  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;flex-shrink:0;';

  var accept = document.createElement('button');
  accept.textContent = isRo ? 'Accept' : 'Akzeptieren';
  accept.style.cssText = [
    'background:#c00000', 'color:#fff', 'border:none',
    'padding:9px 20px', 'border-radius:6px', 'cursor:pointer',
    'font-size:13px', 'font-weight:700', 'letter-spacing:.3px'
  ].join(';');
  accept.addEventListener('click', function() {
    localStorage.setItem('cookieConsent', 'granted');
    window.initializeAndMarkGA();
    banner.remove();
  });

  var reject = document.createElement('button');
  reject.textContent = isRo ? 'Refuz' : 'Ablehnen';
  reject.style.cssText = [
    'background:#374151', 'color:#d1d5db', 'border:none',
    'padding:9px 18px', 'border-radius:6px', 'cursor:pointer', 'font-size:13px'
  ].join(';');
  reject.addEventListener('click', function() {
    localStorage.setItem('cookieConsent', 'denied');
    banner.remove();
  });

  btnRow.appendChild(accept);
  btnRow.appendChild(reject);
  banner.appendChild(msg);
  banner.appendChild(btnRow);
  document.body.appendChild(banner);
});
