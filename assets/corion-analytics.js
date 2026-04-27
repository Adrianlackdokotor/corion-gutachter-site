/* Corion Gutachter — Analytics + Cookie Consent + Conversion Tracking
   GA4 Measurement ID : G-RYF77GKESM  (client-side only — no secret exposed)
   Server-side MP     : POST /api/track-event  (secret stays on server)
   EU/DE cookie law   : consent denied until user clicks "Akzeptieren".
*/

// ─── 1. Bootstrap dataLayer + gtag (must run before any inline scripts) ────
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// ─── 2. Consent Mode v2 — everything denied by default ─────────────────────
gtag('consent', 'default', {
  'ad_storage':              'denied',
  'analytics_storage':       'denied',
  'functionality_storage':   'denied',
  'personalization_storage': 'denied',
  'security_storage':        'granted'
});

// ─── 3. Language detection ─────────────────────────────────────────────────
window.currentLanguage = location.pathname.startsWith('/ro') ? 'ro' : 'de';

// ─── 4. GA initialization (only after user consent) ───────────────────────
window.trackGaEventInitialized = false;
window.initializeAndMarkGA = function() {
  if (window.trackGaEventInitialized) return;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-RYF77GKESM';
  document.head.appendChild(s);
  gtag('consent', 'update', { 'analytics_storage': 'granted' });
  gtag('js', new Date());
  gtag('config', 'G-RYF77GKESM', { 'anonymize_ip': true });
  window.trackGaEventInitialized = true;
};

// ─── 5. Client ID helper (reads _ga cookie → localStorage fallback) ────────
function _getClientId() {
  try {
    var gaCookie = document.cookie.split('; ').filter(function(c) {
      return c.indexOf('_ga=') === 0;
    })[0];
    if (gaCookie) {
      var parts = gaCookie.split('=')[1].split('.');
      if (parts.length >= 4) return parts[2] + '.' + parts[3];
    }
  } catch(e) {}
  var stored = localStorage.getItem('_corion_cid');
  if (!stored) {
    stored = 'fb.' + Date.now() + '.' + Math.random().toString(36).substring(2);
    localStorage.setItem('_corion_cid', stored);
  }
  return stored;
}

// ─── 6. trackConversion — calls gtag + backend Measurement Protocol ─────────
//   Fires ONLY when user has accepted cookies.
//   API Secret never leaves the server — frontend sends to /api/track-event.
window.trackConversion = function(eventName, params) {
  if (localStorage.getItem('cookieConsent') !== 'granted') return;
  params = params || {};

  var payload = {
    event_name: eventName,
    client_id:  _getClientId(),
    language:   window.currentLanguage,
    page_path:  location.pathname,
    lead_type:  params.lead_type || '',
    source:     params.source    || 'website'
  };

  // 6a. Client-side gtag event
  if (window.trackGaEventInitialized) {
    gtag('event', eventName, {
      language:  payload.language,
      page_path: payload.page_path,
      lead_type: payload.lead_type,
      source:    payload.source
    });
  }

  // 6b. Server-side Measurement Protocol (secret stays on server)
  fetch('/api/track-event', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
    keepalive: true
  }).catch(function() {});  // silent fail — never block UX
};

// ─── 7. Backward-compat: trackGaEvent (used by older inline onclick attrs) ──
window.trackGaEvent = function(eventName, params) {
  if (!window.trackGaEventInitialized) return;
  gtag('event', eventName, Object.assign(
    { page_path: location.pathname, language: window.currentLanguage },
    params || {}
  ));
};

// ─── 8. dataLayer.push interception (picks up RO page trackEvent calls) ─────
(function() {
  var _orig = dataLayer.push;
  dataLayer.push = function() {
    var result = _orig.apply(dataLayer, arguments);
    for (var i = 0; i < arguments.length; i++) {
      var obj = arguments[i];
      if (obj && typeof obj === 'object' && !obj.callee && obj.event) {
        // Map legacy event names to conversion tracker
        var name = obj.event;
        var leadType = '';
        if (name === 'whatsapp_click_ro') { name = 'whatsapp_click'; leadType = 'whatsapp'; }
        if (name === 'lead_form_submit_ro') { name = 'lead_form_submit'; leadType = 'form'; }
        window.trackConversion(name, { lead_type: leadType, source: obj.source || 'website' });
      }
    }
    return result;
  };
})();

// ─── 9. Auto-init if user already consented in a previous session ────────────
if (localStorage.getItem('cookieConsent') === 'granted') {
  window.initializeAndMarkGA();
}

// ─── 10. DOM-ready: event delegation + cookie banner ─────────────────────────
document.addEventListener('DOMContentLoaded', function() {

  // ── Click delegation: WhatsApp, Phone, Maps, Photo Upload ─────────────────
  document.addEventListener('click', function(e) {
    var el = e.target;

    // WhatsApp links
    var waLink = el.closest('a[href*="wa.me"]');
    if (waLink) {
      window.trackConversion('whatsapp_click', { lead_type: 'whatsapp' });
      return;
    }

    // Phone links  (tel: hrefs + sticky phone buttons)
    var telLink = el.closest('a[href^="tel:"]');
    if (telLink) {
      window.trackConversion('phone_click', { lead_type: 'phone' });
      return;
    }

    // Google Maps links
    var mapsLink = el.closest('a[href*="google.com/maps"]');
    if (mapsLink) {
      window.trackConversion('maps_click', { lead_type: 'maps' });
      return;
    }

    // Photo upload labels / buttons (file inputs, camera labels)
    var uploadEl = el.closest(
      'label[for*="hoto"], label[for*="Upload"], label[for*="upload"], ' +
      'button[data-track="photo"], label[aria-label*="oto"]'
    );
    if (uploadEl) {
      window.trackConversion('photo_upload_click', { lead_type: 'photo_upload' });
      return;
    }
  });

  // ── Form submit delegation: contact / lead forms ───────────────────────────
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    // Exclude search or trivial forms by checking for meaningful fields
    var hasInput = form.querySelector('input[type="text"], input[type="email"], textarea');
    if (hasInput) {
      window.trackConversion('lead_form_submit', { lead_type: 'form' });
    }
  });

  // ── Cookie banner ──────────────────────────────────────────────────────────
  if (localStorage.getItem('cookieConsent')) return;  // already decided

  var isRo = window.currentLanguage === 'ro';

  var banner = document.createElement('div');
  banner.id = 'corion-cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', isRo ? 'Consimțământ cookie' : 'Cookie-Einwilligung');
  banner.style.cssText = [
    'position:fixed', 'bottom:0', 'left:0', 'right:0', 'z-index:10000',
    'background:#1f2937', 'border-top:2px solid #c00000',
    'padding:14px 20px', 'display:flex', 'flex-wrap:wrap',
    'align-items:center', 'justify-content:space-between', 'gap:10px',
    'font-family:Inter,sans-serif', 'box-shadow:0 -2px 12px rgba(0,0,0,.5)'
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
