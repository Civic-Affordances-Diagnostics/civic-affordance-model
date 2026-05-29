<?php

/**
 * Name: Webforms
 * Description: JSON-Composed Web Forms placeholder for Hubzilla.
 * Version: 0.0.1
 * MinVersion: 11.0
 * MaxVersion: 12.0
 */

use Zotlabs\Extend\Widget;

require_once __DIR__ . '/include/webforms-render.php';

function webforms_module() {}

function webforms_load() {
	register_hook('load_pdl', 'addon/webforms/webforms.php', 'webforms_load_pdl');
	Widget::register('addon/webforms/Widget/Webforms.php', 'webforms');
}

function webforms_unload() {
	unregister_hook('load_pdl', 'addon/webforms/webforms.php', 'webforms_load_pdl');
	Widget::unregister('addon/webforms/Widget/Webforms.php', 'webforms');
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

function webforms_config() {
	static $config = null;

	if ($config === null) {
		$config = require __DIR__ . '/include/webforms-config.php';
	}

	return $config;
}

function webforms_config_section($name) {
	$config = webforms_config();
	return $config[$name] ?? [];
}

function webforms_config_label($section, $key, $fallback = '') {
	$values = webforms_config_section($section);

	if (array_key_exists($key, $values)) {
		return $values[$key];
	}

	return $fallback;
}

function webforms_current_mode() {
	if (isset($_GET['mode']) && $_GET['mode'] === 'deploy') {
		return 'deploy';
	}

	return 'design';
}

function webforms_access_state() {
	return local_channel() ? 'logged-in' : 'public';
}

function webforms_safe_query_value($name) {
	if (!isset($_GET[$name])) {
		return '';
	}

	return preg_replace('/[^a-z0-9_-]/', '', $_GET[$name]);
}

function webforms_h($value) {
	return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function webforms_content() {
	$mode = webforms_current_mode();

	if ($mode === 'deploy') {
		webforms_add_deploy_assets();
		return webforms_render_deploy_page(
			webforms_safe_query_value('collection'),
			webforms_safe_query_value('deploy_form')
		);
	}

	webforms_add_design_assets();
	return webforms_render_design_page(
		webforms_safe_query_value('design_form'),
		webforms_safe_query_value('design_tab')
	);
}

function webforms_add_design_assets() {
	if (function_exists('head_add_css')) {
		head_add_css('/addon/webforms/view/css/webforms.css?v=css-extract-1');
	}

	if (function_exists('head_add_js')) {
		head_add_js('/addon/webforms/view/js/webforms-design-state.js?v=hard-recovery-1');
		head_add_js('/addon/webforms/view/js/webforms-design-draft.js?v=hard-recovery-1');
		head_add_js('/addon/webforms/view/js/webforms-design-session.js?v=hard-recovery-1');
		head_add_js('/addon/webforms/view/js/webforms-package-shared.js?v=hard-recovery-1');
		head_add_js('/addon/webforms/view/js/webforms-design-package.js?v=hard-recovery-1');
		head_add_js('/addon/webforms/view/js/webforms-design-grid.js?v=textarea-1');
		head_add_js('/addon/webforms/view/js/webforms-design-properties.js?v=textarea-default-1');
		head_add_js('/addon/webforms/view/js/webforms-design-json.js?v=hard-recovery-1');
		head_add_js('/addon/webforms/view/js/webforms-design.js?v=hard-recovery-1');
	}
}

function webforms_add_deploy_assets() {
	if (function_exists('head_add_css')) {
		head_add_css('/addon/webforms/view/css/webforms.css?v=css-extract-1');
	}

	if (function_exists('head_add_js')) {
		head_add_js('/addon/webforms/view/js/webforms-package-shared.js?v=hard-recovery-1');
		head_add_js('/addon/webforms/view/js/webforms-deploy.js?v=textarea-1');
	}
}
