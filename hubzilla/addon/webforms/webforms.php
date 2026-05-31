<?php

/**
 * Name: Webforms
 * Description: JSON-Composed Web Forms placeholder for Hubzilla.
 * Version: 0.0.1
 * MinVersion: 11.0
 * MaxVersion: 12.0
 */

use Zotlabs\Extend\Widget;

require_once __DIR__ . '/include/webforms-render.php';
require_once __DIR__ . '/include/webforms-attestation.php';

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

function webforms_config() {
    static $config = null;

    if ($config === null) {
        $config = require __DIR__ . '/include/webforms-config.php';
    }

    return $config;
}

function webforms_config_section($name) {
    $config = webforms_config();
    return $config[$name] ?? [];
}

function webforms_config_label($section, $key, $fallback = '') {
    $values = webforms_config_section($section);
    if (array_key_exists($key, $values)) {
        return $values[$key];
    }
    return $fallback;
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

function webforms_service_pack_for_deploy_form($deploy_form) {
    $forms_by_service_pack = webforms_config_section('deploy_form_options_by_service_pack');
    foreach ($forms_by_service_pack as $service_pack => $forms) {
        if ($service_pack !== '' && array_key_exists($deploy_form, $forms)) {
            return $service_pack;
        }
    }
    return '';
}

function webforms_current_service_pack() {
    $service_pack = webforms_safe_query_value('service_pack');
    if ($service_pack !== '') {
        return $service_pack;
    }

    $legacy_collection = webforms_safe_query_value('collection');
    if ($legacy_collection !== '') {
        return $legacy_collection;
    }

    return webforms_service_pack_for_deploy_form(webforms_safe_query_value('deploy_form'));
}

function webforms_current_design_service_pack() {
    $service_pack = webforms_safe_query_value('service_pack');
    if ($service_pack !== '') {
        return $service_pack;
    }
    return webforms_service_pack_for_deploy_form(webforms_safe_query_value('design_form'));
}

function webforms_package_path_for_deploy_form($service_pack, $deploy_form) {
    $paths_by_service_pack = webforms_config_section('deploy_package_paths_by_service_pack');
    if (!isset($paths_by_service_pack[$service_pack][$deploy_form])) {
        return '';
    }

    $path = $paths_by_service_pack[$service_pack][$deploy_form];
    if (!preg_match('/^[a-z0-9_\-\/]+\.json$/', $path)) {
        return '';
    }

    return $path;
}

function webforms_package_file_for_deploy_form($service_pack, $deploy_form) {
    $path = webforms_package_path_for_deploy_form($service_pack, $deploy_form);
    if ($path === '') {
        return '';
    }

    $base = realpath(__DIR__ . '/packages');
    $file = realpath(__DIR__ . '/' . $path);
    if ($base === false || $file === false) {
        return '';
    }

    if (strpos($file, $base . DIRECTORY_SEPARATOR) !== 0) {
        return '';
    }

    return $file;
}

function webforms_package_data_for_deploy_form($service_pack, $deploy_form) {
    $file = webforms_package_file_for_deploy_form($service_pack, $deploy_form);
    if ($file === '') {
        return null;
    }

    $raw = @file_get_contents($file);
    if ($raw === false) {
        return null;
    }

    $data = json_decode($raw, true);
    if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
        return null;
    }

    return $data;
}

function webforms_bundled_package_map() {
    $paths_by_service_pack = webforms_config_section('deploy_package_paths_by_service_pack');
    $map = [];
    foreach ($paths_by_service_pack as $service_pack => $forms) {
        if ($service_pack === '' || !is_array($forms)) {
            continue;
        }

        foreach ($forms as $deploy_form => $_path) {
            if ($deploy_form === '') {
                continue;
            }

            $package = webforms_package_data_for_deploy_form($service_pack, $deploy_form);
            if ($package === null) {
                continue;
            }

            if (!isset($map[$service_pack])) {
                $map[$service_pack] = [];
            }
            $map[$service_pack][$deploy_form] = $package;
        }
    }

    return $map;
}

function webforms_bundled_package_map_json() {
    return json_encode(
        webforms_bundled_package_map(),
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
    );
}

function webforms_package_url_for_deploy_form($service_pack, $deploy_form) {
    $path = webforms_package_path_for_deploy_form($service_pack, $deploy_form);
    if ($path === '') {
        return '';
    }
    return '/addon/webforms/' . $path . '?v=0.1';
}

function webforms_package_url_for_design_form($design_form) {
    if ($design_form === '') {
        return '';
    }

    $service_pack = webforms_service_pack_for_deploy_form($design_form);
    if ($service_pack === '') {
        return '';
    }

    return webforms_package_url_for_deploy_form($service_pack, $design_form);
}

function webforms_json_response($data, $status = 200) {
    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=UTF-8');
        header('Cache-Control: no-store');
    }

    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (function_exists('killme')) {
        killme();
    }
    exit;
}

function webforms_current_action() {
    return webforms_safe_query_value('webforms_action');
}

function webforms_service_profile_config($service_pack, $profile_id) {
    $profiles = webforms_config_section('service_profiles');
    if (!isset($profiles[$service_pack][$profile_id]) || !is_array($profiles[$service_pack][$profile_id])) {
        return [];
    }
    return $profiles[$service_pack][$profile_id];
}

