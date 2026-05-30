<?php

/**
 * Name: Webforms sidebar
 * Description: Display Design or Deploy controls for the webforms addon
 * Requires: webforms
 */

namespace Zotlabs\Widget;

class Webforms {
    private $config = null;

    function widget($arr) {
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

    private function design_options() {
        return $this->config()['design_options'];
    }

    private function design_tabs() {
        return $this->config()['design_tabs'];
    }

    private function service_pack_options() {
        return $this->config()['service_pack_options'];
    }

    private function deploy_form_options($service_pack) {
        $forms_by_service_pack = $this->config()['deploy_form_options_by_service_pack'];
        return $forms_by_service_pack[$service_pack] ?? ['' => 'Select webform'];
    }

    private function service_pack_for_deploy_form($deploy_form) {
        $forms_by_service_pack = $this->config()['deploy_form_options_by_service_pack'];

        foreach ($forms_by_service_pack as $service_pack => $forms) {
            if ($service_pack !== '' && array_key_exists($deploy_form, $forms)) {
                return $service_pack;
            }
        }

        return '';
    }

    private function current_service_pack() {
        $service_pack = $this->safe_query_value('service_pack');

        if ($service_pack !== '') {
            return $service_pack;
        }

        $legacy_collection = $this->safe_query_value('collection');

        if ($legacy_collection !== '') {
            return $legacy_collection;
        }

        return $this->service_pack_for_deploy_form($this->safe_query_value('deploy_form'));
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

    private function package_url_for_deploy_form($service_pack, $deploy_form) {
        $path = $this->package_path_for_deploy_form($service_pack, $deploy_form);

        if ($path === '') {
            return '';
        }

        return '/addon/webforms/' . $path . '?v=0.1';
    }

    private function package_url_for_design_form($design_form) {
        $service_pack = $this->service_pack_for_deploy_form($design_form);

        if ($service_pack === '') {
            return '';
        }

        return $this->package_url_for_deploy_form($service_pack, $design_form);
    }

    private function deploy_options_by_service_pack_for_client() {
        $out = [];
        $forms_by_service_pack = $this->config()['deploy_form_options_by_service_pack'];

        foreach ($forms_by_service_pack as $service_pack => $forms) {
            $out[$service_pack] = [];

            foreach ($forms as $value => $label) {
                $out[$service_pack][] = [
                    'value' => $value,
                    'label' => $label,
                    'package_url' => $this->package_url_for_deploy_form($service_pack, $value),
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

    private function design_select_options($options, $current) {
        $out = '';

        foreach ($options as $value => $label) {
            $selected = ($current === $value) ? ' selected="selected"' : '';
            $package_url = $this->package_url_for_design_form($value);
            $out .= '<option value="' . $this->h($value) . '" data-webforms-package-url="' . $this->h($package_url) . '"' . $selected . '>' . $this->h($label) . '</option>';
        }

        return $out;
    }

    private function deploy_form_select_options($service_pack, $options, $current) {
        $out = '';

        foreach ($options as $value => $label) {
            $selected = ($current === $value) ? ' selected="selected"' : '';
            $package_url = $this->package_url_for_deploy_form($service_pack, $value);
            $out .= '<option value="' . $this->h($value) . '" data-webforms-package-url="' . $this->h($package_url) . '"' . $selected . '>' . $this->h($label) . '</option>';
        }

        return $out;
    }

    private function mode_selector($active_mode, $design_form = '', $deploy_form = '') {
        $design_class = ($active_mode === 'design') ? 'btn btn-primary' : 'btn btn-outline-secondary';
        $deploy_class = ($active_mode === 'deploy') ? 'btn btn-primary' : 'btn btn-outline-secondary';
        $design_href = 'webforms?mode=design';
        $deploy_href = 'webforms?mode=deploy';

        if ($active_mode === 'deploy' && $deploy_form !== '') {
            $design_href .= '&design_form=' . rawurlencode($deploy_form);
        }

        if ($active_mode === 'design' && $design_form !== '') {
            $deploy_href .= '&deploy_form=' . rawurlencode($design_form);
        }

        return '
        <div id="webforms-mode-selector" class="webforms-mode-selector">
            <strong>Mode</strong>
            <div class="btn-group btn-group-sm mt-2 mb-3" role="group" aria-label="Webforms mode">
                <a class="' . $design_class . '" href="' . $this->h($design_href) . '">Design</a>
                <a class="' . $deploy_class . '" href="' . $this->h($deploy_href) . '">Deploy</a>
            </div>
        </div>
        ';
    }

    private function design_widget() {
        $design_form = $this->safe_query_value('design_form');

        if (!array_key_exists($design_form, $this->design_options())) {
            $design_form = '';
        }

        $design_tab = $this->current_design_tab();

        return '
        <div id="webforms-aside" class="widget webforms-aside" data-webforms-mode="design" data-webforms-design-tab="' . $this->h($design_tab) . '">
            <h3>Webforms</h3>
            ' . $this->mode_selector('design', $design_form, '') . '
            <div id="webforms-design-tools" class="webforms-design-tools" data-webforms-panel="design-tools">
                <div id="webforms-design-selector" data-webforms-selector="design">
                    <label for="webforms-design-form-select">Select form to design</label>
                    <select id="webforms-design-form-select" name="design_form" class="form-control form-control-sm">'
                        . $this->design_select_options($this->design_options(), $design_form) .
                    '</select>
                    <p class="small text-muted mt-2 mb-0">Selecting a form loads a browser-local working copy. It does not submit or write to Hubzilla.</p>
                </div>
                <hr>
                <div id="webforms-design-toolbar" class="webforms-design-toolbar" data-webforms-panel="toolbar" data-webforms-toolbar-tab="' . $this->h($design_tab) . '">
                    ' . $this->toolbar_matrix($design_tab) . '
                </div>
                <hr>
                <div id="webforms-design-selection" data-webforms-panel="selection">
                    <p class="small mb-0">No object selected.</p>
                </div>
            </div>
        </div>
        ';
    }

    private function toolbar_matrix($design_tab) {
        $tools = $this->toolbar_tools($design_tab);
        $out = '<div class="webforms-toolbar-grid" role="group" aria-label="Webforms design toolbar">';

        for ($i = 0; $i < 15; $i++) {
            if (isset($tools[$i])) {
                $tool = $tools[$i];
                $disabled = !empty($tool['active']) ? '' : ' disabled="disabled"';
                $out .= '
                <button type="button"
                    class="btn btn-sm btn-outline-secondary"
                    ' . $disabled . '
                    title="' . $this->h($tool['title']) . '"
                    data-webforms-tool="' . $this->h($tool['key']) . '"
                    data-webforms-tool-description="' . $this->h($tool['title']) . '">'
                    . $this->h($tool['label']) .
                '</button>
                ';
            }
            else {
                $out .= '
                <button type="button"
                    class="btn btn-sm btn-outline-secondary"
                    disabled="disabled"
                    tabindex="-1"
                    aria-hidden="true"
                    title="">&nbsp;</button>
                ';
            }
        }

        $out .= '</div>';
        return $out;
    }

    private function deploy_widget() {
        $service_pack = $this->current_service_pack();
        $deploy_form = $this->safe_query_value('deploy_form');

        if (!array_key_exists($service_pack, $this->service_pack_options())) {
            $service_pack = '';
        }

        $deploy_form_options = $this->deploy_form_options($service_pack);

        if (!array_key_exists($deploy_form, $deploy_form_options)) {
            $deploy_form = '';
        }

        return '
        <div id="webforms-aside" class="widget webforms-aside" data-webforms-mode="deploy">
            <h3>Webforms</h3>
            ' . $this->mode_selector('deploy', '', $deploy_form) . '
            <div id="webforms-deploy-navigation" class="webforms-deploy-navigation" data-webforms-panel="deploy-navigation" data-webforms-deploy-options="' . $this->json_attr($this->deploy_options_by_service_pack_for_client()) . '">
                <h4>Deploy</h4>
                <div id="webforms-deploy-selector" data-webforms-selector="deploy">
                    <label for="webforms-deploy-service-pack-select">Service Pack</label>
                    <select id="webforms-deploy-service-pack-select" name="service_pack" class="form-control form-control-sm">'
                        . $this->select_options($this->service_pack_options(), $service_pack) .
                    '</select>
                    <label for="webforms-deploy-form-select" class="mt-2">Webform</label>
                    <select id="webforms-deploy-form-select" name="deploy_form" class="form-control form-control-sm">'
                        . $this->deploy_form_select_options($service_pack, $deploy_form_options, $deploy_form) .
                    '</select>
                    <p class="small text-muted mt-2 mb-0">Selecting a Webform loads its JSON interface in this page. No submit or service execution is active.</p>
                </div>
            </div>
        </div>
        ';
    }
}
