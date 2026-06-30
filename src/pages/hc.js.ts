import type { APIRoute } from 'astro';

// ────────────────────────────────────────────────────────────────────────────
// Partner Studio — Web Component <hace-cuentas>
//
// Evolución del embed por iframe (/embed.js): en lugar de "copiá y pegá este
// iframe", el partner declara un custom element y obtiene un producto de
// distribución con tema, prefill, eventos y callback al sistema del partner.
//
//   <script async src="https://hacecuentas.com/hc.js"></script>
//   <hace-cuentas
//     calculator="calculadora-sueldo-en-mano-argentina"
//     accent="#d2122e"
//     logo="https://medio.com/logo.svg"
//     title="Calculá tu sueldo en mano"
//     cta-label="Mirá más notas de economía"
//     cta-url="https://medio.com/economia"
//     partner-id="medio-123"
//     prefill='{"sueldoBruto":"1500000"}'>
//   </hace-cuentas>
//
// Eventos DOM (bubbles) que emite el elemento:
//   hc:ready      — el iframe cargó y la calculadora está lista
//   hc:calculate  — el usuario calculó { primary, slug }
//   hc:share      — el usuario compartió/copió { action }
//   hc:complete   — el usuario tocó el CTA del partner { cta }
//
// También invoca handlers inline (oncalculate / onshare / oncomplete) y
// propiedades asignadas (el.oncalculate = fn) — best-effort, según CSP.
//
// Atribución: el crédito "Powered by Hacé Cuentas" vive en la página anfitriona
// (backlink real, fuera del iframe). Sólo se puede ocultar (no-attribution) si
// el partner-id está autorizado en /partners/<id>.json y el dominio coincide.
// ────────────────────────────────────────────────────────────────────────────

