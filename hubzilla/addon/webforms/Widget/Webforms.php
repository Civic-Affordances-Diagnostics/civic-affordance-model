<?php

namespace Zotlabs\Widget;

class Webforms {

	private $config = null;

	public function widget($args) {
		$mode = $this->current_mode();

		if ($mode === 'deploy') {
			return $this->deploy_widget();
		}

		return $this->design_widget();
	}

	private function config() {
		if ($this->config === null) {
			$this->config = require __DIR__ . '/../include/webforms-config.php';
		}

		return $this->config;
	}

	private function current_mode() {
		if (isset($_GET['mode']) && $_GET['mode'] === 'deploy') {
			return 'deploy';
		}

		return 'design';
	}

	private function safe_query_value($name) {
		if (!isset($_GET[$name])) {
			return '';
		}

		return preg_replace('/[^a-z0-9_-]/', '', $_GET[$name]);
	}

	private function h($value) {
		return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
	}

	private function json_attr($value) {
		return $this->h(json_encode($value, JSON_UNESCAPED_SLASHES));
	}

	private function design_tabs() {
		return $this->config()['design_tabs'];
	}

	private function service_pack_options() {
		return $this->config()['service_pack_options'];
	}

	private function form_options($service_pack) {
		$forms_by_service_pack = $this->config()['deploy_form_options_by_service_pack'];

		return $forms_by_service_pack[$service_pack] ?? ['' => 'Select webform'];
	}

	private function service_pack_for_form($form_id) {
		$forms_by_service_pack = $this->config()['deploy_form_options_by_service_pack'];

		foreach ($forms_by_service_pack as $service_pack => $forms) {
			if ($service_pack !== '' && array_key_exists($form_id, $forms)) {
				return $service_pack;
			}
		}

		return '';
	}

	private function current_service_pack_for($form_query_name) {
		$service_pack = $this->safe_query_value('service_pack');

		if ($service_pack !== '') {
			return $service_pack;
		}

		$legacy_collection = $this->safe_query_value('collection');

		if ($legacy_collection !== '') {
			return $legacy_collection;
		}

		return $this->service_pack_for_form($this->safe_query_value($form_query_name));
	}

	private function toolbar_tools($design_tab) {
		$toolbars = $this->config()['toolbars'];

		return $toolbars[$design_tab] ?? $toolbars['grid'];
	}

	private function current_design_tab() {
		$design_tab = $this->safe_query_value('design_tab');

		if (!array_key_exists($design_tab, $this->design_tabs())) {
			return 'grid';
		}

		return $design_tab;
	}

	private function package_path_for_deploy_form($service_pack, $deploy_form) {
		$paths_by_service_pack = $this->config()['deploy_package_paths_by_service_pack'] ?? [];

		if (!isset($paths_by_service_pack[$service_pack][$deploy_form])) {
			return '';
		}

		$path = $paths_by_service_pack[$service_pack][$deploy_form];

		if (!preg_match('/^[a-z0-9_\-\/]+\.json$/', $path)) {
			return '';
		}

		return $path;
	}

	private function package_url_for_form($service_pack, $form_id) {
		$path = $this->package_path_for_deploy_form($service_pack, $form_id);

		if ($path === '') {
			return '';
		}

		return '/addon/webforms/' . $path . '?v=0.1';
	}

	private function options_by_service_pack_for_client() {
		$out = [];
		$forms_by_service_pack = $this->config()['deploy_form_options_by_service_pack'];

		foreach ($forms_by_service_pack as $service_pack => $forms) {
			$out[$service_pack] = [];

			foreach ($forms as $value => $label) {
				$out[$service_pack][] = [
					'value' => $value,
					'label' => $label,
					'package_url' => $this->package_url_for_form($service_pack, $value),
				];
			}
		}

		return $out;
	}

	private function select_options($options, $current) {
		$out = '';

		foreach ($options as $value => $label) {
			$selected = ($current === $value) ? ' selected="selected"' : '';
			$out .= '<option value="' . $this->h($value) . '"' . $selected . '>' . $this->h($label) . '</option>';
		}

		return $out;
	}

	private function form_select_options($service_pack, $options, $current) {
		$out = '';

		foreach ($options as $value => $label) {
			$selected = ($current === $value) ? ' selected="selected"' : '';
			$package_url = $this->package_url_for_form($service_pack, $value);
			$out .= '<option value="' . $this->h($value) . '" data-webforms-package-url="' . $this->h($package_url) . '"' . $selected . '>' . $this->h($label) . '</option>';
		}

		return $out;
	}

