/* ============================================================
   Jungla Lab · configuración del sitio
   Este es el ÚNICO archivo que hay que editar antes de publicar.
   ============================================================ */
window.JL_CONFIG = {
  /* URL del webhook que recibe el formulario (por ejemplo, un Webhook de n8n en tu VPS).
     Mientras esté vacío, el sitio funciona en modo demo: valida el formulario y lleva a la
     página de gracias, pero no envía los datos a ningún lado. */
  formEndpoint: '',

  /* Número de WhatsApp con código de país, solo dígitos (Perú = 51). */
  whatsappNumber: '51XXXXXXXXX',
  whatsappText: 'Hola Jungla Lab, quiero conversar sobre cómo hacer crecer mi negocio.',

  /* Contenedor de Google Tag Manager (GTM-XXXXXXX). Vacío = no se carga ninguna etiqueta.
     GA4, el píxel de Meta y el Insight Tag de LinkedIn se configuran dentro de GTM. */
  gtmId: 'GTM-NQWTKL9H',

  /* Prueba A/B del titular del hero: true = mitad de visitantes ve la variante B. */
  abTestHeadline: true,

  /* Días que se recuerda la campaña de origen (UTM y clic de anuncio). */
  attributionDays: 90,

  /* Página a la que se redirige tras enviar el formulario. */
  thankYouPage: 'gracias.html'
};
