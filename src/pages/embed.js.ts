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
    // Auto-resize por postMessage (el embed página postea su height)
    window.addEventListener('message', function(e) {
      if (e.origin !== ORIGIN) return;
      if (e.data && e.data.type === 'hc-embed-height' && e.data.slug === slug && typeof e.data.height === 'number') {
        ifr.style.height = Math.max(400, e.data.height + 20) + 'px';
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
