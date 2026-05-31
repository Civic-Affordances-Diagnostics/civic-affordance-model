<?php

/**
 * Webforms attestation helpers.
 *
 * Boundary: Hubzilla/Webforms resolves the authenticated current channel's
 * latest eligible own post and submits a prepared package to orchestrator1.
 */

function webforms_handle_attestation_prepare_action()
{
    if (!local_channel()) {
        webforms_json_response(webforms_attestation_failure('not_authenticated', 'A current authenticated Hubzilla channel is required.'), 403);
    }

    $service_pack = webforms_safe_query_value('service_pack');
    $profile_id = webforms_safe_query_value('profile_id');

    if ($service_pack === '') {
        $service_pack = 'ipfs';
    }

    if ($profile_id === '') {
        $profile_id = 'ipfs-publication-default';
    }

    if ($service_pack !== 'ipfs') {
        webforms_json_response(webforms_attestation_failure('policy_blocked', 'Attestation prepare is currently available only for the IPFS service pack.'), 400);
    }

    $profile = webforms_service_profile_config($service_pack, $profile_id);
    if (!$profile) {
        webforms_json_response(webforms_attestation_failure('policy_blocked', 'Unknown service profile.'), 404);
    }

    $prepare_url = webforms_attestation_prepare_url_for_profile($profile);
    if ($prepare_url === '') {
        webforms_json_response(webforms_attestation_failure('policy_blocked', 'The selected service profile does not define an attestation prepare endpoint.'), 409);
    }

    $prepared = webforms_prepare_latest_own_hubzilla_post_package($profile);
    if (($prepared['status'] ?? '') !== 'prepared') {
        $http_status = (($prepared['error_code'] ?? '') === 'no_eligible_post') ? 404 : 409;
        webforms_json_response($prepared, $http_status);
    }

    $request = [
        'operation_id' => $prepared['operation_id'],
        'operation' => 'attestation.package.prepare',
        'target' => $profile['target'] ?? 'orchestrator1',
        'backend_role' => $profile['backend_role'] ?? 'ipfs_publication',
        'source_operation' => $prepared['operation'],
        'attestation_package' => $prepared,
    ];

    [$response, $error_message, $http_status] = webforms_post_json_url($prepare_url, $request);

    if ($response === null) {
        webforms_json_response([
            'operation_id' => $prepared['operation_id'],
            'operation' => 'attestation.package.prepare',
            'status' => 'failed',
            'stored' => false,
            'stored_path' => null,
            'source_status' => 'prepared',
            'payload_status' => $prepared['attestation_preview']['payload_status'] ?? 'prepared',
            'delivery_status' => $prepared['attestation_preview']['delivery_status'] ?? 'not_checked',
            'policy_status' => 'requires_review',
            'next_operations' => [],
            'completed_at' => gmdate('c'),
            'error_code' => 'orchestrator_prepare_failed',
            'error_message' => $error_message ?: 'Unable to submit prepared attestation package to orchestrator1.',
            'prepared_package' => $prepared,
            'http_status' => $http_status,
        ], 502);
    }

    webforms_json_response(webforms_attestation_prepare_response($response, $prepared, $http_status), 200);
}

function webforms_attestation_prepare_url_for_profile(array $profile)
{
    $configured = isset($profile['prepare_url']) ? trim((string) $profile['prepare_url']) : '';
    if ($configured !== '') {
        return $configured;
    }

    $target = isset($profile['target']) ? (string) $profile['target'] : '';
    $backend_role = isset($profile['backend_role']) ? (string) $profile['backend_role'] : '';

    if ($target === 'orchestrator1' && $backend_role === 'ipfs_publication') {
        return 'http://10.0.0.105:8700/attestations/packages/prepare';
    }

    return '';
}

