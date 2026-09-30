/* Formulario de las landings /b2c y /b2b → Supabase (public.leads_raw). Requiere config.js */
(function () {
  'use strict';
  var C = window.JL_CONFIG || {};
  var form = document.getElementById('formulario');
  if (!form || form.tagName !== 'FORM') return;
  var page = document.body.getAttribute('data-page') || 'landing';
  var btn = form.querySelector('button[type=submit]');
  var label = btn ? btn.innerHTML : '';
  var msg = document.createElement('div');
  msg.setAttribute('role', 'alert');
  msg.style.cssText = 'grid-column:1/-1;font-size:13px;line-height:1.4;color:#ff8a80;min-height:0';
  form.appendChild(msg);
  form.setAttribute('novalidate', '');
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function v(n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; }
  function store(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function track(e, p) { window.dataLayer = window.dataLayer || []; var o = { event: e }; for (var k in p) o[k] = p[k]; window.dataLayer.push(o); }
  var started = false;
  form.addEventListener('focusin', function () { if (!started) { started = true; track('form_start', { pagina: page }); } });
  function check() {
    if (v('nombre').length < 3) return ['nombre', 'Escribe tu nombre y apellido.'];
    if (!EMAIL.test(v('email'))) return ['email', 'Revisa el correo: debe tener el formato nombre@empresa.com.'];
    var d = v('celular').replace(/\D/g, '');
    if (d && (d.length < 9 || d.length > 12)) return ['celular', 'Ingresa un celular de 9 dígitos, por ejemplo 987 654 321.'];
    if (!v('servicio')) return ['servicio', 'Elige qué servicio te interesa.'];
    if (!form.elements.consentimiento.checked) return ['consentimiento', 'Necesitamos tu autorización para contactarte.'];
    return null;
  }
  function phone(x) { var d = x.replace(/\D/g, ''); if (!d) return null; return d.length === 9 && d[0] === '9' ? '+51' + d : '+' + d; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.textContent = '';
    var bad = check();
    if (bad) { msg.textContent = bad[1]; form.elements[bad[0]].focus(); track('form_error', { campo: bad[0], pagina: page }); return; }
    if (form.elements.sitio_web && form.elements.sitio_web.value) return;
    var at = store('jl_attribution_v1') || { values: {} };
    var payload = {
      source: 'web_' + page, landing: page,
      name: v('nombre'), email: v('email').toLowerCase(), phone: phone(v('celular')), company: v('empresa') || null,
      raw_payload: {
        servicio: v('servicio'), consentimiento: true,
        consentimiento_fecha: new Date().toISOString(),
        url: location.href.split('#')[0], referrer: at.referrer || document.referrer || '',
        landing_inicial: at.landing || '', atribucion: at.values || {}
      }
    };
    btn.disabled = true; btn.innerHTML = 'Enviando…';
    function ok() {
      try { sessionStorage.setItem('jl_lead', JSON.stringify({ nombre: payload.name.split(' ')[0], contacto: payload.phone ? 'WhatsApp' : 'correo' })); } catch (x) {}
      track('generate_lead', { servicio: v('servicio'), pagina: page });
      setTimeout(function () { location.href = C.thankYouPage || '/gracias'; }, 250);
    }
    function fail() {
      btn.disabled = false; btn.innerHTML = label;
      msg.textContent = 'No pudimos enviar tu consulta. Revisa tu conexión e inténtalo de nuevo o escríbenos por WhatsApp.';
      track('form_submit_error', { pagina: page });
    }
    if (!C.supabaseUrl) { ok(); return; }
    fetch(C.supabaseUrl + '/rest/v1/' + (C.supabaseTable || 'leads_raw'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: C.supabaseKey, Authorization: 'Bearer ' + C.supabaseKey, Prefer: 'return=minimal' },
      body: JSON.stringify(payload)
    }).then(function (r) { if (r.ok) ok(); else fail(); }).catch(fail);
  });
})();