function webforms_fetch_json_url($url) {
    if ($url === '' || !preg_match('/^https?:\/\//', $url)) {
        return [null, 'invalid_url'];
    }

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
        $raw = curl_exec($ch);
        $error = curl_error($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($raw === false || $raw === '' || $status < 200 || $status >= 300) {
            return [null, $error !== '' ? $error : 'http_status_' . $status];
        }
    }
    else {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 5,
                'ignore_errors' => true,
                'header' => "Accept: application/json\r\n",
            ],
        ]);
        $raw = @file_get_contents($url, false, $context);
        if ($raw === false || $raw === '') {
            return [null, 'request_failed'];
        }
    }

    $data = json_decode($raw, true);
    if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
        return [null, 'invalid_json'];
    }

    return [$data, ''];
}

function webforms_handle_service_profile_status_action() {
    $service_pack = webforms_safe_query_value('service_pack');
    $profile_id = webforms_safe_query_value('profile_id');

    if ($service_pack === '' || $profile_id === '') {
        webforms_json_response([
            'status' => 'failed',
            'error_code' => 'missing_profile',
            'error_message' => 'Missing service pack or profile id.',
        ], 400);
    }

    $profile = webforms_service_profile_config($service_pack, $profile_id);
    if (!$profile) {
        webforms_json_response([
            'status' => 'failed',
            'error_code' => 'unknown_profile',
            'error_message' => 'The requested service profile is not configured on this Hubzilla node.',
        ], 404);
    }

    [$data, $error] = webforms_fetch_json_url($profile['status_url'] ?? '');
    if ($data === null) {
        webforms_json_response([
            'service_pack' => $service_pack,
            'profile_id' => $profile_id,
            'target' => $profile['target'] ?? '',
            'orchestrator' => $profile['orchestrator'] ?? '',
            'backend_role' => $profile['backend_role'] ?? '',
            'backend_node' => $profile['backend_node'] ?? '',
            'execution_active' => false,
            'raw_kubo_rpc_exposed' => false,
            'raw_git_write_exposed' => false,
            'operations' => [],
            'status' => 'failed',
            'error_code' => 'profile_status_unavailable',
            'error_message' => $error !== '' ? $error : 'The service profile status endpoint did not return usable JSON.',
        ], 502);
    }

    webforms_json_response($data, 200);
}

function webforms_handle_action_if_needed() {
    if (webforms_current_action() === 'service_profile_status') {
        webforms_handle_service_profile_status_action();
    }

    if (webforms_current_action() === 'attestation_prepare') {
        webforms_handle_attestation_prepare_action();
    }
}

function webforms_content() {
    webforms_handle_action_if_needed();

    $mode = webforms_current_mode();
    if ($mode === 'deploy') {
        webforms_add_deploy_assets();
        return webforms_render_deploy_page(
            webforms_current_service_pack(),
            webforms_safe_query_value('deploy_form')
        );
    }

    webforms_add_design_assets();
    return webforms_render_design_page(
        webforms_current_design_service_pack(),
        webforms_safe_query_value('design_form'),
        webforms_safe_query_value('design_tab')
    );
}

function webforms_add_design_assets() {
    if (function_exists('head_add_css')) {
        head_add_css('/addon/webforms/view/css/webforms.css?v=css-extract-1');
    }

    if (function_exists('head_add_js')) {
        head_add_js('/addon/webforms/view/js/webforms-design-state.js?v=hard-recovery-1');
        head_add_js('/addon/webforms/view/js/webforms-design-draft.js?v=import-route-1');
        head_add_js('/addon/webforms/view/js/webforms-design-session.js?v=import-route-1');
        head_add_js('/addon/webforms/view/js/webforms-package-shared.js?v=hard-recovery-1');
        head_add_js('/addon/webforms/view/js/webforms-design-package.js?v=workflow-panel-1');
        head_add_js('/addon/webforms/view/js/webforms-design-grid.js?v=workflow-panel-1');
        head_add_js('/addon/webforms/view/js/webforms-design-properties.js?v=textarea-default-1');
        head_add_js('/addon/webforms/view/js/webforms-design-json.js?v=hard-recovery-1');
        head_add_js('/addon/webforms/view/js/webforms-design-bundled.js?v=workflow-panel-1');
        head_add_js('/addon/webforms/view/js/webforms-design.js?v=workflow-panel-1');
        head_add_js('/addon/webforms/view/js/webforms-selectors.js?v=workflow-panel-1');
    }
}

function webforms_add_deploy_assets() {
    if (function_exists('head_add_css')) {
        head_add_css('/addon/webforms/view/css/webforms.css?v=css-extract-1');
    }

    if (function_exists('head_add_js')) {
        head_add_js('/addon/webforms/view/js/webforms-package-shared.js?v=hard-recovery-1');
        head_add_js('/addon/webforms/view/js/webforms-deploy.js?v=workflow-panel-1');
        head_add_js('/addon/webforms/view/js/webforms-deploy-attestation.js?v=attestation-prepare-1');
        head_add_js('/addon/webforms/view/js/webforms-selectors.js?v=workflow-panel-1');
    }
}
