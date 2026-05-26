<?php
/**
 * Name: Webforms
 * Description: General-purpose JSON Form Runtime for Hubzilla. Initial implementation provides a blank PDL-backed runtime container at /webforms.
 * Version: 0.1.0
 * Author: Civic Affordances Diagnostics
 * Maintainer: TheRON <webmaster@kane-il.us>
 * MinVersion: 11.0
 * MaxVersion: 12.0
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
	if (!is_array($b) || empty($b['module']) || $b['module'] !== 'webforms') {
		return;
	}

	$layout = @file_get_contents('addon/webforms/mod_webforms.pdl');
	if ($layout !== false) {
		$b['layout'] = $layout;
	}
}

function webforms_content() {
	if (!local_channel()) {
		return '<div class="generic-content-wrapper-styled"><h1>Webforms</h1><p>Sign in to use Webforms.</p></div>';
	}

	if (class_exists('Zotlabs\\Lib\\Apps') && !Apps::addon_app_installed(local_channel(), 'webforms')) {
		$papp = Apps::get_papp('Webforms');
		return Apps::app_render($papp, 'module');
	}

	return '<div id="webforms-runtime" class="generic-content-wrapper-styled">'
		. '<h1>Webforms</h1>'
		. '<p>JSON Form Runtime container.</p>'
		. '<p>No JSON collection is loaded yet.</p>'
		. '<p>No form controls, storage, import, export, API, or Civic Infrastructure behavior is implemented in this layout test.</p>'
		. '</div>';
}
