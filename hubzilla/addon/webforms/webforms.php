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

function webforms_operation_query_value() {
	if (!isset($_GET['operation'])) {
		return '';
	}

	$operation = (string) $_GET['operation'];
	return preg_match('/^[a-z0-9_.-]+$/', $operation) ? $operation : '';
}

function webforms_json_request_body() {
	$raw = @file_get_contents('php://input');
	if ($raw === false || trim($raw) === '') {
		return [];
	}

	$data = json_decode($raw, true);
	if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
		webforms_json_response([
			'status' => 'failed',
			'error_code' => 'invalid_request_json',
			'error_message' => 'The request body was not valid JSON.',
		], 400);
	}

	return $data;
}

function webforms_request_string($body, $name, $pattern = '/^[A-Za-z0-9:._-]+$/') {
	$value = '';
	if (isset($body[$name]) && is_scalar($body[$name])) {
		$value = (string) $body[$name];
	}
	elseif (isset($_GET[$name])) {
		$value = (string) $_GET[$name];
	}

	$value = trim($value);
	if ($value === '') {
		return '';
	}

	return preg_match($pattern, $value) ? $value : '';
}

function webforms_service_profile_config($service_pack, $profile_id) {
	$profiles = webforms_config_section('service_profiles');
	if (!isset($profiles[$service_pack][$profile_id]) || !is_array($profiles[$service_pack][$profile_id])) {
		return [];
	}

	return $profiles[$service_pack][$profile_id];
}

function webforms_orchestrator_base_for_profile($profile) {
	$status_url = $profile['status_url'] ?? '';
	$parts = parse_url($status_url);
	if (!$parts || empty($parts['scheme']) || empty($parts['host'])) {
		return '';
	}

	$base = $parts['scheme'] . '://' . $parts['host'];
	if (!empty($parts['port'])) {
		$base .= ':' . $parts['port'];
	}

	return $base;
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

function webforms_post_json_url($url, $body, $timeout = 20) {
	if ($url === '' || !preg_match('/^https?:\/\//', $url)) {
		return [null, 'invalid_url', 0];
	}

	$payload = json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
	if ($payload === false) {
		return [null, 'json_encode_failed', 0];
	}

	if (function_exists('curl_init')) {
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
		curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
		curl_setopt($ch, CURLOPT_HTTPHEADER, [
			'Accept: application/json',
			'Content-Type: application/json',
		]);

		$raw = curl_exec($ch);
		$error = curl_error($ch);
		$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);

		if ($raw === false || $raw === '') {
			return [null, $error !== '' ? $error : 'empty_response', $status];
		}
	}
	else {
		$context = stream_context_create([
			'http' => [
				'method' => 'POST',
				'timeout' => $timeout,
				'ignore_errors' => true,
				'header' => "Accept: application/json\r\nContent-Type: application/json\r\n",
				'content' => $payload,
			],
		]);
		$raw = @file_get_contents($url, false, $context);
		$status = 0;
		if (isset($http_response_header) && is_array($http_response_header)) {
			foreach ($http_response_header as $header) {
				if (preg_match('/^HTTP\/\S+\s+(\d+)/', $header, $m)) {
					$status = (int) $m[1];
					break;
				}
			}
		}
		if ($raw === false || $raw === '') {
			return [null, 'request_failed', $status];
		}
	}

	$data = json_decode($raw, true);
	if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
		return [null, 'invalid_json', $status];
	}

	if ($status >= 400) {
		$error = $data['detail'] ?? ($data['error_message'] ?? ('http_status_' . $status));
		return [$data, is_scalar($error) ? (string) $error : 'http_status_' . $status, $status];
	}

	return [$data, '', $status];
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