const js = `(function(){
  "use strict";
  var ORIGIN = (function(){
    try {
      var s = document.currentScript && document.currentScript.src;
      if (s) return new URL(s).origin;
    } catch(e){}
    return 'https://hacecuentas.com';
  })();

  var RESERVED = { accent:1, theme:1, logo:1, title:1, cta:1, ctaurl:1, partner:1, noattr:1, country:1, autocalc:1 };
  var partnerCache = {};

  function hostAuthorized(domains){
    if (!domains || !domains.length) return false;
    var h = (location.hostname || '').replace(/^www\\./,'').toLowerCase();
    for (var i=0;i<domains.length;i++){
      var d = String(domains[i]||'').replace(/^www\\./,'').toLowerCase();
      if (d === '*') return true;
      if (d === h) return true;
      if (d.charAt(0) === '.' && (h === d.slice(1) || h.indexOf(d.slice(1)) === h.length - d.slice(1).length)) return true;
    }
    return false;
  }

  function fetchPartner(id){
    if (!id) return Promise.resolve(null);
    if (partnerCache[id]) return partnerCache[id];
    partnerCache[id] = fetch(ORIGIN + '/partners/' + encodeURIComponent(id) + '.json', { credentials:'omit' })
      .then(function(r){ return r.ok ? r.json() : null; })
      .catch(function(){ return null; });
    return partnerCache[id];
  }

  function validHex(v){ return typeof v === 'string' && /^#?[0-9a-fA-F]{3,8}$/.test(v); }
  function validHttps(v){ return typeof v === 'string' && /^https:\\/\\//.test(v); }

  // Construye la query string del /embed/<slug> desde los atributos + prefill.
  function buildQuery(host, partnerCfg){
    var p = new URLSearchParams();
    function attr(name){ return host.getAttribute(name); }

    // Tema: accent del atributo, o default del partner.
    var accent = attr('accent') || attr('theme') || (partnerCfg && partnerCfg.accent);
    if (validHex(accent)) p.set('accent', accent.charAt(0) === '#' ? accent : '#' + accent);

    var logo = attr('logo') || (partnerCfg && partnerCfg.logo);
    if (validHttps(logo)) p.set('logo', logo);

    var title = attr('title');
    if (title) p.set('title', title);

    var country = attr('country');
    if (country) p.set('country', country);

    var ctaLabel = attr('cta-label');
    var ctaUrl = attr('cta-url');
    if (ctaLabel && validHttps(ctaUrl)) { p.set('cta', ctaLabel); p.set('ctaurl', ctaUrl); }

    var partnerId = attr('partner-id');
    if (partnerId) p.set('partner', partnerId);

    // Sin atribución: SOLO si el partner está autorizado y el dominio coincide.
    var wantsNoAttr = host.hasAttribute('no-attribution');
    if (wantsNoAttr && partnerCfg && partnerCfg.attributionWaived && hostAuthorized(partnerCfg.authorizedDomains)) {
      p.set('noattr', '1');
    }

    // Prefill: JSON en el atributo prefill {fieldName: value}.
    var prefillRaw = attr('prefill');
    if (prefillRaw) {
      try {
        var obj = JSON.parse(prefillRaw);
        for (var k in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, k) && !RESERVED[k.toLowerCase()]) {
            p.set(k, String(obj[k]));
          }
        }
      } catch(e){}
    }
    // Prefill alternativo: atributos f-<fieldName>="..."
    var attrs = host.attributes;
    for (var i=0;i<attrs.length;i++){
      var a = attrs[i];
      if (a.name.indexOf('f-') === 0) p.set(a.name.slice(2), a.value);
    }

    return p.toString();
  }

  function getSlug(host){
    return host.getAttribute('calculator') || host.getAttribute('slug') || '';
  }

  function dispatch(host, type, detail){
    try {
      host.dispatchEvent(new CustomEvent('hc:' + type, { detail: detail, bubbles: true, composed: true }));
    } catch(e){}
    // Handler como propiedad asignada: el.oncalculate = fn
    var prop = host['on' + type];
    if (typeof prop === 'function') { try { prop.call(host, { detail: detail }); } catch(e){} }
    // Handler inline como atributo: oncalculate="..." (best-effort; puede bloquear CSP)
    var inline = host.getAttribute('on' + type);
    if (inline) {
      try { (new Function('event', 'detail', inline)).call(host, { detail: detail }, detail); } catch(e){}
    }
    // Analytics opcional al gtag/dataLayer del partner.
    if (host.hasAttribute('analytics')) {
      try {
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'hc_' + type, { hc_slug: getSlug(host), hc_partner: host.getAttribute('partner-id') || '' });
        } else if (window.dataLayer && window.dataLayer.push) {
          window.dataLayer.push({ event: 'hc_' + type, hc_slug: getSlug(host), hc_partner: host.getAttribute('partner-id') || '' });
        }
      } catch(e){}
    }
  }

  function render(host){
    var slug = getSlug(host);
    if (!slug) { host.innerHTML = '<p style="color:#dc2626;font:14px system-ui">[hace-cuentas] falta el atributo calculator</p>'; return; }

    var partnerId = host.getAttribute('partner-id');
    var wantsNoAttr = host.hasAttribute('no-attribution');
    // Si pide ocultar atribución necesitamos la config del partner ANTES de armar
    // el iframe (para no recargar). Si no, render inmediato.
    var needCfg = !!(partnerId && (wantsNoAttr || !host.getAttribute('accent')));
    if (needCfg) {
      fetchPartner(partnerId).then(function(cfg){ mount(host, slug, cfg); });
    } else {
      mount(host, slug, null);
    }
  }

  function mount(host, slug, partnerCfg){
    var q = buildQuery(host, partnerCfg);
    var src = ORIGIN + '/embed/' + slug + (q ? ('?' + q) : '');

    var ifr = host.querySelector('iframe[data-hc-frame]');
    var fresh = false;
    if (!ifr) {
      fresh = true;
      ifr = document.createElement('iframe');
      ifr.setAttribute('data-hc-frame', '1');
      ifr.setAttribute('loading', 'lazy');
      ifr.setAttribute('title', 'Calculadora de Hacé Cuentas');
      ifr.setAttribute('allow', 'clipboard-write');
      var initH = parseInt(host.getAttribute('height') || '', 10);
      ifr.style.cssText = 'border:1px solid #e2e8f0;border-radius:12px;width:100%;max-width:720px;height:' + (initH > 0 ? initH : 620) + 'px;display:block;margin:0 auto;background:#fff';
    }
    ifr.src = src;
    host._hcSlug = slug;

    if (fresh) {
      host.innerHTML = '';
      host.style.display = 'block';
      host.appendChild(ifr);

      // Crédito/backlink en la página anfitriona (fuera del iframe = link followable).
      // Se omite si el partner está autorizado a no-attribution (noattr en la query).
      if (q.indexOf('noattr=1') === -1) {
        var credit = document.createElement('p');
        credit.setAttribute('data-hc-credit', '1');
        credit.style.cssText = 'font-size:13px;text-align:center;margin:8px auto 0;max-width:720px;font-family:system-ui,-apple-system,sans-serif;color:#475569';
        credit.innerHTML = 'Powered by <a href="' + ORIGIN + '" target="_blank" rel="noopener">Hacé Cuentas</a> — <a href="' + ORIGIN + '/' + slug + '" target="_blank" rel="noopener" data-hc-deep>' + slug.replace(/-/g, ' ') + '</a>';
        host.appendChild(credit);
      }

      ifr.addEventListener('load', function(){ dispatch(host, 'ready', { slug: slug }); });
    }
  }

  // Un solo listener global para todos los mensajes de los iframes de hacecuentas.
  window.addEventListener('message', function(e){
    if (e.origin !== ORIGIN || !e.data) return;
    var data = e.data;
    var slug = data.slug;
    if (!slug) return;
    // Buscar el <hace-cuentas> dueño de este slug.
    var hosts = document.querySelectorAll('hace-cuentas');
    for (var i=0;i<hosts.length;i++){
      var host = hosts[i];
      if (host._hcSlug !== slug) continue;
      var ifr = host.querySelector('iframe[data-hc-frame]');
      if (data.type === 'hc-embed-height' && typeof data.height === 'number' && ifr) {
        ifr.style.height = Math.max(400, data.height + 20) + 'px';
      } else if (data.type === 'hc-embed-meta' && data.name) {
        var d = host.querySelector('[data-hc-deep]');
        if (d) d.textContent = data.name;
      } else if (data.type === 'hc-embed-event' && data.event) {
        dispatch(host, data.event, data.detail || {});
      }
    }
  });

  // Definición del custom element.
  if ('customElements' in window && !customElements.get('hace-cuentas')) {
    var HaceCuentas = function(){ return Reflect.construct(HTMLElement, [], HaceCuentas); };
    HaceCuentas.prototype = Object.create(HTMLElement.prototype);
    HaceCuentas.prototype.constructor = HaceCuentas;
    HaceCuentas.prototype.connectedCallback = function(){ if (!this._hcMounted) { this._hcMounted = true; render(this); } };
    // API imperativa: el.recalculate({campo:valor}) actualiza prefill y recalcula.
    HaceCuentas.prototype.recalculate = function(values){
      if (values && typeof values === 'object') {
        try { this.setAttribute('prefill', JSON.stringify(values)); } catch(e){}
      }
      render(this);
    };
    HaceCuentas.observedAttributes = ['calculator','slug','accent','theme','logo','title','prefill','country','cta-label','cta-url','no-attribution','partner-id'];
    HaceCuentas.prototype.attributeChangedCallback = function(){ if (this._hcMounted) render(this); };
    try { customElements.define('hace-cuentas', HaceCuentas); }
    catch(e){
      // Fallback ES6 class si Reflect.construct no está disponible (muy viejo).
      customElements.define('hace-cuentas', class extends HTMLElement {
        connectedCallback(){ if (!this._hcMounted) { this._hcMounted = true; render(this); } }
        recalculate(values){ if (values) { try { this.setAttribute('prefill', JSON.stringify(values)); } catch(e){} } render(this); }
      });
    }
  }

  // Back-compat: soporta el patrón viejo <div data-hc-embed="slug"> (como /embed.js),
  // así hc.js es un superset y los partners pueden migrar a un solo script.
  function legacyInit(){
    var mounts = document.querySelectorAll('[data-hc-embed]');
    for (var i=0;i<mounts.length;i++){
      var mount = mounts[i];
      if (mount._hcLegacy) continue;
      mount._hcLegacy = true;
      var slug = mount.getAttribute('data-hc-embed');
      if (!slug) continue;
      var ifr = document.createElement('iframe');
      ifr.src = ORIGIN + '/embed/' + slug;
      ifr.style.cssText = 'border:1px solid #e2e8f0;border-radius:12px;width:100%;max-width:720px;height:620px;display:block;margin:0 auto;background:#fff';
      ifr.setAttribute('loading','lazy');
      ifr.setAttribute('title','Calculadora de Hacé Cuentas');
      ifr.setAttribute('allow','clipboard-write');
      mount.innerHTML = '';
      mount.appendChild(ifr);
      mount._hcSlug = slug;
      var credit = document.createElement('p');
      credit.style.cssText = 'font-size:13px;text-align:center;margin:8px auto 0;max-width:720px;font-family:system-ui,-apple-system,sans-serif;color:#475569';
      credit.innerHTML = 'Powered by <a href="' + ORIGIN + '" target="_blank" rel="noopener">Hacé Cuentas</a> — <a href="' + ORIGIN + '/' + slug + '" target="_blank" rel="noopener" data-hc-deep>' + slug.replace(/-/g,' ') + '</a>';
      mount.appendChild(credit);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', legacyInit);
  else legacyInit();
})();`;

export const GET: APIRoute = () => {
  return new Response(js, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
