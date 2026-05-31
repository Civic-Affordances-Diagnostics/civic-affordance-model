(function () {
    'use strict';

    let wireQueued = false;

    function init() {
        const runtime = document.getElementById('webforms-runtime');
        const root = document.getElementById('webforms-deploy-render-root');

        if (!runtime || runtime.dataset.webformsMode !== 'deploy' || !root) {
            return;
        }

        const observer = new MutationObserver(function () {
            queueWire(root);
        });

        observer.observe(root, {
            childList: true,
            subtree: true
        });

        queueWire(root);
    }

    function queueWire(root) {
        if (wireQueued) {
            return;
        }

        wireQueued = true;
        window.setTimeout(function () {
            wireQueued = false;
            wirePrepareButton(root);
        }, 0);
    }

    function wirePrepareButton(root) {
        const container = root.querySelector('[data-webforms-layout-id="box-prepare-package"]');
        if (!container) {
            return;
        }

        if (root.querySelector('[data-webforms-attestation-prepare="1"]')) {
            return;
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-sm btn-primary';
        button.textContent = 'Prepare Package';
        button.dataset.webformsAction = 'attestation.prepare';
        button.dataset.webformsAttestationPrepare = '1';
        button.style.position = 'absolute';
        button.style.left = '360px';
        button.style.top = '24px';
        button.style.width = '96px';
        button.style.minHeight = '48px';
        button.style.fontWeight = '700';
        button.addEventListener('click', function () {
            prepareAttestation(root, button);
        });

        container.appendChild(button);
    }

    async function prepareAttestation(root, button) {
        const servicePack = currentServicePack();
        const profileId = fieldValue(root, 'service_profile_id') || 'ipfs-publication-default';
        const previousLabel = button.textContent;

        button.disabled = true;
        button.textContent = 'Preparing...';
        setFieldValue(root, 'prepare_status', 'preparing');
        setFieldValue(root, 'stored', 'false');
        setFieldValue(root, 'stored_path', '');
        setPanelText(root, 'result-prepare-expected', 'Prepare status: preparing\nProfile: ' + profileId);
        setPanelText(root, 'result-attestation', 'Prepare status: preparing\nWaiting for Webforms source preparation and orchestrator response.');

        try {
            const url = 'webforms?webforms_action=attestation_prepare&service_pack=' + encodeURIComponent(servicePack) + '&profile_id=' + encodeURIComponent(profileId);
            const response = await fetch(url, {
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json'
                }
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
            setPanelText(root, 'result-prepare-expected', 'Prepare status: failed\nError: ' + error.message);
            setPanelText(root, 'result-attestation', 'Prepare status: failed\nError: ' + error.message);
        }
        finally {
            button.disabled = false;
            button.textContent = previousLabel;
        }
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

    function updatePrepareResults(root, data) {
        const prepared = data.prepared_package || {};
        const source = prepared.source || {};
        const post = prepared.post || {};
        const payload = prepared.nomad_payload || {};
        const delivery = prepared.delivery_manifest || {};
        const identity = prepared.identity || {};

        setFieldValue(root, 'prepare_status', data.status || 'prepared');
        setFieldValue(root, 'stored', data.stored ? 'true' : 'false');
        setFieldValue(root, 'stored_path', data.stored_path || '');
        setFieldValue(root, 'current_channel_status', source.channel_address || source.channel_scope || 'resolved');
        setFieldValue(root, 'latest_post_status', post.title || post.mid || 'resolved');
        setFieldValue(root, 'resolution_status', data.payload_status || 'prepared');
        setFieldValue(root, 'policy_status', data.policy_status || 'allowed');

        setPanelText(root, 'result-prepare-expected', formatPrepareResponse(data));
        setPanelText(root, 'result-attestation', formatPrepareResponse(data));
        setPanelText(root, 'result-attestation-preview', formatAttestationPreview(data, prepared));
        setPanelText(root, 'result-resolved-fields', formatResolvedFields(source, identity, post, payload, delivery));
    }

    function formatPrepareResponse(data) {
        return [
            'operation_id: ' + safe(data.operation_id),
            'operation: ' + safe(data.operation),
            'status: ' + safe(data.status),
            'stored: ' + (data.stored ? 'true' : 'false'),
            'stored_path: ' + safe(data.stored_path),
            'source_status: ' + safe(data.source_status),
            'payload_status: ' + safe(data.payload_status),
            'delivery_status: ' + safe(data.delivery_status),
            'policy_status: ' + safe(data.policy_status),
            'next_operations: ' + listText(data.next_operations),
            'completed_at: ' + safe(data.completed_at),
            'error_code: ' + safe(data.error_code),
            'error_message: ' + safe(data.error_message)
        ].join('\n');
    }

    function formatAttestationPreview(data, prepared) {
        const preview = prepared.attestation_preview || {};
        const plan = prepared.publication_plan || {};

        return [
            'schema: ' + safe(preview.schema),
            'attestation_type: ' + safe(preview.attestation_type),
            'source_event: ' + safe(preview.source_event),
            'payload_status: ' + safe(data.payload_status || preview.payload_status),
            'delivery_status: ' + safe(data.delivery_status || preview.delivery_status),
            'policy_status: ' + safe(data.policy_status || preview.policy_status),
            'target: ' + safe(plan.target),
            'backend_role: ' + safe(plan.backend_role)
        ].join('\n');
    }

    function formatResolvedFields(source, identity, post, payload, delivery) {
        return [
            'channel_id: ' + safe(source.channel_id),
            'channel_address: ' + safe(source.channel_address),
            'channel_hash: ' + safe(source.channel_hash),
            'xchan_hash: ' + safe(identity.xchan_hash),
            'item_id: ' + safe(post.item_id),
            'uuid: ' + safe(post.uuid),
            'mid: ' + safe(post.mid),
            'created: ' + safe(post.created),
            'edited: ' + safe(post.edited),
            'body_sha256: ' + safe(post.body_sha256),
            'sig_sha256: ' + safe(post.sig_sha256),
            'payload_sha256: ' + safe(payload.sha256),
            'payload_size_bytes: ' + safe(payload.size_bytes),
            'delivery_report_count: ' + safe(delivery.delivery_report_count)
        ].join('\n');
    }

    function errorText(data) {
        if (!data || typeof data !== 'object') {
            return '';
        }

        return data.error_message || data.error_code || '';
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
