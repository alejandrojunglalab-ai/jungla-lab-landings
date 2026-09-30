# Jungla Lab · landings

- `/` prelanding · `/b2c` · `/b2b`
- Estático, sin build. Deploy: push a `main` → Vercel.
- Config en `assets/js/config.js` (Supabase, GTM, WhatsApp). Leads → `public.leads_raw` (anon INSERT-only).

## Estado: OCULTO (noindex)
Antes de lanzar: quitar `<meta name="robots">` de los 3 HTML, el header `X-Robots-Tag` en `vercel.json`, y vaciar `robots.txt`; añadir `sitemap.xml`.

## Pendientes
- WhatsApp real (`51XXXXXXXXX` en los HTML y config.js)
- Enlace "Políticas de privacidad" (`href="#"`)
- Revisar cifras/casos de prueba (p. ej. "2.8x IBM") con datos verificados
- GTM/GA4 id · fotos de fondo · versión móvil (hoy viewport fijo 1440)
