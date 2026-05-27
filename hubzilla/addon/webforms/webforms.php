<?php

/**
 * Name: Webforms
 * Description: JSON-Composed Web Forms placeholder for Hubzilla.
 * Version: 0.0.1
 * MinVersion: 11.0
 * MaxVersion: 12.0
 */

use Zotlabs\Lib\Apps;

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
        return '<div class="webforms-content"><h2>Webforms</h2><p>Sign in to use Webforms.</p></div>';
    }

    if (class_exists('Zotlabs\\Lib\\Apps') && !Apps::addon_app_installed(local_channel(), 'webforms')) {
        $papp = Apps::get_papp('Webforms');
        return Apps::app_render($papp, 'module');
    }

    $mode = 'design';

    if (isset($_GET['mode']) && $_GET['mode'] === 'deploy') {
        $mode = 'deploy';
    }

    if ($mode === 'deploy') {
        return webforms_deploy_placeholder();
    }

    return webforms_design_placeholder();
}

function webforms_design_placeholder() {
    return '
        <div class="webforms-content">
            <h2>Webforms</h2>
            <section class="webforms-design-workspace-placeholder">
                <h3>Design workspace</h3>
                <p>This area will become an inert grid/snap workspace for composing JSON-defined forms.</p>
                <div class="well">
                    Grid / snap workspace placeholder
                </div>
                <p>No JSON authoring behavior is active yet.</p>
            </section>
        </div>
    ';
}

function webforms_deploy_placeholder() {
    return '
        <div class="webforms-content">
            <h2>Webforms</h2>
            <section class="webforms-deploy-view-placeholder">
                <h3>Deploy preview</h3>
                <p>Selected JSON-composed webforms will render here after the runtime is implemented.</p>
                <p>No deployed webform behavior is active yet.</p>
            </section>
        </div>
    ';
}
