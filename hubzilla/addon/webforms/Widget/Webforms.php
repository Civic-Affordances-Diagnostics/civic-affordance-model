<?php

namespace Zotlabs\Widget;

class Webforms {

    public function widget($args) {
        $mode = 'design';

        if (isset($_GET['mode']) && $_GET['mode'] === 'deploy') {
            $mode = 'deploy';
        }

        if ($mode === 'deploy') {
            return $this->deploy_widget();
        }

        return $this->design_widget();
    }

    private function design_widget() {
        $design_form = '';

        if (isset($_GET['design_form'])) {
            $design_form = preg_replace('/[^a-z0-9_-]/', '', $_GET['design_form']);
        }

        $options = [
            '' => 'New blank form',
            'ipfs-publish' => 'IPFS Publish',
            'placekey-verify-address' => 'Placekey Verify Address',
            'email-compose' => 'Email Compose',
        ];

        $select = '';

        foreach ($options as $value => $label) {
            $selected = ($design_form === $value) ? ' selected="selected"' : '';
            $select .= '<option value="' . htmlspecialchars($value, ENT_QUOTES, 'UTF-8') . '"' . $selected . '>' . htmlspecialchars($label, ENT_QUOTES, 'UTF-8') . '</option>';
        }

        return '
            <div id="webforms-aside" class="webforms-aside" data-webforms-mode="design">
                <h3>Webforms</h3>

                <div id="webforms-mode-selector" class="webforms-mode-selector">
                    <strong>Mode</strong>
                    <div class="btn-group btn-group-sm mt-2 mb-3" role="group" aria-label="Webforms mode">
                        <a class="btn btn-primary" href="webforms?mode=design">Design</a>
                        <a class="btn btn-outline-secondary" href="webforms?mode=deploy">Deploy</a>
                    </div>
                </div>

                <div id="webforms-design-tools" class="webforms-design-tools" data-webforms-panel="design-tools">
                    <h4>Design</h4>

                    <form id="webforms-design-selector" method="get" action="webforms">
                        <input type="hidden" name="mode" value="design">
                        <label for="webforms-design-form-select">Select form to design</label>
                        <select id="webforms-design-form-select" name="design_form" class="form-control form-control-sm">'
                            . $select .
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
        return '
            <div id="webforms-aside" class="webforms-aside" data-webforms-mode="deploy">
                <h3>Webforms</h3>

                <div id="webforms-mode-selector" class="webforms-mode-selector">
                    <strong>Mode</strong>
                    <div class="btn-group btn-group-sm mt-2 mb-3" role="group" aria-label="Webforms mode">
                        <a class="btn btn-outline-secondary" href="webforms?mode=design">Design</a>
                        <a class="btn btn-primary" href="webforms?mode=deploy">Deploy</a>
                    </div>
                </div>

                <div id="webforms-deploy-navigation" class="webforms-deploy-navigation" data-webforms-panel="deploy-navigation">
                    <h4>Deploy</h4>
                    <ul>
                        <li data-webforms-nav="catalog">Catalog</li>
                        <li data-webforms-nav="collections">Collections</li>
                        <li data-webforms-nav="webforms">Webforms</li>
                    </ul>
                </div>
            </div>
        ';
    }
}
