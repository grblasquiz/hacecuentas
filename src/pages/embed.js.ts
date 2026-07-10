import type { APIRoute } from 'astro';

// Script loader para embebidos. Uso:
//   <div data-hc-embed="sueldo-en-mano-argentina"></div>
//   <script async src="https://hacecuentas.com/embed.js"></script>
// El script busca todos los <div data-hc-embed="..."> y los reemplaza por un iframe responsive.
const js = `(function(){
  var ORIGIN = 'https://hacecuentas.com';
  function buildIframe(slug, mount) {
    var ifr = document.createElement('iframe');
    ifr.src = ORIGIN + '/embed/' + slug;
    ifr.width = '100%';
    ifr.style.cssText = 'border:1px solid #e2e8f0;border-radius:12px;width:100%;max-width:720px;height:620px;display:block;margin:0 auto;background:#fff';
    ifr.setAttribute('loading', 'lazy');
    ifr.setAttribute('title', 'Calculadora de Hacé Cuentas');
    ifr.setAttribute('allow', 'clipboard-write');
    mount.innerHTML = '';
    mount.appendChild(ifr);
    // Crédito con backlink en la página anfitriona (fuera del iframe). rel="noopener sponsored":
    // atribución por servicio gratuito (política de widgets de Google), no un link editorial ganado.
    // Marca → home + nombre de la calc (keyword) → la página de ESA calc.
    var credit = document.createElement('p');
    credit.style.cssText = 'font-size:13px;text-align:center;margin:8px auto 0;max-width:720px;font-family:system-ui,-apple-system,sans-serif;color:#475569';
    credit.innerHTML = 'Powered by <a href="' + ORIGIN + '" target="_blank" rel="noopener sponsored">Hacé Cuentas</a> — <a href="' + ORIGIN + '/' + slug + '" target="_blank" rel="noopener sponsored" data-hc-deep>' + slug.replace(/-/g, ' ') + '</a>';
    mount.appendChild(credit);
    // Auto-resize + nombre real de la calc por postMessage (el embed página los postea).
    window.addEventListener('message', function(e) {
      if (e.origin !== ORIGIN) return;
      if (!e.data || e.data.slug !== slug) return;
      if (e.data.type === 'hc-embed-height' && typeof e.data.height === 'number') {
        ifr.style.height = Math.max(400, e.data.height + 20) + 'px';
      }
      if (e.data.type === 'hc-embed-meta' && e.data.name) {
        var d = credit.querySelector('[data-hc-deep]');
        if (d) d.textContent = e.data.name;
      }
    });
  }
  function init() {
    var mounts = document.querySelectorAll('[data-hc-embed]');
    for (var i = 0; i < mounts.length; i++) {
      var slug = mounts[i].getAttribute('data-hc-embed');
      if (slug) buildIframe(slug, mounts[i]);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();`;

export const GET: APIRoute = () => {
  return new Response(js, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
