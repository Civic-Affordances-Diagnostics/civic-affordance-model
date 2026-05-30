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

    private function design_options() {
        return $this->config()['design_options'];
    }

    private function design_tabs() {
        return $this->config()['design_tabs'];
    }

    private function deploy_tabs() {
        return $this->config()['deploy_tabs'];
    }

    private function collection_options() {
        return $this->config()['collection_options'];
    }

    private function deploy_form_options() {
        return $this->config()['deploy_form_options'];
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

    private function current_deploy_tab() {
        $deploy_tab = $this->safe_query_value('deploy_tab');

        if (!array_key_exists($deploy_tab, $this->deploy_tabs())) {
            return 'form';
        }

        return $deploy_tab;
    }

    private function select_options($options, $current) {
        $out = '';

        foreach ($options as $value => $label) {
            $selected = ($current === $value) ? ' selected="selected"' : '';
            $out .= '<option value="' . $this->h($value) . '"' . $selected . '>' . $this->h($label) . '</option>';
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
                <form id="webforms-design-selector" method="get" action="webforms">
                    <input type="hidden" name="mode" value="design">
                    <input type="hidden" name="design_tab" value="' . $this->h($design_tab) . '">
                    <label for="webforms-design-form-select">Select form to design</label>
                    <select id="webforms-design-form-select" name="design_form" class="form-control form-control-sm">'
                        . $this->select_options($this->design_options(), $design_form) .
                    '</select>
                    <button type="submit" class="btn btn-sm btn-secondary mt-2">Load design</button>
                </form>
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

    private function deploy_tab_links($collection, $deploy_form, $active_tab) {
        $out = '<div class="list-group list-group-flush webforms-deploy-tab-list">';

        foreach ($this->deploy_tabs() as $tab => $label) {
            $class = ($active_tab === $tab) ? 'list-group-item active' : 'list-group-item';
            $href = 'webforms?mode=deploy&collection=' . rawurlencode($collection) . '&deploy_form=' . rawurlencode($deploy_form) . '&deploy_tab=' . rawurlencode($tab);
            $out .= '<a class="' . $class . '" href="' . $this->h($href) . '">' . $this->h($label) . '</a>';
        }

        $out .= '</div>';
        return $out;
    }

    private function deploy_widget() {
        $collection = $this->safe_query_value('collection');
        $deploy_form = $this->safe_query_value('deploy_form');
        $deploy_tab = $this->current_deploy_tab();

        if (!array_key_exists($collection, $this->collection_options())) {
            $collection = '';
        }

        if (!array_key_exists($deploy_form, $this->deploy_form_options())) {
            $deploy_form = '';
        }

        return '
        <div id="webforms-aside" class="widget webforms-aside" data-webforms-mode="deploy" data-webforms-deploy-tab="' . $this->h($deploy_tab) . '">
            <h3>Webforms</h3>
            ' . $this->mode_selector('deploy', '', $deploy_form) . '
            <div id="webforms-deploy-navigation" class="webforms-deploy-navigation" data-webforms-panel="deploy-navigation">
                <h4>Deploy</h4>
                <form id="webforms-deploy-selector" method="get" action="webforms">
                    <input type="hidden" name="mode" value="deploy">
                    <input type="hidden" name="deploy_tab" value="' . $this->h($deploy_tab) . '">
                    <label for="webforms-deploy-collection-select">Collection</label>
                    <select id="webforms-deploy-collection-select" name="collection" class="form-control form-control-sm">'
                        . $this->select_options($this->collection_options(), $collection) .
                    '</select>
                    <label for="webforms-deploy-form-select" class="mt-2">Webform</label>
                    <select id="webforms-deploy-form-select" name="deploy_form" class="form-control form-control-sm">'
                        . $this->select_options($this->deploy_form_options(), $deploy_form) .
                    '</select>
                    <button type="submit" class="btn btn-sm btn-secondary mt-2">Load deploy view</button>
                </form>
                <hr>
                <h5>Workflow tabs</h5>
                ' . $this->deploy_tab_links($collection, $deploy_form, $deploy_tab) . '
            </div>
        </div>
        ';
    }
}
