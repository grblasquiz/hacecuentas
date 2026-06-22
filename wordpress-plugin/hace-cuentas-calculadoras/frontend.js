/**
 * Auto-resize de los iframes embebidos.
 *
 * El iframe (/embed/<slug>) postea su altura real vía postMessage. Escuchamos
 * sólo mensajes del origin de hacecuentas y ajustamos el iframe correspondiente
 * por su slug (data-hc-slug), así varios embeds en la misma página no se pisan.
 */
( function () {
	'use strict';

	if ( window.__hcEmbedInit ) {
		return;
	}
	window.__hcEmbedInit = true;

	var ORIGIN = 'https://hacecuentas.com';

	window.addEventListener( 'message', function ( e ) {
		if ( e.origin !== ORIGIN || ! e.data ) {
			return;
		}
		if ( e.data.type !== 'hc-embed-height' || typeof e.data.height !== 'number' ) {
			return;
		}
		var sel = '.hacecuentas-embed[data-hc-slug="' + e.data.slug + '"] iframe';
		var iframe = document.querySelector( sel );
		if ( iframe ) {
			iframe.style.height = Math.max( 320, e.data.height + 20 ) + 'px';
		}
	} );
} )();
