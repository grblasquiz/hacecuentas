<?php
/**
 * Limpieza al desinstalar el plugin.
 *
 * @package HaceCuentas
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_transient( 'hacecuentas_titles' );
