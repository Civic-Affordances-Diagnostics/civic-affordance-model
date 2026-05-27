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

    $b['layout'] = webforms_pdl_layout();
}

function webforms_pdl_layout() {
    return '[template]default[/template]

[region=aside]

' . webforms_aside() . '

[/region]

[region=content]

$content

[/region]

[region=right_aside]

[widget=notifications][/widget]

[widget=newmember][/widget]

[/region]
';
}

function webforms_current_mode() {
    if (isset($_GET['mode']) && $_GET['mode'] === 'deploy') {
        return 'deploy';
    }

    return 'design';
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

function webforms_aside() {
    $mode = webforms_current_mode();

    if ($mode === 'deploy') {
        return webforms_deploy_aside();
    }

    return webforms_design_aside();
}

function webforms_mode_selector($active_mode) {
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

function webforms_design_options() {
    return [
        '' => 'New blank form',
        'ipfs-publish' => 'IPFS Publish',
        'placekey-verify-address' => 'Placekey Verify Address',
        'email-compose' => 'Email Compose',
    ];
}

function webforms_collection_options() {
    return [
        '' => 'Select collection',
        'cid-mapping' => 'CID Mapping',
        'placekey-address-validation' => 'Placekey Address Validation',
        'bare-bones-email-client' => 'Bare-Bones Email Client',
    ];
}

function webforms_deploy_form_options() {
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

function webforms_select_options($options, $current) {
    $out = '';

    foreach ($options as $value => $label) {
        $selected = ($current === $value) ? ' selected="selected"' : '';
        $out .= '<option value="' . webforms_h($value) . '"' . $selected . '>' . webforms_h($label) . '</option>';
    }

    return $out;
}

function webforms_design_aside() {
    $design_form = webforms_safe_query_value('design_form');

    if (!array_key_exists($design_form, webforms_design_options())) {
        $design_form = '';
    }

    return '
        <div id="webforms-aside" class="webforms-aside" data-webforms-mode="design">
            <h3>Webforms</h3>

            ' . webforms_mode_selector('design') . '

            <div id="webforms-design-tools" class="webforms-design-tools" data-webforms-panel="design-tools">
                <h4>Design</h4>

                <form id="webforms-design-selector" method="get" action="webforms">
                    <input type="hidden" name="mode" value="design">
                    <label for="webforms-design-form-select">Select form to design</label>
                    <select id="webforms-design-form-select" name="design_form" class="form-control form-control-sm">'
                        . webforms_select_options(webforms_design_options(), $design_form) .
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

function webforms_deploy_aside() {
    $collection = webforms_safe_query_value('collection');
    $deploy_form = webforms_safe_query_value('deploy_form');

    if (!array_key_exists($collection, webforms_collection_options())) {
        $collection = '';
    }

    if (!array_key_exists($deploy_form, webforms_deploy_form_options())) {
        $deploy_form = '';
    }

    return '
        <div id="webforms-aside" class="webforms-aside" data-webforms-mode="deploy">
            <h3>Webforms</h3>

            ' . webforms_mode_selector('deploy') . '

            <div id="webforms-deploy-navigation" class="webforms-deploy-navigation" data-webforms-panel="deploy-navigation">
                <h4>Deploy</h4>

                <form id="webforms-deploy-selector" method="get" action="webforms">
                    <input type="hidden" name="mode" value="deploy">

                    <label for="webforms-deploy-collection-select">Collection</label>
                    <select id="webforms-deploy-collection-select" name="collection" class="form-control form-control-sm">'
                        . webforms_select_options(webforms_collection_options(), $collection) .
                    '</select>

                    <label for="webforms-deploy-form-select" class="mt-2">Webform</label>
                    <select id="webforms-deploy-form-select" name="deploy_form" class="form-control form-control-sm">'
                        . webforms_select_options(webforms_deploy_form_options(), $deploy_form) .
                    '</select>

                    <button type="submit" class="btn btn-sm btn-secondary mt-2">Load deploy view</button>
                </form>
            </div>
        </div>
    ';
}

function webforms_content() {
    if (!local_channel()) {
        return '<div id="webforms-runtime" class="webforms-content"><h2>Webforms</h2><p>Sign in to use Webforms.</p></div>';
    }

    $mode = webforms_current_mode();

    if ($mode === 'deploy') {
        return webforms_deploy_placeholder(
            webforms_safe_query_value('collection'),
            webforms_safe_query_value('deploy_form')
        );
    }

    return webforms_design_placeholder(webforms_safe_query_value('design_form'));
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

    $label = webforms_h($forms[$design_form]['label']);
    $description = webforms_h($forms[$design_form]['description']);

    return '
        <div id="webforms-runtime" class="webforms-content" data-webforms-mode="design" data-webforms-design-form="' . webforms_h($design_form) . '">
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
        <div id="webforms-runtime" class="webforms-content" data-webforms-mode="deploy" data-webforms-collection="' . webforms_h($collection) . '" data-webforms-deploy-form="' . webforms_h($deploy_form) . '">
            <header id="webforms-runtime-header">
                <h2>Webforms</h2>
                <p>Mode: Deploy</p>
            </header>

            <section id="webforms-deploy-view" class="webforms-deploy-view-placeholder" data-webforms-container="deploy-view">
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
