(function () {
  var C = window.JUNGLA_CONFIG || {};
  // GTM opcional
  if (C.gtmId) {
    (function (w, d, s, l, i) { w[l] = w[l] || []; w[l].push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0], j = d.createElement(s); j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i; f.parentNode.insertBefore(j, f); })(window, document, 'script', 'dataLayer', C.gtmId);
  }
  var form = document.getElementById('formulario');
  if (!form) return;
  var landing = document.body.getAttribute('data-landing') || 'unknown';
  var btn = form.querySelector('button[type=submit]');
  var label = btn ? btn.textContent : '';
  var msg = document.createElement('div');
  msg.setAttribute('role', 'status');
  msg.style.cssText = 'grid-column: span 2; font-size:14px; text-align:center; min-height:0;';
  form.appendChild(msg);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var v = function (n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; };
    var payload = {
      source: 'web_' + landing,
      landing: landing,
      name: v('nombre') || null,
      email: v('email') || null,
      phone: v('celular') || null,
      company: v('empresa') || null,
      raw_payload: {
        servicio: v('servicio'),
        consentimiento: !!(form.elements['consentimiento'] && form.elements['consentimiento'].checked),
        page: location.href, referrer: document.referrer || null,
        utm: Object.fromEntries(new URLSearchParams(location.search).entries()),
        ts: new Date().toISOString()
      }
    };
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
    msg.textContent = '';
    fetch(C.supabaseUrl + '/rest/v1/' + C.table, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: C.supabaseKey, Authorization: 'Bearer ' + C.supabaseKey, Prefer: 'return=minimal' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      form.reset();
      msg.style.color = '#3de3b1';
      msg.textContent = '¡Gracias! Recibimos tus datos y te contactaremos pronto.';
      if (window.dataLayer) window.dataLayer.push({ event: 'generate_lead', landing: landing });
    }).catch(function () {
      msg.style.color = '#ff8a8a';
      msg.textContent = 'No pudimos enviar el formulario. Inténtalo de nuevo o escríbenos por WhatsApp.';
    }).finally(function () { if (btn) { btn.disabled = false; btn.textContent = label; } });
  });
})();