function webforms_prepare_latest_own_hubzilla_post_package(array $profile = [])
{
    $channel_id = (int) local_channel();
    if ($channel_id <= 0) {
        return webforms_attestation_failure('no_current_channel', 'No current Hubzilla channel is selected.');
    }

    $channel = webforms_current_channel_row($channel_id);
    if (!$channel) {
        return webforms_attestation_failure('no_current_channel', 'Unable to load the current Hubzilla channel.');
    }

    $rows = q(
        "SELECT id, uuid, mid, uid, parent, parent_mid, created, edited, changed, received,
                owner_xchan, author_xchan, mimetype, title, summary, verb, obj_type,
                llink, plink, item_private, item_origin, item_wall, item_thread_top,
                item_hidden, item_unpublished, item_deleted, body, sig
           FROM item
          WHERE uid = %d
            AND item_origin = 1
            AND item_deleted = 0
            AND item_unpublished = 0
            AND item_hidden = 0
            AND id = parent
            AND mid = parent_mid
            AND verb = 'Create'
            AND obj_type = 'Note'
            AND body <> ''
          ORDER BY created DESC, id DESC
          LIMIT 1",
        intval($channel_id)
    );

    if (!$rows || !isset($rows[0])) {
        return webforms_attestation_failure('no_eligible_post', 'No latest eligible own Hubzilla post was found for the current channel.');
    }

    $post = $rows[0];

    if ((int) $post['uid'] !== $channel_id) {
        return webforms_attestation_failure('post_not_owned_by_channel', 'The selected post does not belong to the current channel.');
    }

    if ((int) $post['item_origin'] !== 1) {
        return webforms_attestation_failure('post_not_origin', 'The selected post is not an origin post for this channel.');
    }

    $encoded = webforms_encode_hubzilla_item_payload([$post]);
    if (($encoded['error_code'] ?? '') !== '') {
        return webforms_attestation_failure($encoded['error_code'], $encoded['error_message'] ?? 'Unable to encode Hubzilla post payload.');
    }

    $identity = webforms_attestation_identity_row((string) $post['author_xchan']);
    $delivery_manifest = webforms_attestation_delivery_manifest($channel_id, (string) $post['mid']);
    $operation_id = webforms_attestation_operation_id('attestation.hubzilla_post.latest.prepare');
    $delivery_status = ($delivery_manifest['delivery_report_count'] > 0) ? 'manifest_collected' : 'manifest_empty';

    return [
        'operation_id' => $operation_id,
        'operation' => 'attestation.hubzilla_post.latest.prepare',
        'status' => 'prepared',
        'source' => [
            'retrieval_method' => 'local_hubzilla_source',
            'channel_scope' => 'authenticated_current_channel',
            'channel_id' => $channel_id,
            'channel_address' => $channel['channel_address'] ?? '',
            'channel_hash' => $channel['channel_hash'] ?? '',
            'channel_guid' => $channel['channel_guid'] ?? '',
        ],
        'identity' => $identity,
        'post' => webforms_attestation_post_summary($post),
        'nomad_payload' => $encoded['nomad_payload'],
        'delivery_manifest' => $delivery_manifest,
        'attestation_preview' => [
            'schema' => 'us.civic-infra.attestation.hubzilla-own-post.v0.1',
            'attestation_type' => 'own_hubzilla_post',
            'source_event' => 'latest_eligible_own_post',
            'payload_status' => 'prepared',
            'delivery_status' => $delivery_status,
            'policy_status' => 'allowed',
        ],
        'publication_plan' => [
            'target' => $profile['target'] ?? 'orchestrator1',
            'backend_role' => $profile['backend_role'] ?? 'ipfs_publication',
            'next_operations' => [
                'attestation.package.prepare',
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

function webforms_current_channel_row($channel_id)
{
    if (function_exists('channelx_by_n')) {
        $channel = channelx_by_n((int) $channel_id);
        if ($channel) {
            return $channel;
        }
    }

    $rows = q(
        "SELECT channel_id, channel_name, channel_address, channel_hash, channel_guid
           FROM channel
          WHERE channel_id = %d
          LIMIT 1",
        intval($channel_id)
    );

    return ($rows && isset($rows[0])) ? $rows[0] : null;
}

function webforms_encode_hubzilla_item_payload(array $item_rows)
{
    if (!function_exists('xchan_query') || !function_exists('fetch_post_tags') || !class_exists('Zotlabs\\Lib\\Activity')) {
        return [
            'error_code' => 'payload_encode_failed',
            'error_message' => 'Hubzilla item encoding helpers are not available in the current runtime context.',
        ];
    }

    $items = $item_rows;
    xchan_query($items, true);
    $items = fetch_post_tags($items, true);

    if (!$items || !isset($items[0])) {
        return [
            'error_code' => 'payload_encode_failed',
            'error_message' => 'Hubzilla post tags or identity expansion failed.',
        ];
    }

    $encoded_item = \Zotlabs\Lib\Activity::encode_item($items[0]);
    if (!is_array($encoded_item)) {
        return [
            'error_code' => 'payload_encode_failed',
            'error_message' => 'Activity::encode_item did not return an activity object.',
        ];
    }

    $context = [];
    if (defined('ACTIVITYSTREAMS_JSONLD_REV')) {
        $context[] = ACTIVITYSTREAMS_JSONLD_REV;
    }
    else {
        $context[] = 'https://www.w3.org/ns/activitystreams';
    }
    $context[] = 'https://w3id.org/security/v1';
    if (defined('ZOT_APSCHEMA_REV') && function_exists('z_root')) {
        $context[] = z_root() . ZOT_APSCHEMA_REV;
    }

    $payload = array_merge(['@context' => $context], $encoded_item);
    $json = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    if (!is_string($json) || $json === '') {
        return [
            'error_code' => 'payload_encode_failed',
            'error_message' => 'Unable to JSON-encode the Hubzilla activity payload.',
        ];
    }

    return [
        'error_code' => '',
        'nomad_payload' => [
            'media_type' => 'application/x-zot+json',
            'encoding_method' => 'Activity::encode_item + @context',
            'json' => $payload,
            'sha256' => hash('sha256', $json),
            'size_bytes' => strlen($json),
        ],
    ];
}

function webforms_attestation_identity_row($xchan_hash)
{
    $identity = [
        'xchan_hash' => $xchan_hash,
    ];

    if ($xchan_hash === '') {
        return $identity;
    }

    $rows = q(
        "SELECT xchan_hash, xchan_guid, xchan_addr, xchan_url, xchan_name, xchan_network,
                xchan_hidden, xchan_orphan, xchan_censored, xchan_deleted,
                xchan_guid_sig, xchan_pubkey
           FROM xchan
          WHERE xchan_hash = '%s'
          LIMIT 1",
        dbesc($xchan_hash)
    );

    if (!$rows || !isset($rows[0])) {
        return $identity;
    }

    $row = $rows[0];
    return [
        'xchan_hash' => $row['xchan_hash'] ?? '',
        'xchan_guid' => $row['xchan_guid'] ?? '',
        'xchan_addr' => $row['xchan_addr'] ?? '',
        'xchan_url' => $row['xchan_url'] ?? '',
        'xchan_name' => $row['xchan_name'] ?? '',
        'xchan_network' => $row['xchan_network'] ?? '',
        'xchan_hidden' => (int) ($row['xchan_hidden'] ?? 0),
        'xchan_orphan' => (int) ($row['xchan_orphan'] ?? 0),
        'xchan_censored' => (int) ($row['xchan_censored'] ?? 0),
        'xchan_deleted' => (int) ($row['xchan_deleted'] ?? 0),
        'xchan_guid_sig_len' => strlen((string) ($row['xchan_guid_sig'] ?? '')),
        'xchan_guid_sig_sha256' => hash('sha256', (string) ($row['xchan_guid_sig'] ?? '')),
        'xchan_pubkey_len' => strlen((string) ($row['xchan_pubkey'] ?? '')),
        'xchan_pubkey_sha256' => hash('sha256', (string) ($row['xchan_pubkey'] ?? '')),
    ];
}

function webforms_attestation_post_summary(array $post)
{
    $body = (string) ($post['body'] ?? '');
    $sig = (string) ($post['sig'] ?? '');

    return [
        'item_id' => (int) ($post['id'] ?? 0),
        'uuid' => $post['uuid'] ?? '',
        'mid' => $post['mid'] ?? '',
        'title' => $post['title'] ?? '',
        'summary' => $post['summary'] ?? '',
        'mimetype' => $post['mimetype'] ?? '',
        'verb' => $post['verb'] ?? '',
        'obj_type' => $post['obj_type'] ?? '',
        'created' => $post['created'] ?? '',
        'edited' => $post['edited'] ?? '',
        'changed' => $post['changed'] ?? '',
        'llink' => $post['llink'] ?? '',
        'plink' => $post['plink'] ?? '',
        'body_len' => strlen($body),
        'body_sha256' => hash('sha256', $body),
        'sig_len' => strlen($sig),
        'sig_sha256' => hash('sha256', $sig),
    ];
}

function webforms_attestation_delivery_manifest($channel_id, $mid)
{
    $rows = q(
        "SELECT dreport_channel, dreport_site, dreport_result, dreport_name, dreport_time, dreport_xchan, dreport_queue
           FROM dreport
          WHERE dreport_mid = '%s'
            AND (dreport_channel = %d OR dreport_channel = 0)
          ORDER BY dreport_time ASC, dreport_id ASC",
        dbesc($mid),
        intval($channel_id)
    );

    $reports = [];
    if ($rows) {
        foreach ($rows as $row) {
            $reports[] = [
                'dreport_channel' => (int) ($row['dreport_channel'] ?? 0),
                'dreport_site' => $row['dreport_site'] ?? '',
                'dreport_result' => $row['dreport_result'] ?? '',
                'dreport_name' => $row['dreport_name'] ?? '',
                'dreport_time' => $row['dreport_time'] ?? '',
                'dreport_xchan' => $row['dreport_xchan'] ?? '',
                'dreport_queue' => $row['dreport_queue'] ?? '',
            ];
        }
    }

    return [
        'dreport_mid' => $mid,
        'delivery_report_count' => count($reports),
        'reports' => $reports,
    ];
}

function webforms_post_json_url($url, array $payload)
{
    $body = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (!is_string($body)) {
        return [null, 'Unable to encode JSON request body.', 0];
    }

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json',
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        $raw = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($raw === false || $raw === '') {
            return [null, $error ?: 'Empty response from orchestrator prepare endpoint.', $status];
        }

        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            return [null, 'Orchestrator prepare endpoint did not return JSON.', $status];
        }

        if ($status < 200 || $status >= 300) {
            return [null, $decoded['error_message'] ?? ('HTTP ' . $status . ' from orchestrator prepare endpoint.'), $status];
        }

        return [$decoded, '', $status];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\nAccept: application/json\r\n",
            'content' => $body,
            'timeout' => 15,
            'ignore_errors' => true,
        ],
    ]);

    $raw = @file_get_contents($url, false, $context);
    $status = webforms_http_status_from_headers($http_response_header ?? []);

    if (!is_string($raw) || $raw === '') {
        return [null, 'Empty response from orchestrator prepare endpoint.', $status];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return [null, 'Orchestrator prepare endpoint did not return JSON.', $status];
    }

    if ($status < 200 || $status >= 300) {
        return [null, $decoded['error_message'] ?? ('HTTP ' . $status . ' from orchestrator prepare endpoint.'), $status];
    }

    return [$decoded, '', $status];
}

