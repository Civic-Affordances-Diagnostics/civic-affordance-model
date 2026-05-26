<?php
/**
 * Name: Webforms
 * Description: General-purpose JSON Form Runtime for Hubzilla. Initial implementation provides a blank PDL-backed runtime container at /webforms.
 * Version: 0.1.0
 * Author: Civic Affordances Diagnostics
 * Maintainer: TheRON <webmaster@kane-il.us>
 * MinVersion: 11.0
 * MaxVersion: 12.0
 * Requires: local_channel
 */

use Zotlabs\Lib\Apps;

function webforms_module() {}

function webforms_load() {
	register_hook('load_pdl', 'addon/webforms/webforms.php', 'webforms_load_pdl');
}

function webforms_unload() {
	unregister_hook('load_pdl', 'addon/webforms/webforms.php', 'webforms_load_pdl');
}

function webforms_load_pdl(&$b) {
	if (($b['module'] ?? '') !== 'webforms') {
		return;
	}

	$pdl = 'addon/webforms/mod_webforms.pdl';
	if (file_exists($pdl)) {
		$b['layout'] = file_get_contents($pdl);
	}
}

function webforms_content() {
	if (!local_channel()) {
		notice(t('Permission denied.') . EOL);
		return '';
	}

	if (class_exists('Zotlabs\\Lib\\Apps') && !Apps::addon_app_installed(local_channel(), 'webforms')) {
		$papp = Apps::get_papp('Webforms');
		return Apps::app_render($papp, 'module');
	}

	return webforms_blank_container();
}

function webforms_blank_container() {
	$o = '<div class="generic-content-wrapper-styled" id="webforms-page">';
	$o .= '<h1>' . t('Webforms') . '</h1>';
	$o .= '<div id="webforms-runtime-container" class="webforms-runtime-container" data-webforms-runtime="blank">';
	$o .= '<p>' . t('JSON Form Runtime container is available.') . '</p>';
	$o .= '<p>' . t('No JSON collection is loaded yet.') . '</p>';
	$o .= '</div>';
	$o .= '</div>';

	return $o;
}
