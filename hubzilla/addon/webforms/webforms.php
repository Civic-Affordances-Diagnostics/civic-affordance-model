<?php

/**
 * Name: Webforms
 * Description: JSON-Composed Web Forms placeholder for Hubzilla.
 * Version: 0.0.1
 * MinVersion: 11.0
 * MaxVersion: 12.0
 */

use Zotlabs\Extend\Widget;

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
        return webforms_deploy_placeholder(
            webforms_safe_query_value('collection'),
            webforms_safe_query_value('deploy_form')
        );
    }

    webforms_add_design_assets();

    return webforms_design_placeholder(
        webforms_safe_query_value('design_form'),
        webforms_safe_query_value('design_tab')
    );
}

function webforms_add_design_assets() {
    if (function_exists('head_add_css')) {
        head_add_css('/addon/webforms/view/css/webforms.css?v=css-extract-1');
    }

    if (function_exists('head_add_js')) {
        head_add_js('/addon/webforms/view/js/webforms-design-state.js?v=delete-clear-1');
        head_add_js('/addon/webforms/view/js/webforms-design-grid.js?v=delete-clear-1');
        head_add_js('/addon/webforms/view/js/webforms-design-properties.js?v=delete-clear-1');
        head_add_js('/addon/webforms/view/js/webforms-design-json.js?v=delete-clear-1');
        head_add_js('/addon/webforms/view/js/webforms-design.js?v=delete-clear-1');
    }
}

function webforms_access_notice($mode) {
    if (webforms_access_state() === 'logged-in') {
        return '';
    }

    if ($mode === 'design') {
        return '
            <div class="alert alert-info py-2 webforms-access-notice" role="status">
                Public local-only Design mode. Sign in to save, publish, deploy, or use private services.
            </div>
        ';
    }

    return '
        <div class="alert alert-info py-2 webforms-access-notice" role="status">
            Public Deploy mode. Sign in to access private forms, storage, services, or federation.
        </div>
    ';
}