function webforms_http_status_from_headers(array $headers)
{
    if (!$headers || !isset($headers[0])) {
        return 0;
    }

    if (preg_match('/\s(\d{3})\s/', $headers[0], $matches)) {
        return (int) $matches[1];
    }

    return 0;
}

function webforms_attestation_prepare_response(array $response, array $prepared, $http_status)
{
    $response['operation_id'] = $response['operation_id'] ?? $prepared['operation_id'];
    $response['operation'] = $response['operation'] ?? 'attestation.package.prepare';
    $response['status'] = $response['status'] ?? 'prepared';
    $response['stored'] = $response['stored'] ?? false;
    $response['stored_path'] = $response['stored_path'] ?? null;
    $response['source_status'] = $response['source_status'] ?? 'prepared';
    $response['payload_status'] = $response['payload_status'] ?? ($prepared['attestation_preview']['payload_status'] ?? 'prepared');
    $response['delivery_status'] = $response['delivery_status'] ?? ($prepared['attestation_preview']['delivery_status'] ?? 'not_checked');
    $response['policy_status'] = $response['policy_status'] ?? ($prepared['attestation_preview']['policy_status'] ?? 'requires_review');
    $response['next_operations'] = $response['next_operations'] ?? ($prepared['publication_plan']['next_operations'] ?? []);
    $response['completed_at'] = $response['completed_at'] ?? gmdate('c');
    $response['error_code'] = $response['error_code'] ?? null;
    $response['error_message'] = $response['error_message'] ?? null;
    $response['prepared_package'] = $prepared;
    $response['http_status'] = $http_status;

    return $response;
}

function webforms_attestation_failure($code, $message)
{
    return [
        'operation_id' => webforms_attestation_operation_id('attestation.hubzilla_post.latest.prepare'),
        'operation' => 'attestation.hubzilla_post.latest.prepare',
        'status' => 'failed',
        'stored' => false,
        'stored_path' => null,
        'source_status' => 'failed',
        'payload_status' => 'not_checked',
        'delivery_status' => 'not_checked',
        'policy_status' => ($code === 'policy_blocked') ? 'blocked' : 'requires_review',
        'next_operations' => [],
        'completed_at' => gmdate('c'),
        'error_code' => $code,
        'error_message' => $message,
    ];
}

function webforms_attestation_operation_id($operation)
{
    try {
        $suffix = bin2hex(random_bytes(4));
    }
    catch (Exception $e) {
        $suffix = str_replace('.', '', uniqid('', true));
    }

    return $operation . ':' . gmdate('Ymd\THis\Z') . ':' . $suffix;
}
