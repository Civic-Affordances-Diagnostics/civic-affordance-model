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

        return '
            <div id="webforms-aside" class="widget webforms-aside" data-webforms-mode="design">
                <h3>Webforms</h3>

                ' . $this->mode_selector('design') . '

                <div id="webforms-design-tools" class="webforms-design-tools" data-webforms-panel="design-tools">
                    <h4>Design</h4>

                    <form id="webforms-design-selector" method="get" action="webforms">
                        <input type="hidden" name="mode" value="design">
                        <label for="webforms-design-form-select">Select form to design</label>
                        <select id="webforms-design-form-select" name="design_form" class="form-control form-control-sm">'
                            . $this->select_options($this->design_options(), $design_form) .
                        '</select>
                        <button type="submit" class="btn btn-sm btn-secondary mt-2">Load design</button>
                    </form>

                    <hr>

                    <ul>
                        <li data-webforms-tool="container">Container</li>
                        <li data-webforms-tool="field">Field</li>
                        <li data-webforms-tool="properties">Properties</li>
                    </ul>

                    <div id="webforms-design-selection" data-webforms-panel="selection">
                        <h5>Selected object</h5>
                        <p>No object selected.</p>
                    </div>
                </div>
            </div>
        ';
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
