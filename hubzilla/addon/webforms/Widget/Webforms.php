<?php

/**
 * Name: Webforms sidebar
 * Description: Display Design or Deploy controls for the webforms addon
 * Requires: webforms
 */

namespace Zotlabs\Widget;

class Webforms {

    function widget($arr) {
        $mode = $this->current_mode();

        if ($mode === 'deploy') {
            return $this->deploy_widget();
        }

        return $this->design_widget();
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
        return [
            '' => 'New blank form',
            'ipfs-publish' => 'IPFS Publish',
            'placekey-verify-address' => 'Placekey Verify Address',
            'email-compose' => 'Email Compose',
        ];
    }

    private function design_tabs() {
        return [
            'grid' => 'Grid',
            'json' => 'JSON',
            'services' => 'Services',
            'federation' => 'Federation',
            'help' => 'Help',
        ];
    }

    private function current_design_tab() {
        $design_tab = $this->safe_query_value('design_tab');

        if (!array_key_exists($design_tab, $this->design_tabs())) {
            return 'grid';
        }

        return $design_tab;
    }

    private function collection_options() {
        return [
            '' => 'Select collection',
            'cid-mapping' => 'CID Mapping',
            'placekey-address-validation' => 'Placekey Address Validation',
            'bare-bones-email-client' => 'Bare-Bones Email Client',
        ];
    }

    private function deploy_form_options() {
        return [
            '' => 'Select webform',
            'ipfs-publish' => 'IPFS Publish',
            'ipfs-pin-request' => 'IPFS Pin Request',
            'ipfs-schedule-pin' => 'IPFS Schedule Pin',
            'ipfs-map-pin' => 'IPFS Map Pin',
            'ipfs-gitea-browse' => 'IPFS Gitea Browse',
            'placekey-verify-address' => 'Placekey Verify Address',
            'email-inbox' => 'Email Recent Messages',
            'email-compose' => 'Email Compose',
            'email-forward' => 'Email Forward',
        ];
    }

    private function select_options($options, $current) {
        $out = '';

        foreach ($options as $value => $label) {
            $selected = ($current === $value) ? ' selected="selected"' : '';
            $out .= '<option value="' . $this->h($value) . '"' . $selected . '>' . $this->h($label) . '</option>';
        }

        return $out;
    }

    private function mode_selector($active_mode) {
        $design_class = ($active_mode === 'design') ? 'btn btn-primary' : 'btn btn-outline-secondary';
        $deploy_class = ($active_mode === 'deploy') ? 'btn btn-primary' : 'btn btn-outline-secondary';

        return '
            <div id="webforms-mode-selector" class="webforms-mode-selector">
                <strong>Mode</strong>
                <div class="btn-group btn-group-sm mt-2 mb-3" role="group" aria-label="Webforms mode">
                    <a class="' . $design_class . '" href="webforms?mode=design">Design</a>
                    <a class="' . $deploy_class . '" href="webforms?mode=deploy">Deploy</a>
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

                ' . $this->mode_selector('design') . '

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
                        <h5>Selected object</h5>
                        <p>No object selected.</p>
                    </div>
                </div>
            </div>
        ';
    }

