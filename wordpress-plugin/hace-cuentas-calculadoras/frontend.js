/**
 * Auto-resize de los iframes embebidos.
 *
 * El hub embebido postea su altura real vía postMessage. Escuchamos sólo
 * mensajes del origin de hacecuentas e identificamos el iframe por
 * `event.source`, así funcionan rutas con barras, redirects y embeds repetidos.
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
		var frames = document.querySelectorAll( '.hacecuentas-embed iframe' );
		for ( var i = 0; i < frames.length; i++ ) {
			if ( frames[ i ].contentWindow === e.source ) {
				frames[ i ].style.height = Math.max( 320, Math.min( 4000, e.data.height + 20 ) ) + 'px';
				break;
			}
		}
	} );
} )();
