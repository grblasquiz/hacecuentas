<?php
/**
 * Plugin Name:       Hacé Cuentas — Calculadoras
 * Plugin URI:        https://hacecuentas.com/wordpress
 * Description:       Insertá calculadoras interactivas de Hacé Cuentas (sueldo, monotributo, aguinaldo, IMC, préstamos, IVA y +2700 más) en tus posts y páginas con un bloque o un shortcode. Gratis, sin registro, los cálculos corren en el navegador del visitante.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.2
 * Author:            Hacé Cuentas
 * Author URI:        https://hacecuentas.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       hacecuentas-calculadoras
 *
 * @package HaceCuentas
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No acceso directo.
}

define( 'HACECUENTAS_ORIGIN', 'https://hacecuentas.com' );
define( 'HACECUENTAS_VERSION', '1.0.0' );

/**
 * Devuelve el título de una calc a partir de su slug.
 *
 * Cachea el catálogo (calcs-slim.json) en un transient 12h para que el texto
 * ancla del backlink sea la keyword real ("Calculadora de monotributo 2026")
 * y no una versión fea del slug. Si la API no responde, hace fallback a
 * des-sluguear el slug.
 *
 * @param string $slug Slug saneado de la calc.
 * @return string Título legible.
 */
function hacecuentas_title_for( $slug ) {
	$map = get_transient( 'hacecuentas_titles' );

	if ( false === $map ) {
		$map = array();
		$res = wp_remote_get(
			HACECUENTAS_ORIGIN . '/api/calcs-slim.json',
			array( 'timeout' => 5 )
		);

		if ( ! is_wp_error( $res ) && 200 === wp_remote_retrieve_response_code( $res ) ) {
			$data = json_decode( wp_remote_retrieve_body( $res ), true );
			if ( is_array( $data ) ) {
				foreach ( $data as $c ) {
					// Sólo calcs AR (l === ''): son las que tienen /embed/<slug>.
					if ( isset( $c['s'], $c['t'] ) && empty( $c['l'] ) ) {
						$map[ $c['s'] ] = $c['t'];
					}
				}
			}
		}

		// Cacheamos aunque venga vacío (evita martillar la API si está caída).
		set_transient( 'hacecuentas_titles', $map, 12 * HOUR_IN_SECONDS );
	}

	if ( isset( $map[ $slug ] ) ) {
		return $map[ $slug ];
	}

	return ucfirst( str_replace( '-', ' ', $slug ) );
}

/**
 * Renderiza el embed: iframe de la calc + crédito con backlink followable.
 *
 * Usado por el bloque Gutenberg (render_callback) y por el shortcode.
 * El crédito vive FUERA del iframe (en la página anfitriona) → es un link
 * dofollow real, no queda atrapado en el iframe.
 *
 * @param string     $slug   Slug de la calc.
 * @param int|string $height Alto inicial del iframe en px (auto-resize después).
 * @return string HTML.
 */
function hacecuentas_render( $slug, $height = 640 ) {
	$slug = sanitize_title( $slug );
	if ( empty( $slug ) ) {
		return '';
	}

	$height = absint( $height );
	if ( $height < 320 ) {
		$height = 640;
	}

	// Script de auto-resize (escucha el postMessage del iframe). Sólo se encola
	// si hay al menos un embed en la página.
	if ( ! is_admin() ) {
		wp_enqueue_script( 'hacecuentas-frontend' );
	}

	$origin   = HACECUENTAS_ORIGIN;
	$embed    = esc_url( $origin . '/embed/' . $slug );
	$calc_url = esc_url( $origin . '/' . $slug );
	$home     = esc_url( $origin );
	$title    = hacecuentas_title_for( $slug );

	$out  = '<div class="hacecuentas-embed" data-hc-slug="' . esc_attr( $slug ) . '">';
	$out .= '<iframe src="' . $embed . '" width="100%" height="' . $height . '"'
		. ' style="border:1px solid #e2e8f0;border-radius:12px;width:100%;max-width:720px;display:block;margin:0 auto;background:#fff"'
		. ' loading="lazy" title="' . esc_attr( $title ) . '" allow="clipboard-write"></iframe>';
	$out .= '<p class="hacecuentas-credit"'
		. ' style="font-size:13px;text-align:center;margin:8px auto 0;max-width:720px;font-family:system-ui,-apple-system,sans-serif;color:#475569">';
	$out .= 'Calculadora de <a href="' . $calc_url . '" target="_blank" rel="noopener">' . esc_html( $title ) . '</a>';
	$out .= ' por <a href="' . $home . '" target="_blank" rel="noopener">Hacé Cuentas</a>';
	$out .= '</p>';
	$out .= '</div>';

	return $out;
}

/**
 * Registro: oEmbed provider, scripts del bloque y del frontend, y el bloque.
 */
function hacecuentas_init() {
	// 1. oEmbed provider — pegar cualquier URL de hacecuentas.com en el editor
	//    auto-embebe la calc (vía /oembed.json que devuelve type:"rich").
	wp_oembed_add_provider(
		HACECUENTAS_ORIGIN . '/*',
		HACECUENTAS_ORIGIN . '/oembed.json',
		false
	);

	// 2. Script del frontend (auto-resize). Registrado; se encola sólo cuando
	//    hay un embed en la página (ver hacecuentas_render).
	wp_register_script(
		'hacecuentas-frontend',
		plugins_url( 'frontend.js', __FILE__ ),
		array(),
		HACECUENTAS_VERSION,
		true
	);

	// 3. Script del editor (bloque Gutenberg, vanilla JS, sin build).
	wp_register_script(
		'hacecuentas-block',
		plugins_url( 'block.js', __FILE__ ),
		array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n' ),
		HACECUENTAS_VERSION,
		true
	);

	// 4. Bloque dinámico (render en PHP → el backlink no depende del save HTML).
	register_block_type(
		__DIR__,
		array(
			'render_callback' => 'hacecuentas_render_block',
		)
	);
}
add_action( 'init', 'hacecuentas_init' );

/**
 * render_callback del bloque.
 *
 * @param array $attrs Atributos del bloque (slug, height).
 * @return string HTML.
 */
function hacecuentas_render_block( $attrs ) {
	$slug   = isset( $attrs['slug'] ) ? $attrs['slug'] : '';
	$height = isset( $attrs['height'] ) ? $attrs['height'] : 640;

	if ( empty( $slug ) ) {
		// Bloque sin configurar: no mostramos nada en el frontend.
		return '';
	}

	return hacecuentas_render( $slug, $height );
}

/**
 * Shortcode: [hacecuentas slug="calculadora-monotributo-2026" height="640"]
 *
 * @param array $atts Atributos.
 * @return string HTML.
 */
function hacecuentas_shortcode( $atts ) {
	$a = shortcode_atts(
		array(
			'slug'   => '',
			'height' => 640,
		),
		$atts,
		'hacecuentas'
	);

	return hacecuentas_render( $a['slug'], $a['height'] );
}
add_shortcode( 'hacecuentas', 'hacecuentas_shortcode' );

/**
 * Link "Configurar / Ver calculadoras" en la lista de plugins.
 *
 * @param array $links Links existentes.
 * @return array
 */
function hacecuentas_plugin_links( $links ) {
	$links[] = '<a href="' . esc_url( HACECUENTAS_ORIGIN . '/calculadoras' ) . '" target="_blank" rel="noopener">'
		. esc_html__( 'Ver calculadoras', 'hacecuentas-calculadoras' ) . '</a>';
	return $links;
}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'hacecuentas_plugin_links' );
