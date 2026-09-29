/* Jungla Lab · comportamiento del sitio (sin dependencias) */
(function () {
  'use strict';
  var CFG = window.JL_CONFIG || {};
  var doc = document.documentElement;
  doc.classList.add('js');

  /* ---------- utilidades ---------- */
  var store = {
    get: function (k, s) { try { var v = (s ? sessionStorage : localStorage).getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set: function (k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  window.dataLayer = window.dataLayer || [];
  function track(event, params) {
    var p = { event: event };
    for (var k in params) { if (Object.prototype.hasOwnProperty.call(params, k)) p[k] = params[k]; }
    window.dataLayer.push(p);
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var pageName = document.body.getAttribute('data-page') || 'sitio';

  /* ---------- consentimiento de cookies ---------- */
  var CONSENT_KEY = 'jl_consent_v1';
  var gtmLoaded = false;
  function loadGTM() {
    if (gtmLoaded || !CFG.gtmId) return;
    gtmLoaded = true;
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(CFG.gtmId);
    document.head.appendChild(s);
  }
  function applyConsent(c) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: c.analytics ? 'granted' : 'denied',
        ad_storage: c.marketing ? 'granted' : 'denied',
        ad_user_data: c.marketing ? 'granted' : 'denied',
        ad_personalization: c.marketing ? 'granted' : 'denied'
      });
    }
    if (c.analytics || c.marketing) loadGTM();
  }
  var banner = $('#cookie-banner');
  function openBanner(showPrefs) {
    if (!banner) return;
    var c = store.get(CONSENT_KEY) || { analytics: false, marketing: false };
    $('#ck-analytics', banner).checked = !!c.analytics;
    $('#ck-marketing', banner).checked = !!c.marketing;
    $('#cookie-prefs', banner).hidden = !showPrefs;
    banner.hidden = false;
  }
  function saveConsent(c) {
    c.ts = new Date().toISOString();
    store.set(CONSENT_KEY, c);
    applyConsent(c);
    if (banner) banner.hidden = true;
    track('consent_update', { analytics: c.analytics, marketing: c.marketing });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-consent]');
    if (!t) return;
    var a = t.getAttribute('data-consent');
    if (a === 'accept') saveConsent({ analytics: true, marketing: true });
    else if (a === 'reject') saveConsent({ analytics: false, marketing: false });
    else if (a === 'save') saveConsent({ analytics: $('#ck-analytics').checked, marketing: $('#ck-marketing').checked });
    else if (a === 'prefs') { var p = $('#cookie-prefs'); p.hidden = !p.hidden; }
    else if (a === 'open') openBanner(true);
  });
  var prev = store.get(CONSENT_KEY);
  if (prev) applyConsent(prev); else openBanner(false);

  /* ---------- menú móvil ---------- */
  var toggle = $('.menu-toggle'), nav = $('#site-nav');
  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.toggle('is-open', open);
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- WhatsApp y botones ---------- */
  var waHref = 'https://wa.me/' + String(CFG.whatsappNumber || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(CFG.whatsappText || '');
  $$('[data-wa]').forEach(function (a) {
    a.href = waHref;
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', function () { track('click_whatsapp', { ubicacion: a.getAttribute('data-wa'), pagina: pageName }); });
  });
  $$('[data-cta]').forEach(function (a) {
    a.addEventListener('click', function () { track('cta_click', { seccion: a.getAttribute('data-cta'), texto: a.textContent.trim(), pagina: pageName }); });
  });

  /* ---------- atribución de campaña ---------- */
  var ATTR_KEY = 'jl_attribution_v1';
  var ATTR_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'li_fat_id'];
  (function captureAttribution() {
    var qs = new URLSearchParams(location.search), found = {}, any = false;
    ATTR_FIELDS.forEach(function (k) { var v = qs.get(k); if (v) { found[k] = v.slice(0, 200); any = true; } });
    var saved = store.get(ATTR_KEY);
    var maxAge = (CFG.attributionDays || 90) * 864e5;
    if (saved && Date.now() - saved.ts > maxAge) saved = null;
    if (any) saved = { ts: Date.now(), values: found, landing: location.pathname, referrer: document.referrer || '' };
    if (!saved) saved = { ts: Date.now(), values: {}, landing: location.pathname, referrer: document.referrer || '' };
    store.set(ATTR_KEY, saved);
  })();

  /* ---------- prueba A/B del titular ---------- */
  var variant = 'A';
  var h1 = $('h1[data-variant-b]');
  if (h1 && CFG.abTestHeadline) {
    variant = store.get('jl_ab_headline');
    if (variant !== 'A' && variant !== 'B') { variant = Math.random() < 0.5 ? 'A' : 'B'; store.set('jl_ab_headline', variant); }
    if (variant === 'B') h1.innerHTML = h1.getAttribute('data-variant-b');
    track('experiment_impression', { experiment: 'hero_headline', variant: variant, pagina: pageName });
  }

  /* ---------- formulario ---------- */
  var form = $('#lead-form');
  if (form) {
    var started = false;
    var btn = $('.form-submit', form), btnLabel = btn.innerHTML;
    var status = $('#form-status');
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var rules = {
      nombre: function (v) { return v.trim().length >= 3 ? '' : 'Escribe tu nombre y apellido.'; },
      email: function (v) { return EMAIL.test(v.trim()) ? '' : 'Revisa el correo: debe tener el formato nombre@empresa.com.'; },
      celular: function (v) { var d = v.replace(/\D/g, ''); return !v.trim() || (d.length >= 9 && d.length <= 12) ? '' : 'Ingresa un celular de 9 dígitos, por ejemplo 987 654 321.'; },
      necesidad: function (v) { return v ? '' : 'Elige qué quieres mejorar primero.'; },
      consentimiento: function (v, el) { return el.checked ? '' : 'Necesitamos tu autorización para contactarte.'; }
    };
    function showError(el, msg) {
      var box = $('#' + el.id + '-error');
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (box) box.textContent = msg;
    }
    function validate(el) { var r = rules[el.name]; if (!r) return ''; var m = r(el.value, el); showError(el, m); return m; }
    form.addEventListener('focusin', function () { if (!started) { started = true; track('form_start', { pagina: pageName }); } });
    form.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid') === 'true') validate(e.target); });
    form.addEventListener('change', function (e) { if (e.target.getAttribute('aria-invalid') === 'true') validate(e.target); });
    function setStatus(kind, html) {
      status.hidden = !html;
      status.className = 'form-status full' + (kind ? ' form-status--' + kind : '');
      status.innerHTML = html || '';
    }
    function normPhone(v) {
      var d = v.replace(/\D/g, '');
      if (!d) return '';
      if (d.length === 9 && d.charAt(0) === '9') return '+51' + d;
      return '+' + d;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', '');
      var first = null;
      ['nombre', 'email', 'celular', 'necesidad', 'consentimiento'].forEach(function (n) {
        var el = form.elements[n];
        if (el && validate(el) && !first) first = el;
      });
      if (first) { first.focus(); track('form_error', { campo: first.name, pagina: pageName }); return; }
      if (form.elements.sitio_web && form.elements.sitio_web.value) return; /* honeypot: bots */

      var attr = store.get(ATTR_KEY) || { values: {} };
      var payload = {
        nombre: form.elements.nombre.value.trim(),
        email: form.elements.email.value.trim().toLowerCase(),
        celular: normPhone(form.elements.celular.value),
        necesidad: form.elements.necesidad.value,
        consentimiento: true,
        consentimiento_texto: $('#f-consent-text').textContent.trim(),
        consentimiento_fecha: new Date().toISOString(),
        pagina: pageName,
        url: location.href.split('#')[0],
        landing_inicial: attr.landing || '',
        referrer: attr.referrer || '',
        variante_titular: variant
      };
      ATTR_FIELDS.forEach(function (k) { payload[k] = (attr.values && attr.values[k]) || ''; });

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Enviando…';

      function done() {
        store.set('jl_lead', { nombre: payload.nombre.split(' ')[0], contacto: payload.celular ? 'WhatsApp' : 'correo' }, true);
        track('generate_lead', { necesidad: payload.necesidad, pagina: pageName, utm_source: payload.utm_source, utm_campaign: payload.utm_campaign, variante_titular: variant });
        setTimeout(function () { location.href = CFG.thankYouPage || 'gracias.html'; }, 250);
      }
      function fail() {
        btn.disabled = false;
        btn.innerHTML = btnLabel;
        setStatus('error', 'No pudimos enviar tu consulta. Revisa tu conexión e inténtalo de nuevo, o <a href="' + waHref + '" target="_blank" rel="noopener">escríbenos por WhatsApp</a>.');
        track('form_submit_error', { pagina: pageName });
      }
      if (!CFG.formEndpoint) { done(); return; }
      var ctrl = 'AbortController' in window ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 12000);
      fetch(CFG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (r) { clearTimeout(timer); if (r.ok) done(); else fail(); })
        .catch(function () { clearTimeout(timer); fail(); });
    });
  }

  /* ---------- página de gracias ---------- */
  if (pageName === 'gracias') {
    var lead = store.get('jl_lead', true);
    if (lead && lead.nombre) $$('[data-lead-name]').forEach(function (el) { el.textContent = ', ' + lead.nombre; });
    if (lead && lead.contacto) $$('[data-lead-channel]').forEach(function (el) { el.textContent = lead.contacto; });
    track('lead_confirmation_view', { con_formulario: !!lead });
  }

  /* ---------- medición de scroll y secciones ---------- */
  var marks = { 50: false, 90: false };
  window.addEventListener('scroll', function () {
    var h = document.documentElement.scrollHeight - innerHeight;
    if (h <= 0) return;
    var p = (scrollY / h) * 100;
    [50, 90].forEach(function (m) { if (!marks[m] && p >= m) { marks[m] = true; track('scroll', { percent_scrolled: m, pagina: pageName }); } });
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    var casos = $('#casos');
    if (casos) {
      var seen = false;
      new IntersectionObserver(function (en, ob) { en.forEach(function (x) { if (x.isIntersecting && !seen) { seen = true; track('view_casos', { pagina: pageName }); ob.disconnect(); } }); }, { threshold: 0.3 }).observe(casos);
    }
    /* aparición suave solo para lo que está debajo del primer pantallazo */
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.remove('is-pending'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
      $$('.reveal').forEach(function (el) { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('is-pending'); io.observe(el); } });
    }
    /* el botón flotante de WhatsApp se oculta mientras el formulario está en pantalla */
    var wa = $('.wa-float'), f = $('#formulario');
    if (wa && f) new IntersectionObserver(function (en) { wa.classList.toggle('is-hidden', en[0].isIntersecting); }, { threshold: 0.25 }).observe(f);
  }
})();