function webforms_handle_attestation_action() {
	$service_pack = webforms_safe_query_value('service_pack');
	if ($service_pack === '') {
		$service_pack = 'ipfs';
	}

	$body = webforms_json_request_body();
	$profile_id = webforms_request_string($body, 'profile_id', '/^[a-z0-9_-]+$/');
	if ($profile_id === '') {
		$profile_id = webforms_safe_query_value('profile_id');
	}
	if ($profile_id === '') {
		$profile_id = 'ipfs-publication-default';
	}

	$profile = webforms_service_profile_config($service_pack, $profile_id);
	if (!$profile) {
		webforms_json_response([
			'status' => 'failed',
			'error_code' => 'unknown_profile',
			'error_message' => 'The requested service profile is not configured on this Hubzilla node.',
		], 404);
	}

	$base_url = webforms_orchestrator_base_for_profile($profile);
	if ($base_url === '') {
		webforms_json_response([
			'status' => 'failed',
			'error_code' => 'orchestrator_base_unavailable',
			'error_message' => 'The selected profile does not provide an orchestrator base URL.',
		], 500);
	}

	$operation = webforms_operation_query_value();
	if ($operation === '') {
		webforms_handle_attestation_prepare_package($base_url, $profile);
	}

	webforms_handle_attestation_orchestrator_operation($base_url, $operation, $body);
}

function webforms_handle_attestation_prepare_package($base_url, $profile) {
	$package = webforms_prepare_latest_own_post_package($profile);

	[$data, $error, $status] = webforms_post_json_url($base_url . '/attestations/packages/prepare', $package, 30);
	if ($data === null) {
		webforms_json_response([
			'operation_id' => $package['operation_id'] ?? '',
			'operation' => 'attestation.package.prepare',
			'status' => 'failed',
			'stored' => false,
			'prepared_package' => $package,
			'error_code' => 'orchestrator_prepare_failed',
			'error_message' => $error !== '' ? $error : 'The orchestrator prepare endpoint did not return usable JSON.',
		], $status >= 400 ? $status : 502);
	}

	if (!isset($data['prepared_package'])) {
		$data['prepared_package'] = $package;
	}
	if (!isset($data['operation_id'])) {
		$data['operation_id'] = $package['operation_id'] ?? '';
	}

	webforms_json_response($data, $status >= 400 ? $status : 200);
}

function webforms_handle_attestation_orchestrator_operation($base_url, $operation, $body) {
	$endpoint_map = [
		'ipfs.cid.prepare' => '/ipfs/cid/prepare',
		'ipfs.cid.publish' => '/ipfs/cid/publish',
		'ipfs.cid.pin' => '/ipfs/cid/pin',
		'git_posix.path_reference.create' => '/git-posix/path-reference/create',
		'ipfs.cid.read_verify' => '/ipfs/cid/read-verify',
	];

	if (!isset($endpoint_map[$operation])) {
		webforms_json_response([
			'operation' => $operation,
			'status' => 'failed',
			'error_code' => 'unsupported_operation',
			'error_message' => 'This Webforms action does not support the requested operation.',
		], 400);
	}

	$operation_id = webforms_request_string($body, 'operation_id', '/^[A-Za-z0-9:._-]+$/');
	if ($operation_id === '') {
		webforms_json_response([
			'operation' => $operation,
			'status' => 'failed',
			'error_code' => 'missing_operation_id',
			'error_message' => 'Missing prepared attestation operation_id.',
		], 400);
	}

	$request = ['operation_id' => $operation_id];

	if ($operation === 'git_posix.path_reference.create') {
		$posix_path = webforms_request_string($body, 'posix_path', '/^[A-Za-z0-9._\/-]+$/');
		if ($posix_path === '' || strpos($posix_path, '..') !== false || strpos($posix_path, '/') === 0) {
			webforms_json_response([
				'operation' => $operation,
				'operation_id' => $operation_id,
				'status' => 'failed',
				'error_code' => 'invalid_posix_path',
				'error_message' => 'Missing or invalid POSIX path reference.',
			], 400);
		}

		$request['posix_path'] = $posix_path;
		$request['path_role'] = webforms_request_string($body, 'path_role', '/^[A-Za-z0-9._-]+$/') ?: 'attestation_record';
		$request['commit_message'] = isset($body['commit_message']) && is_scalar($body['commit_message'])
			? trim((string) $body['commit_message'])
			: 'Create Hubzilla own-post attestation path reference';

		if (isset($body['manifest_title']) && is_scalar($body['manifest_title'])) {
			$request['manifest_title'] = trim((string) $body['manifest_title']);
		}
		if (isset($body['manifest_description']) && is_scalar($body['manifest_description'])) {
			$request['manifest_description'] = trim((string) $body['manifest_description']);
		}
	}

	[$data, $error, $status] = webforms_post_json_url($base_url . $endpoint_map[$operation], $request, 30);
	if ($data === null) {
		webforms_json_response([
			'operation' => $operation,
			'operation_id' => $operation_id,
			'status' => 'failed',
			'error_code' => 'orchestrator_operation_failed',
			'error_message' => $error !== '' ? $error : 'The orchestrator operation endpoint did not return usable JSON.',
		], $status >= 400 ? $status : 502);
	}

	webforms_json_response($data, $status >= 400 ? $status : 200);
}

