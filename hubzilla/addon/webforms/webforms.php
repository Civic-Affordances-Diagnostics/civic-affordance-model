<?php

/**
 * Name: Webforms
 * Description: JSON-Composed Web Forms placeholder for Hubzilla.
 * Version: 0.0.1
 * MinVersion: 11.0
 * MaxVersion: 12.0
 */

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
        return '<div id="webforms-runtime" class="webforms-content"><h2>Webforms</h2><p>Sign in to use Webforms.</p></div>';
    }

    $mode = 'design';

    if (isset($_GET['mode']) && $_GET['mode'] === 'deploy') {
        $mode = 'deploy';
    }

    if ($mode === 'deploy') {
        return webforms_deploy_placeholder();
    }

    $design_form = '';

    if (isset($_GET['design_form'])) {
        $design_form = preg_replace('/[^a-z0-9_-]/', '', $_GET['design_form']);
    }

    return webforms_design_placeholder($design_form);
}

function webforms_design_placeholder($design_form = '') {
    $forms = [
        '' => [
            'label' => 'New blank form',
            'description' => 'Start with an empty inert root form container.'
        ],
        'ipfs-publish' => [
            'label' => 'IPFS Publish',
            'description' => 'Placeholder for designing an inert IPFS Publish sub-form.'
        ],
        'placekey-verify-address' => [
            'label' => 'Placekey Verify Address',
            'description' => 'Placeholder for designing an inert Placekey address-verification sub-form.'
        ],
        'email-compose' => [
            'label' => 'Email Compose',
            'description' => 'Placeholder for designing an inert bare-bones email composition sub-form.'
        ],
    ];

    if (!array_key_exists($design_form, $forms)) {
        $design_form = '';
    }

    $label = htmlspecialchars($forms[$design_form]['label'], ENT_QUOTES, 'UTF-8');
    $description = htmlspecialchars($forms[$design_form]['description'], ENT_QUOTES, 'UTF-8');

    return '
        <div id="webforms-runtime" class="webforms-content" data-webforms-mode="design" data-webforms-design-form="' . htmlspecialchars($design_form, ENT_QUOTES, 'UTF-8') . '">
            <header id="webforms-runtime-header">
                <h2>Webforms</h2>
                <p>Mode: Design</p>
            </header>

            <section id="webforms-design-workspace" class="webforms-design-workspace-placeholder" data-webforms-container="design-workspace">
                <h3>Design workspace: ' . $label . '</h3>
                <p>' . $description . '</p>

                <div id="webforms-design-grid" class="well" data-webforms-container="root-form" style="min-height: 320px;">
                    Root form container placeholder
                </div>
            </section>
        </div>
    ';
}

function webforms_deploy_placeholder() {
    return '
        <div id="webforms-runtime" class="webforms-content" data-webforms-mode="deploy">
            <header id="webforms-runtime-header">
                <h2>Webforms</h2>
                <p>Mode: Deploy</p>
            </header>

            <section id="webforms-deploy-view" class="webforms-deploy-view-placeholder" data-webforms-container="deploy-view">
                <h3>Deploy preview</h3>
                <p>Selected JSON-composed webforms will render here after the runtime is implemented.</p>

                <div id="webforms-deploy-empty-state" class="well" data-webforms-panel="empty-deploy-view">
                    No JSON collection selected.
                </div>
            </section>
        </div>
    ';
}