    private function toolbar_matrix($design_tab) {
        $tools = $this->toolbar_tools($design_tab);
        $out = '<div class="webforms-toolbar-grid" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: repeat(5, auto); gap: 0.25rem;" role="group" aria-label="Webforms design toolbar">';

        for ($i = 0; $i < 15; $i++) {
            if (isset($tools[$i])) {
                $tool = $tools[$i];
                $out .= '
                    <button type="button"
                            class="btn btn-sm btn-outline-secondary"
                            disabled="disabled"
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

    private function toolbar_tools($design_tab) {
        if ($design_tab === 'json') {
            return [
                ['key' => 'copy-json', 'label' => 'Copy', 'title' => 'Copy generated JSON'],
                ['key' => 'download-json', 'label' => 'Save', 'title' => 'Download generated JSON'],
                ['key' => 'import-json', 'label' => 'Import', 'title' => 'Import JSON into the designer'],
                ['key' => 'validate-json', 'label' => 'Check', 'title' => 'Validate JSON structure'],
                ['key' => 'format-json', 'label' => 'Format', 'title' => 'Format JSON for readability'],
                ['key' => 'clear-json', 'label' => 'Clear', 'title' => 'Clear local draft JSON'],
            ];
        }

        if ($design_tab === 'services') {
            return [
                ['key' => 'service', 'label' => 'Svc', 'title' => 'Add service definition'],
                ['key' => 'endpoint', 'label' => 'URL', 'title' => 'Add service endpoint'],
                ['key' => 'auth', 'label' => 'Auth', 'title' => 'Add authentication method'],
                ['key' => 'api-key', 'label' => 'Key', 'title' => 'Add API key setting'],
                ['key' => 'login', 'label' => 'Login', 'title' => 'Add login setting'],
                ['key' => 'local-only', 'label' => 'Local', 'title' => 'Set local-only mode'],
                ['key' => 'result-map', 'label' => 'Result', 'title' => 'Add result mapping'],
                ['key' => 'failure-map', 'label' => 'Fail', 'title' => 'Add failure mapping'],
                ['key' => 'timeout', 'label' => 'Time', 'title' => 'Add timeout setting'],
                ['key' => 'retry', 'label' => 'Retry', 'title' => 'Add retry policy'],
            ];
        }

        if ($design_tab === 'federation') {
            return [
                ['key' => 'channel-target', 'label' => 'Chan', 'title' => 'Add channel target'],
                ['key' => 'group-target', 'label' => 'Group', 'title' => 'Add privacy group target'],
                ['key' => 'public-visibility', 'label' => 'Public', 'title' => 'Add public visibility'],
                ['key' => 'service-request', 'label' => 'Req', 'title' => 'Add service request'],
                ['key' => 'service-offer', 'label' => 'Offer', 'title' => 'Add service offer'],
                ['key' => 'service-result', 'label' => 'Result', 'title' => 'Add service result'],
                ['key' => 'summary', 'label' => 'Sum', 'title' => 'Add public summary'],
                ['key' => 'retention', 'label' => 'Retain', 'title' => 'Add retention hint'],
                ['key' => 'permission', 'label' => 'Perm', 'title' => 'Add permission rule'],
                ['key' => 'clone-note', 'label' => 'Clone', 'title' => 'Add clone or nomadic identity note'],
            ];
        }

        if ($design_tab === 'help') {
            return [
                ['key' => 'help-grid', 'label' => 'Grid', 'title' => 'Show grid help'],
                ['key' => 'help-json', 'label' => 'JSON', 'title' => 'Show JSON help'],
                ['key' => 'help-services', 'label' => 'Svc', 'title' => 'Show services help'],
                ['key' => 'help-federation', 'label' => 'Fed', 'title' => 'Show federation help'],
                ['key' => 'help-shortcuts', 'label' => 'Keys', 'title' => 'Show keyboard shortcut help'],
            ];
        }

        return [
            ['key' => 'container', 'label' => 'Box', 'title' => 'Add container'],
            ['key' => 'field', 'label' => 'Field', 'title' => 'Add field'],
            ['key' => 'label', 'label' => 'Label', 'title' => 'Add label'],
            ['key' => 'text', 'label' => 'Text', 'title' => 'Add text input'],
            ['key' => 'textarea', 'label' => 'Area', 'title' => 'Add textarea'],
            ['key' => 'select', 'label' => 'Select', 'title' => 'Add select list'],
            ['key' => 'checkbox', 'label' => 'Check', 'title' => 'Add checkbox'],
            ['key' => 'button', 'label' => 'Button', 'title' => 'Add button'],
            ['key' => 'result-panel', 'label' => 'Result', 'title' => 'Add result panel'],
            ['key' => 'help-text', 'label' => 'Help', 'title' => 'Add help text'],
        ];
    }

    private function deploy_widget() {
        $collection = $this->safe_query_value('collection');
        $deploy_form = $this->safe_query_value('deploy_form');

        if (!array_key_exists($collection, $this->collection_options())) {
            $collection = '';
        }

        if (!array_key_exists($deploy_form, $this->deploy_form_options())) {
            $deploy_form = '';
        }

        return '
            <div id="webforms-aside" class="widget webforms-aside" data-webforms-mode="deploy">
                <h3>Webforms</h3>

                ' . $this->mode_selector('deploy') . '

                <div id="webforms-deploy-navigation" class="webforms-deploy-navigation" data-webforms-panel="deploy-navigation">
                    <h4>Deploy</h4>

                    <form id="webforms-deploy-selector" method="get" action="webforms">
                        <input type="hidden" name="mode" value="deploy">

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
                </div>
            </div>
        ';
    }
}