function webforms_prepare_latest_own_post_package($profile) {
	if (!local_channel()) {
		webforms_json_response([
			'operation' => 'attestation.package.prepare',
			'status' => 'failed',
			'source_status' => 'requires_authenticated_channel',
			'error_code' => 'not_authenticated',
			'error_message' => 'An authenticated current channel is required to attest an own Hubzilla post.',
		], 403);
	}

	$channel = webforms_current_channel_record();
	if (!$channel) {
		webforms_json_response([
			'operation' => 'attestation.package.prepare',
			'status' => 'failed',
			'source_status' => 'channel_not_found',
			'error_code' => 'channel_not_found',
			'error_message' => 'The current Hubzilla channel could not be resolved.',
		], 404);
	}

	$item = webforms_latest_own_post($channel);
	if (!$item) {
		webforms_json_response([
			'operation' => 'attestation.package.prepare',
			'status' => 'failed',
			'source_status' => 'latest_post_not_found',
			'error_code' => 'latest_post_not_found',
			'error_message' => 'No eligible latest own Hubzilla post was found for the current channel.',
		], 404);
	}

	$xchan = webforms_xchan_record($channel['channel_hash'] ?? '');
	$encoded_item = webforms_encode_hubzilla_item($item);
	$encoded_json = webforms_json_canonical($encoded_item);
	$post_uuid = webforms_post_uuid($item);
	$operation_id = 'attestation.hubzilla_post.latest.prepare:' . gmdate('Ymd\THis\Z') . ':' . substr(hash('sha256', ($item['mid'] ?? '') . microtime(true)), 0, 8);
	$delivery_reports = webforms_delivery_reports_for_item($item, (int) $channel['channel_id']);

	return [
		'operation_id' => $operation_id,
		'operation' => 'attestation.hubzilla_post.latest.prepare',
		'status' => 'prepared',
		'source' => [
			'system' => 'hubzilla',
			'source_type' => 'latest_own_post',
			'channel_scope' => 'authenticated_current_channel',
			'channel_id' => (int) ($channel['channel_id'] ?? 0),
			'channel_address' => (string) ($channel['channel_address'] ?? ''),
			'channel_hash' => (string) ($channel['channel_hash'] ?? ''),
			'channel_name' => (string) ($channel['channel_name'] ?? ''),
		],
		'identity' => [
			'xchan_hash' => (string) ($xchan['xchan_hash'] ?? ($channel['channel_hash'] ?? '')),
			'xchan_addr' => (string) ($xchan['xchan_addr'] ?? ''),
			'xchan_name' => (string) ($xchan['xchan_name'] ?? ($channel['channel_name'] ?? '')),
			'xchan_url' => (string) ($xchan['xchan_url'] ?? ''),
		],
		'post' => [
			'item_id' => (int) ($item['id'] ?? 0),
			'uuid' => $post_uuid,
			'mid' => (string) ($item['mid'] ?? ''),
			'parent_mid' => (string) ($item['parent_mid'] ?? ''),
			'title' => (string) ($item['title'] ?? ''),
			'created' => (string) ($item['created'] ?? ''),
			'edited' => (string) ($item['edited'] ?? ''),
			'author_xchan' => (string) ($item['author_xchan'] ?? ''),
			'owner_xchan' => (string) ($item['owner_xchan'] ?? ''),
			'body_sha256' => hash('sha256', (string) ($item['body'] ?? '')),
			'sig_sha256' => hash('sha256', (string) ($item['sig'] ?? '')),
		],
		'nomad_payload' => [
			'encoding' => 'hubzilla.encode_item',
			'format' => 'application/x-zot+json',
			'item' => $encoded_item,
			'sha256' => hash('sha256', $encoded_json),
			'size_bytes' => strlen($encoded_json),
		],
		'delivery_manifest' => [
			'source' => 'hubzilla.dreport',
			'match_rule' => 'exact_mid_and_current_channel_or_zero',
			'delivery_status' => count($delivery_reports) ? 'manifest_collected' : 'manifest_empty',
			'delivery_report_count' => count($delivery_reports),
			'reports' => $delivery_reports,
		],
		'attestation_preview' => [
			'schema' => 'us.civic-infra.attestation.hubzilla-own-post.v0.1',
			'attestation_type' => 'hubzilla_own_post',
			'source_event' => 'latest_eligible_own_post',
			'payload_status' => 'prepared',
			'delivery_status' => count($delivery_reports) ? 'manifest_collected' : 'manifest_empty',
			'policy_status' => 'allowed',
		],
		'publication_plan' => [
			'target' => $profile['target'] ?? 'orchestrator1',
			'backend_role' => $profile['backend_role'] ?? 'ipfs_publication',
			'backend_node' => $profile['backend_node'] ?? 'ipfs1.diagnostics.kane-il.us',
			'next_operations' => [
				'ipfs.cid.prepare',
				'ipfs.cid.publish',
				'ipfs.cid.pin',
				'git_posix.path_reference.create',
				'ipfs.cid.read_verify',
			],
		],
		'error_code' => null,
		'error_message' => null,
	];
}