function webforms_design_options() {
    return [
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
}

function webforms_design_tabs() {
    return [
        'grid' => 'Grid',
        'json' => 'JSON',
        'services' => 'Services',
        'federation' => 'Federation',
        'help' => 'Help',
    ];
}

function webforms_normalize_design_tab($design_tab) {
    if (!array_key_exists($design_tab, webforms_design_tabs())) {
        return 'grid';
    }

    return $design_tab;
}

function webforms_design_tab_nav($design_form, $active_tab) {
    $tabs = webforms_design_tabs();
    $out = '<ul class="nav nav-tabs mb-3" id="webforms-design-tabs">';

    foreach ($tabs as $tab => $label) {
        $class = ($active_tab === $tab) ? 'nav-link active' : 'nav-link';
        $href = 'webforms?mode=design&design_form=' . rawurlencode($design_form) . '&design_tab=' . rawurlencode($tab);

        $out .= '<li class="nav-item">';
        $out .= '<a class="' . $class . '" href="' . webforms_h($href) . '">' . webforms_h($label) . '</a>';
        $out .= '</li>';
    }

    $out .= '</ul>';

    return $out;
}

function webforms_design_placeholder($design_form = '', $design_tab = '') {
    $forms = webforms_design_options();

    if (!array_key_exists($design_form, $forms)) {
        $design_form = '';
    }

    $design_tab = webforms_normalize_design_tab($design_tab);

    $label = webforms_h($forms[$design_form]['label']);
    $description = webforms_h($forms[$design_form]['description']);
    $access_state = webforms_access_state();

    return '
        <div id="webforms-runtime" class="webforms-content" data-webforms-mode="design" data-webforms-access="' . webforms_h($access_state) . '" data-webforms-design-form="' . webforms_h($design_form) . '" data-webforms-design-tab="' . webforms_h($design_tab) . '">
            <section id="webforms-design-workspace" class="webforms-design-workspace-placeholder" data-webforms-container="design-workspace">
                ' . webforms_access_notice('design') . '

                <h3>Design workspace: ' . $label . '</h3>
                <p>' . $description . '</p>

                ' . webforms_design_tab_nav($design_form, $design_tab) . '

                ' . webforms_design_tab_content($design_tab) . '
            </section>
        </div>
    ';
}

function webforms_design_tab_content($design_tab) {
    if ($design_tab === 'json') {
        return webforms_design_json_tab();
    }

    if ($design_tab === 'services') {
        return webforms_design_services_tab();
    }

    if ($design_tab === 'federation') {
        return webforms_design_federation_tab();
    }

    if ($design_tab === 'help') {
        return webforms_design_help_tab();
    }

    return webforms_design_grid_tab();
}

function webforms_design_grid_tab() {
    return '
        <div id="webforms-design-grid-tab" data-webforms-design-tab-panel="grid">
            <div id="webforms-design-grid"
                 class="webforms-design-grid"
                 data-webforms-container="root-form"
                 data-webforms-grid-size="24">
                <div id="webforms-grid-origin"
                     class="webforms-grid-origin"
                     data-webforms-grid-origin="0,0">
                    root container · 24px grid · browser-local draft
                </div>
            </div>
        </div>
    ';
}

function webforms_design_json_tab() {
    return '
        <div id="webforms-design-json-tab" data-webforms-design-tab-panel="json">
            <h4>JSON</h4>
            <p>This tab shows the browser-local Webforms package generated by the Design workspace.</p>
            <textarea id="webforms-json-output" class="form-control" rows="18" readonly="readonly" data-webforms-json-output="package">Loading browser-local Webforms package JSON...</textarea>
        </div>
    ';
}

function webforms_design_services_tab() {
    return '
        <div id="webforms-design-services-tab" data-webforms-design-tab-panel="services">
            <h4>Services</h4>
            <p>This tab will describe local-only mode and optional service settings for the selected form.</p>
            <div class="well">
                <p><strong>Current state:</strong> local-only placeholder.</p>
                <p>No API keys, credentials, external services, or server writes are active.</p>
            </div>
        </div>
    ';
}

function webforms_design_federation_tab() {
    return '
        <div id="webforms-design-federation-tab" data-webforms-design-tab-panel="federation">
            <h4>Federation</h4>
            <p>This tab will later describe Hubzilla-native sharing, service requests, service offers, service results, and permissioned records.</p>
            <div class="well">
                Federation behavior is not active.
            </div>
        </div>
    ';
}

function webforms_design_help_tab() {
    return '
        <div id="webforms-design-help-tab" data-webforms-design-tab-panel="help">
            <h4>Help</h4>
            <p>Design mode creates inert JSON-composed webform definitions.</p>
            <ul>
                <li>Use Grid for visual placement.</li>
                <li>Use JSON to inspect the generated form definition.</li>
                <li>Use Services for local/API/service settings.</li>
                <li>Use Federation for future Hubzilla-native sharing concepts.</li>
            </ul>
        </div>
    ';
}

function webforms_deploy_placeholder($collection = '', $deploy_form = '') {
    $collections = [
        '' => 'No collection selected',
        'cid-mapping' => 'CID Mapping',
        'placekey-address-validation' => 'Placekey Address Validation',
        'bare-bones-email-client' => 'Bare-Bones Email Client',
    ];

    $forms = [
        '' => 'No webform selected',
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

    if (!array_key_exists($collection, $collections)) {
        $collection = '';
    }

    if (!array_key_exists($deploy_form, $forms)) {
        $deploy_form = '';
    }

    $collection_label = webforms_h($collections[$collection]);
    $form_label = webforms_h($forms[$deploy_form]);
    $access_state = webforms_access_state();

    if ($collection === '' && $deploy_form === '') {
        $message = 'No JSON collection or webform selected.';
    }
    elseif ($deploy_form === '') {
        $message = 'Collection selected. No webform selected.';
    }
    else {
        $message = 'Inert deploy placeholder for the selected webform.';
    }

    return '
        <div id="webforms-runtime" class="webforms-content" data-webforms-mode="deploy" data-webforms-access="' . webforms_h($access_state) . '" data-webforms-collection="' . webforms_h($collection) . '" data-webforms-deploy-form="' . webforms_h($deploy_form) . '">
            <section id="webforms-deploy-view" class="webforms-deploy-view-placeholder" data-webforms-container="deploy-view">
                ' . webforms_access_notice('deploy') . '

                <h3>Deploy preview</h3>

                <div id="webforms-deploy-empty-state" class="well" data-webforms-panel="empty-deploy-view">
                    <p><strong>Collection:</strong> ' . $collection_label . '</p>
                    <p><strong>Webform:</strong> ' . $form_label . '</p>
                    <p>' . webforms_h($message) . '</p>
                </div>
            </section>
        </div>
    ';
}
