(function () {
    'use strict';

    let wireQueued = false;
    let lastPreparedOperationId = '';
    let lastPreparedPackage = null;
    let lastCidPrepared = false;
    let lastCidPublished = false;
    let lastCidPinned = false;
    let lastPathCreated = false;

    function init() {
        const runtime = document.getElementById('webforms-runtime');
        const root = document.getElementById('webforms-deploy-render-root');
        if (!runtime || runtime.dataset.webformsMode !== 'deploy' || !root) {
            return;
        }

        const observer = new MutationObserver(function () {
            queueWire(root);
        });
        observer.observe(root, { childList: true, subtree: true });
        queueWire(root);
    }

    function queueWire(root) {
        if (wireQueued) {
            return;
        }
        wireQueued = true;
        window.setTimeout(function () {
            wireQueued = false;
            wireAttestationControls(root);
        }, 0);
    }

    function wireAttestationControls(root) {
        const preparePanel = root.querySelector('[data-webforms-layout-id="box-prepare-package"]');
        if (!preparePanel) {
            return;
        }

        cleanAttestationPanels(root);

        let bar = root.querySelector('[data-webforms-attestation-actions="1"]');
        if (!bar) {
            bar = document.createElement('div');
            bar.dataset.webformsAttestationActions = '1';
            bar.style.display = 'flex';
            bar.style.flexWrap = 'wrap';
            bar.style.gap = '8px';
            bar.style.alignItems = 'center';
            bar.style.margin = '12px 0';
            bar.style.padding = '10px';
            bar.style.border = '1px solid #d8d8d8';
            bar.style.borderRadius = '4px';
            bar.style.background = '#f8f9fa';
            insertActionBar(root, preparePanel, bar);
        }

        addActionButton(bar, 'Prepare Package', 'attestation.prepare', 'primary', 'prepare', false, function (button) {
            prepareAttestation(root, button);
        });
        addActionButton(bar, 'Prepare CID', 'attestation.cid.prepare', 'secondary', 'cidPrepare', true, function (button) {
            prepareCid(root, button);
        });
        addActionButton(bar, 'Publish CID', 'attestation.cid.publish', 'secondary', 'cidPublish', true, function (button) {
            publishCid(root, button);
        });
        addActionButton(bar, 'Pin CID', 'attestation.cid.pin', 'secondary', 'cidPin', true, function (button) {
            pinCid(root, button);
        });
        addActionButton(bar, 'Add POSIX Path', 'attestation.git_posix.create', 'secondary', 'pathCreate', true, function (button) {
            createPathReference(root, button);
        });
        addActionButton(bar, 'Read / Verify', 'attestation.cid.read_verify', 'secondary', 'readVerify', true, function (button) {
            readVerifyCid(root, button);
        });

        syncButtonState(root);
    }

    function addActionButton(bar, label, action, variant, key, disabled, onClick) {
        const selector = '[data-webforms-attestation-key="' + cssEscape(key) + '"]';
        if (bar.querySelector(selector)) {
            return;
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-sm btn-' + variant;
        button.textContent = label;
        button.dataset.webformsAction = action;
        button.dataset.webformsAttestationKey = key;
        button.disabled = Boolean(disabled);
        button.addEventListener('click', function () {
            onClick(button);
        });
        bar.appendChild(button);
    }

    function insertActionBar(root, preparePanel, bar) {
        let anchor = preparePanel;
        while (anchor.parentElement && anchor.parentElement !== root) {
            anchor = anchor.parentElement;
        }

        if (anchor && anchor.parentElement === root) {
            root.insertBefore(bar, anchor);
        }
        else {
            root.insertBefore(bar, root.firstChild);
        }
    }

    async function prepareAttestation(root, button) {
        const servicePack = currentServicePack();
        const profileId = fieldValue(root, 'service_profile_id') || 'ipfs-publication-default';
        const previousLabel = button.textContent;

        resetOperationState();
        syncButtonState(root);

        button.disabled = true;
        button.textContent = 'Preparing...';
        setFieldValue(root, 'prepare_status', 'preparing');
        setFieldValue(root, 'stored', 'false');
        setFieldValue(root, 'stored_path', '');
        setPanelText(root, 'result-prepare-expected', 'Prepare Package\nstatus: preparing\nprofile: ' + profileId);
        setPanelText(root, 'result-attestation', 'Preparing package through Hubzilla/Webforms and orchestrator1.');

        try {
            const url = 'webforms?webforms_action=attestation_prepare' +
                '&service_pack=' + encodeURIComponent(servicePack) +
                '&profile_id=' + encodeURIComponent(profileId);
            const response = await fetch(url, {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' }
            });
            const data = await responseJson(response);
            if (!response.ok || !data || data.status === 'failed') {
                throw new Error(errorText(data) || 'attestation prepare failed');
            }
            updatePrepareResults(root, data);
        }
        catch (error) {
            setFieldValue(root, 'prepare_status', 'failed');
            setFieldValue(root, 'current_channel_status', 'requires authenticated channel');
            setFieldValue(root, 'latest_post_status', 'not resolved');
            setFieldValue(root, 'resolution_status', 'failed');
            setFieldValue(root, 'stored', 'false');
            setPanelText(root, 'result-prepare-expected', 'Prepare Package\nstatus: failed\nerror: ' + error.message);
            setPanelText(root, 'result-attestation', 'Prepare Package failed.\nerror: ' + error.message);
        }
        finally {
            button.disabled = false;
            button.textContent = previousLabel;
            syncButtonState(root);
        }
    }

    async function prepareCid(root, button) {
        if (!lastPreparedOperationId) {
            setPanelText(root, 'result-attestation', 'Prepare CID\nstatus: failed\nerror: Prepare Package must succeed first.');
            return;
        }

        const data = await runOperation(root, button, 'ipfs.cid.prepare', 'Prepare CID', 'Preparing...', {
            operation_id: lastPreparedOperationId
        });
        if (!data) {
            return;
        }

        lastCidPrepared = true;
        setPanelText(root, 'result-attestation', formatCidPrepareResponse(data));
        syncButtonState(root);
    }

    async function publishCid(root, button) {
        if (!lastPreparedOperationId || !lastCidPrepared) {
            setPanelText(root, 'result-attestation', 'Publish CID\nstatus: failed\nerror: Prepare CID must succeed first.');
            return;
        }

        const data = await runOperation(root, button, 'ipfs.cid.publish', 'Publish CID', 'Publishing...', {
            operation_id: lastPreparedOperationId
        });
        if (!data) {
            return;
        }

        lastCidPublished = data.status === 'published' || data.publish_status === 'published' || Boolean(data.cid);
        setPanelText(root, 'result-attestation', formatCidPublishResponse(data));
        syncButtonState(root);
    }

    async function pinCid(root, button) {
        if (!lastPreparedOperationId || !lastCidPublished) {
            setPanelText(root, 'result-attestation', 'Pin CID\nstatus: failed\nerror: Publish CID must succeed first.');
            return;
        }

        const data = await runOperation(root, button, 'ipfs.cid.pin', 'Pin CID', 'Pinning...', {
            operation_id: lastPreparedOperationId
        });
        if (!data) {
            return;
        }

        lastCidPinned = data.status === 'pinned' || data.pin_status === 'pinned';
        setPanelText(root, 'result-attestation', formatPinResponse(data));
        syncButtonState(root);
    }

    async function createPathReference(root, button) {
        if (!lastPreparedOperationId || !lastCidPinned) {
            setPanelText(root, 'result-attestation', 'Add POSIX Path\nstatus: failed\nerror: Pin CID must succeed first.');
            return;
        }

        const posixPath = pathForPreparedPackage(lastPreparedPackage);
        const uuid = preparedPostValue(lastPreparedPackage, 'uuid') || 'own-post-attestation';
        const data = await runOperation(root, button, 'git_posix.path_reference.create', 'Add POSIX Path', 'Creating...', {
            operation_id: lastPreparedOperationId,
            posix_path: posixPath,
            path_role: 'attestation_record',
            commit_message: 'Create Hubzilla own-post attestation path reference ' + uuid,
            manifest_title: 'Hubzilla own-post attestation ' + uuid,
            manifest_description: 'CID reference for a Hubzilla own-post attestation prepared through Webforms.'
        });
        if (!data) {
            return;
        }

        lastPathCreated = data.status === 'completed' || data.path_status === 'created' || Boolean(data.commit_sha);
        setPanelText(root, 'result-attestation', formatPathResponse(data));
        syncButtonState(root);
    }

    async function readVerifyCid(root, button) {
        if (!lastPreparedOperationId || !lastPathCreated) {
            setPanelText(root, 'result-attestation', 'Read / Verify\nstatus: failed\nerror: Add POSIX Path must succeed first.');
            return;
        }

        const data = await runOperation(root, button, 'ipfs.cid.read_verify', 'Read / Verify', 'Verifying...', {
            operation_id: lastPreparedOperationId
        });
        if (!data) {
            return;
        }

        setPanelText(root, 'result-attestation', formatReadVerifyResponse(data));
        setPanelText(root, 'result-prepare-expected', formatDurableSummary(data));
        syncButtonState(root);
    }

    async function runOperation(root, button, operation, title, activeLabel, payload) {
        const servicePack = currentServicePack();
        const profileId = fieldValue(root, 'service_profile_id') || 'ipfs-publication-default';
        const previousLabel = button.textContent;

        button.disabled = true;
        button.textContent = activeLabel;
        setPanelText(root, 'result-attestation', title + '\nstatus: running\noperation_id: ' + safe(payload.operation_id));

        try {
            const url = 'webforms?webforms_action=attestation_prepare' +
                '&operation=' + encodeURIComponent(operation) +
                '&service_pack=' + encodeURIComponent(servicePack) +
                '&profile_id=' + encodeURIComponent(profileId);
            const response = await fetch(url, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await responseJson(response);
            if (!response.ok || !data || data.status === 'failed') {
                throw new Error(errorText(data) || (title + ' failed'));
            }
            return data;
        }
        catch (error) {
            setPanelText(root, 'result-attestation', title + '\nstatus: failed\nerror: ' + error.message);
            return null;
        }
        finally {
            button.disabled = false;
            button.textContent = previousLabel;
            syncButtonState(root);
        }
    }

    function updatePrepareResults(root, data) {
        const prepared = data.prepared_package || {};
        const source = prepared.source || {};
        const post = prepared.post || {};
        const payload = prepared.nomad_payload || {};
        const delivery = prepared.delivery_manifest || {};
        const identity = prepared.identity || {};

        lastPreparedOperationId = data.operation_id || prepared.operation_id || '';
        lastPreparedPackage = prepared;

        setFieldValue(root, 'operation_id', lastPreparedOperationId);
        setFieldValue(root, 'prepare_status', data.status || 'prepared');
        setFieldValue(root, 'stored', data.stored ? 'true' : 'false');
        setFieldValue(root, 'stored_path', data.stored_path || '');
        setFieldValue(root, 'current_channel_status', source.channel_address || source.channel_scope || 'resolved');
        setFieldValue(root, 'latest_post_status', post.title || post.mid || 'resolved');
        setFieldValue(root, 'resolution_status', data.payload_status || 'prepared');
        setFieldValue(root, 'policy_status', data.policy_status || 'allowed');

        setPanelText(root, 'result-prepare-expected', formatPrepareSummary(data));
        setPanelText(root, 'result-attestation', formatPrepareResponse(data));
        setPanelText(root, 'result-attestation-preview', formatAttestationPreview(data, prepared));
        setPanelText(root, 'result-resolved-fields', formatResolvedFields(source, identity, post, payload, delivery));

        syncButtonState(root);
    }

    function resetOperationState() {
        lastPreparedOperationId = '';
        lastPreparedPackage = null;
        lastCidPrepared = false;
        lastCidPublished = false;
        lastCidPinned = false;
        lastPathCreated = false;
    }

    function syncButtonState(root) {
        setButtonEnabled(root, 'cidPrepare', Boolean(lastPreparedOperationId));
        setButtonEnabled(root, 'cidPublish', Boolean(lastPreparedOperationId && lastCidPrepared));
        setButtonEnabled(root, 'cidPin', Boolean(lastPreparedOperationId && lastCidPublished));
        setButtonEnabled(root, 'pathCreate', Boolean(lastPreparedOperationId && lastCidPinned));
        setButtonEnabled(root, 'readVerify', Boolean(lastPreparedOperationId && lastPathCreated));
    }

    function setButtonEnabled(root, key, enabled) {
        const button = root.querySelector('[data-webforms-attestation-key="' + cssEscape(key) + '"]');
        if (!button) {
            return;
        }
        button.disabled = !enabled;
        button.title = enabled ? '' : buttonGateText(key);
    }

    function buttonGateText(key) {
        const gates = {
            cidPrepare: 'Prepare Package first.',
            cidPublish: 'Prepare CID first.',
            cidPin: 'Publish CID first.',
            pathCreate: 'Pin CID first.',
            readVerify: 'Add POSIX Path first.'
        };
        return gates[key] || '';
    }

    function cleanAttestationPanels(root) {
        [
            'result-prepare-expected',
            'result-attestation',
            'result-attestation-preview',
            'result-resolved-fields'
        ].forEach(function (layoutId) {
            const node = root.querySelector('[data-webforms-layout-id="' + cssEscape(layoutId) + '"]');
            if (!node) {
                return;
            }

            const labels = node.querySelectorAll('label, .control-label, .form-label, .webforms-field-label');
            labels.forEach(function (label) {
                label.style.display = 'none';
            });

            const well = node.querySelector('.well');
            if (well) {
                well.style.whiteSpace = 'pre-wrap';
                well.style.overflow = 'auto';
                well.style.maxHeight = '190px';
                well.style.fontSize = '0.875rem';
                well.style.lineHeight = '1.35';
                well.style.marginBottom = '0';
            }
        });
    }

    function currentServicePack() {
        const runtime = document.getElementById('webforms-runtime');
        return (runtime && runtime.dataset.webformsServicePack) || 'ipfs';
    }

    async function responseJson(response) {
        const text = await response.text();
        if (!text) {
            return null;
        }
        try {
            return JSON.parse(text);
        }
        catch (error) {
            throw new Error('invalid JSON response');
        }
    }

    function pathForPreparedPackage(prepared) {
        const source = (prepared && prepared.source) || {};
        const post = (prepared && prepared.post) || {};
        const channel = cleanPathSegment(source.channel_address || 'unknown-channel');
        const created = String(post.created || '').slice(0, 10);
        const date = /^\d{4}-\d{2}-\d{2}$/.test(created) ? created : new Date().toISOString().slice(0, 10);
        const uuid = cleanPathSegment(post.uuid || post.mid || 'own-post-attestation');
        return 'kane-il/hubzilla/attestations/own-posts/' + channel + '/' + date + '/' + uuid + '.json';
    }

    function preparedPostValue(prepared, key) {
        return prepared && prepared.post && prepared.post[key] ? String(prepared.post[key]) : '';
    }

    function cleanPathSegment(value) {
        const segment = String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9._-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 96);
        return segment || 'unknown';
    }

    function formatPrepareSummary(data) {
        return [
            'Prepare Package',
            'status: ' + safe(data.status),
            'stored: ' + (data.stored ? 'true' : 'false'),
            'delivery: ' + safe(data.delivery_status),
            'policy: ' + safe(data.policy_status),
            'next: Prepare CID'
        ].join('\n');
    }

    function formatPrepareResponse(data) {
        return [
            'Prepare Package',
            'operation_id: ' + safe(data.operation_id),
            'operation: ' + safe(data.operation),
            'status: ' + safe(data.status),
            'stored: ' + (data.stored ? 'true' : 'false'),
            'stored_path: ' + safe(data.stored_path),
            'source: ' + safe(data.source_status),
            'payload: ' + safe(data.payload_status),
            'delivery: ' + safe(data.delivery_status),
            'policy: ' + safe(data.policy_status),
            'next_operations: ' + listText(data.next_operations),
            'error: ' + safe(data.error_message)
        ].join('\n');
    }

    function formatCidPrepareResponse(data) {
        return [
            'Prepare CID',
            'operation_id: ' + safe(data.operation_id),
            'status: ' + safe(data.status),
            'candidate_cid: ' + safe(data.candidate_cid),
            'sha256: ' + safe(data.candidate_sha256),
            'size_bytes: ' + safe(data.candidate_size_bytes),
            'content_type: ' + safe(data.candidate_content_type),
            'cid_version: ' + safe(data.cid_version),
            'codec: ' + safe(data.ipfs_codec),
            'hash: ' + safe(data.hash_algorithm),
            'canonicalization: ' + safe(data.canonicalization_method),
            'publish: ' + safe(data.publish_status),
            'pin: ' + safe(data.pin_status),
            'retrieval: ' + safe(data.retrieval_status),
            'verification: ' + safe(data.verification_status),
            'policy: ' + safe(data.policy_status),
            'error: ' + safe(data.error_message)
        ].join('\n');
    }

    function formatCidPublishResponse(data) {
        return [
            'Publish CID',
            'operation_id: ' + safe(data.operation_id),
            'status: ' + safe(data.status),
            'cid: ' + safe(data.cid),
            'expected_cid: ' + safe(data.expected_cid),
            'publish: ' + safe(data.publish_status),
            'pin: ' + safe(data.pin_status),
            'retrieval: ' + safe(data.retrieval_status),
            'verification: ' + safe(data.verification_status),
            'policy: ' + safe(data.policy_status),
            'backend_node: ' + safe(data.backend_node),
            'error: ' + safe(data.error_message)
        ].join('\n');
    }

    function formatPinResponse(data) {
        return [
            'Pin CID',
            'operation_id: ' + safe(data.operation_id),
            'status: ' + safe(data.status),
            'cid: ' + safe(data.cid),
            'pin_status: ' + safe(data.pin_status),
            'pin_type: ' + safe(data.pin_type),
            'publish: ' + safe(data.publish_status),
            'retrieval: ' + safe(data.retrieval_status),
            'verification: ' + safe(data.verification_status),
            'policy: ' + safe(data.policy_status),
            'backend_node: ' + safe(data.backend_node),
            'node_peer_id: ' + safe(data.node_peer_id),
            'error: ' + safe(data.error_message)
        ].join('\n');
    }

    function formatPathResponse(data) {
        return [
            'Add POSIX Path',
            'operation_id: ' + safe(data.operation_id),
            'status: ' + safe(data.status),
            'cid: ' + safe(data.cid),
            'git_path: ' + safe(data.git_path),
            'manifest_path: ' + safe(data.manifest_path),
            'path_status: ' + safe(data.path_status),
            'commit_sha: ' + safe(data.commit_sha),
            'verification: ' + safe(data.verification_status),
            'policy: ' + safe(data.policy_status),
            'error: ' + safe(data.error_message)
        ].join('\n');
    }

    function formatReadVerifyResponse(data) {
        return [
            'Read / Verify',
            'operation_id: ' + safe(resultValue(data, 'operation_id')),
            'status: ' + safe(resultValue(data, 'status')),
            'cid: ' + safe(resultValue(data, 'cid')),
            'ipfs_uri: ' + safe(resultValue(data, 'ipfs_uri')),
            'content_type: ' + safe(resultValue(data, 'content_type')),
            'size_bytes: ' + safe(resultValue(data, 'size_bytes')),
            'sha256: ' + safe(resultValue(data, 'sha256')),
            'pin_status: ' + safe(resultValue(data, 'pin_status')),
            'pin_type: ' + safe(resultValue(data, 'pin_type')),
            'retrieval: ' + safe(resultValue(data, 'retrieval_status')),
            'verification: ' + safe(resultValue(data, 'verification_status')),
            'content_verified: ' + boolText(resultValue(data, 'content_verified')),
            'git_reference_verified: ' + boolText(resultValue(data, 'git_reference_verified')),
            'git_path: ' + safe(resultValue(data, 'git_path')),
            'path_status: ' + safe(resultValue(data, 'path_status')),
            'commit_sha: ' + safe(resultValue(data, 'commit_sha')),
            'policy: ' + safe(resultValue(data, 'policy_status')),
            'error: ' + safe(resultValue(data, 'error_message'))
        ].join('\n');
    }

    function formatDurableSummary(data) {
        return [
            'Durable Publication Result',
            'status: ' + safe(resultValue(data, 'status')),
            'cid: ' + safe(resultValue(data, 'cid')),
            'pin_status: ' + safe(resultValue(data, 'pin_status')),
            'retrieval_status: ' + safe(resultValue(data, 'retrieval_status')),
            'content_verified: ' + boolText(resultValue(data, 'content_verified')),
            'git_reference_verified: ' + boolText(resultValue(data, 'git_reference_verified')),
            'git_path: ' + safe(resultValue(data, 'git_path')),
            'commit_sha: ' + safe(resultValue(data, 'commit_sha'))
        ].join('\n');
    }

    function formatAttestationPreview(data, prepared) {
        const preview = prepared.attestation_preview || {};
        const plan = prepared.publication_plan || {};
        return [
            'schema: ' + safe(preview.schema),
            'attestation_type: ' + safe(preview.attestation_type),
            'source_event: ' + safe(preview.source_event),
            'payload: ' + safe(data.payload_status || preview.payload_status),
            'delivery: ' + safe(data.delivery_status || preview.delivery_status),
            'policy: ' + safe(data.policy_status || preview.policy_status),
            'target: ' + safe(plan.target),
            'backend_role: ' + safe(plan.backend_role)
        ].join('\n');
    }

    function formatResolvedFields(source, identity, post, payload, delivery) {
        return [
            'channel: ' + safe(source.channel_address),
            'channel_id: ' + safe(source.channel_id),
            'item_id: ' + safe(post.item_id),
            'uuid: ' + safe(post.uuid),
            'created: ' + safe(post.created),
            'body_sha256: ' + safe(post.body_sha256),
            'sig_sha256: ' + safe(post.sig_sha256),
            'payload_sha256: ' + safe(payload.sha256),
            'payload_size_bytes: ' + safe(payload.size_bytes),
            'delivery_report_count: ' + safe(delivery.delivery_report_count),
            'xchan_hash: ' + safe(identity.xchan_hash),
            'mid: ' + safe(post.mid)
        ].join('\n');
    }

    function errorText(data) {
        if (!data || typeof data !== 'object') {
            return '';
        }
        return data.error_message || data.error_code || data.detail || '';
    }

    function fieldValue(root, id) {
        const field = root.querySelector('[name="' + cssEscape(id) + '"]');
        return field ? field.value : '';
    }

    function setFieldValue(root, id, value) {
        const field = root.querySelector('[name="' + cssEscape(id) + '"]');
        if (field) {
            field.value = String(value == null ? '' : value);
        }
    }

    function setPanelText(root, layoutId, text) {
        const panel = root.querySelector('[data-webforms-layout-id="' + cssEscape(layoutId) + '"] .well');
        if (panel) {
            panel.textContent = text;
        }
    }

    function listText(value) {
        return Array.isArray(value) ? value.join(', ') : safe(value);
    }

    function resultValue(data, key) {
        if (!data || typeof data !== 'object') {
            return undefined;
        }

        const topLevel = data[key];
        if (hasDisplayValue(topLevel)) {
            return topLevel;
        }

        const candidateKeys = [
            'publication_result',
            'durable_publication_result',
            'read_verify_result',
            'verification_result',
            'operation_result',
            'result',
            'data',
            'response'
        ];

        for (let i = 0; i < candidateKeys.length; i += 1) {
            const nested = data[candidateKeys[i]];
            if (nested && typeof nested === 'object' && hasDisplayValue(nested[key])) {
                return nested[key];
            }
        }

        return recursiveResultValue(data, key, 0);
    }

    function recursiveResultValue(value, key, depth) {
        if (!value || typeof value !== 'object' || depth > 4) {
            return undefined;
        }

        if (hasDisplayValue(value[key])) {
            return value[key];
        }

        const values = Array.isArray(value) ? value : Object.keys(value).map(function (name) {
            return value[name];
        });

        for (let i = 0; i < values.length; i += 1) {
            const found = recursiveResultValue(values[i], key, depth + 1);
            if (hasDisplayValue(found)) {
                return found;
            }
        }

        return undefined;
    }

    function hasDisplayValue(value) {
        return value !== null && typeof value !== 'undefined' && value !== '';
    }

    function boolText(value) {
        return value ? 'true' : 'false';
    }

    function safe(value) {
        if (value === null || typeof value === 'undefined') {
            return '';
        }
        return String(value);
    }

    function cssEscape(value) {
        if (window.CSS && typeof window.CSS.escape === 'function') {
            return window.CSS.escape(value);
        }
        return String(value).replace(/"/g, '\\"');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }
    else {
        init();
    }
}());