function webforms_current_channel_record() {
	$channel_id = (int) local_channel();
	$r = q("select * from channel where channel_id = %d limit 1", $channel_id);
	return $r ? $r[0] : null;
}

function webforms_latest_own_post($channel) {
	if (!is_array($channel) || empty($channel['channel_id']) || empty($channel['channel_hash'])) {
		return null;
	}

	$r = q(
		"select * from item where uid = %d and author_xchan = '%s' and item_deleted = 0 and item_type = 0 and parent = id order by created desc limit 1",
		(int) $channel['channel_id'],
		dbesc($channel['channel_hash'])
	);

	return $r ? $r[0] : null;
}

function webforms_xchan_record($xchan_hash) {
	if ($xchan_hash === '') {
		return null;
	}

	$r = q("select * from xchan where xchan_hash = '%s' limit 1", dbesc($xchan_hash));
	return $r ? $r[0] : null;
}

function webforms_delivery_reports_for_item($item, $channel_id) {
	$mid = (string) ($item['mid'] ?? '');
	if ($mid === '') {
		return [];
	}

	$r = q(
		"select * from dreport where dreport_mid = '%s' and (dreport_channel = %d or dreport_channel = 0) order by dreport_time asc",
		dbesc($mid),
		(int) $channel_id
	);

	if (!$r) {
		return [];
	}

	return array_map('webforms_scalar_row', $r);
}

function webforms_encode_hubzilla_item($item) {
	if (!function_exists('encode_item') && is_readable('include/items.php')) {
		require_once 'include/items.php';
	}

	if (function_exists('encode_item')) {
		$encoded = encode_item($item, true);
		if (is_array($encoded)) {
			return $encoded;
		}
	}

	return webforms_scalar_row($item);
}

function webforms_scalar_row($row) {
	$out = [];
	foreach ((array) $row as $key => $value) {
		if (is_scalar($value) || $value === null) {
			$out[$key] = $value;
		}
	}
	return $out;
}

function webforms_post_uuid($item) {
	if (!empty($item['uuid'])) {
		return (string) $item['uuid'];
	}

	$mid = (string) ($item['mid'] ?? '');
	if (preg_match('/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i', $mid, $m)) {
		return strtolower($m[1]);
	}

	return substr(hash('sha256', $mid), 0, 32);
}

function webforms_json_canonical($value) {
	$encoded = json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
	return $encoded === false ? '' : $encoded;
}

function webforms_handle_action_if_needed() {
	if (webforms_current_action() === 'service_profile_status') {
		webforms_handle_service_profile_status_action();
	}

	if (webforms_current_action() === 'attestation_prepare') {
		webforms_handle_attestation_action();
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
		head_add_js('/addon/webforms/view/js/webforms-deploy-attestation.js?v=publication-chain-1');
		head_add_js('/addon/webforms/view/js/webforms-selectors.js?v=workflow-panel-1');
	}
}