	private function mode_selector($active_mode, $service_pack = '', $form_id = '') {
		$design_class = ($active_mode === 'design') ? 'btn btn-primary' : 'btn btn-outline-secondary';
		$deploy_class = ($active_mode === 'deploy') ? 'btn btn-primary' : 'btn btn-outline-secondary';
		$design_href = 'webforms?mode=design';
		$deploy_href = 'webforms?mode=deploy';

		if ($service_pack !== '') {
			$design_href .= '&service_pack=' . rawurlencode($service_pack);
			$deploy_href .= '&service_pack=' . rawurlencode($service_pack);
		}

		if ($form_id !== '') {
			$design_href .= '&design_form=' . rawurlencode($form_id);
			$deploy_href .= '&deploy_form=' . rawurlencode($form_id);
		}

		return '<div class="mb-3"><label class="form-label d-block">Mode</label><div class="btn-group btn-group-sm" role="group"><a class="' . $design_class . '" href="' . $this->h($design_href) . '">Design</a><a class="' . $deploy_class . '" href="' . $this->h($deploy_href) . '">Deploy</a></div></div>';
	}

	private function design_widget() {
		$service_pack = $this->current_service_pack_for('design_form');
		$design_form = $this->safe_query_value('design_form');

		if (!array_key_exists($service_pack, $this->service_pack_options())) {
			$service_pack = '';
		}

		$form_options = $this->form_options($service_pack);

		if (!array_key_exists($design_form, $form_options)) {
			$design_form = '';
		}

		$design_tab = $this->current_design_tab();

		return '
			<h3>Webforms</h3>

			' . $this->mode_selector('design', $service_pack, $design_form) . '
			<div id="webforms-design-selector" class="mb-3" data-webforms-design-options="' . $this->json_attr($this->options_by_service_pack_for_client()) . '">
				<label class="form-label" for="webforms-design-service-pack-select">Service Pack</label>
				<select id="webforms-design-service-pack-select" class="form-control form-control-sm mb-2">' . $this->select_options($this->service_pack_options(), $service_pack) . '</select>

				<label class="form-label" for="webforms-design-form-select">Webform</label>
				<select id="webforms-design-form-select" class="form-control form-control-sm">' . $this->form_select_options($service_pack, $form_options, $design_form) . '</select>

				<p class="small text-muted mt-2">Selecting a Webform loads a browser-local working copy. It does not submit or write to Hubzilla.</p>
			</div>

			<hr>

			' . $this->toolbar_matrix($design_tab) . '

			<hr>

			<div id="webforms-design-selection" class="webforms-selected-object-panel"><p class="text-muted">No object selected.</p></div>
		';
	}

	private function toolbar_matrix($design_tab) {
		$tools = $this->toolbar_tools($design_tab);
		$out = '<div class="webforms-toolbar-grid" data-webforms-toolbar="' . $this->h($design_tab) . '">';

		for ($i = 0; $i < 15; $i++) {
			if (isset($tools[$i])) {
				$tool = $tools[$i];
				$disabled = !empty($tool['active']) ? '' : ' disabled="disabled"';
				$out .= '<button type="button" class="btn btn-sm btn-outline-secondary webforms-tool" data-webforms-tool="' . $this->h($tool['key']) . '" title="' . $this->h($tool['title']) . '"' . $disabled . '>' . $this->h($tool['label']) . '</button>';
			} else {
				$out .= '<span class="webforms-tool-empty">&nbsp;</span>';
			}
		}

		$out .= '</div>';

		return $out;
	}

	private function deploy_widget() {
		$service_pack = $this->current_service_pack_for('deploy_form');
		$deploy_form = $this->safe_query_value('deploy_form');

		if (!array_key_exists($service_pack, $this->service_pack_options())) {
			$service_pack = '';
		}

		$deploy_form_options = $this->form_options($service_pack);

		if (!array_key_exists($deploy_form, $deploy_form_options)) {
			$deploy_form = '';
		}

		return '
			<h3>Webforms</h3>

			' . $this->mode_selector('deploy', $service_pack, $deploy_form) . '

			<h4>Deploy</h4>
			<div id="webforms-deploy-navigation" class="mb-3" data-webforms-deploy-options="' . $this->json_attr($this->options_by_service_pack_for_client()) . '">
				<label class="form-label" for="webforms-deploy-service-pack-select">Service Pack</label>
				<select id="webforms-deploy-service-pack-select" class="form-control form-control-sm mb-2">' . $this->select_options($this->service_pack_options(), $service_pack) . '</select>

				<label class="form-label" for="webforms-deploy-form-select">Webform</label>
				<select id="webforms-deploy-form-select" class="form-control form-control-sm">' . $this->form_select_options($service_pack, $deploy_form_options, $deploy_form) . '</select>

				<p class="small text-muted mt-2">Selecting a Webform loads its JSON interface in this page. No submit or service execution is active.</p>
			</div>
		';
	}
}
