(function () {
    'use strict';

    let wireQueued = false;
    let lastPreparedOperationId = '';

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

        if (!bar.querySelector('[data-webforms-attestation-prepare="1"]')) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-sm btn-primary';
            button.textContent = 'Prepare Package';
            button.dataset.webformsAction = 'attestation.prepare';
            button.dataset.webformsAttestationPrepare = '1';
            button.addEventListener('click', function () {
                prepareAttestation(root, button);
            });
            bar.appendChild(button);
        }

        if (!bar.querySelector('[data-webforms-attestation-cid-prepare="1"]')) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-sm btn-secondary';
            button.textContent = 'Prepare CID';
            button.dataset.webformsAction = 'attestation.cid.prepare';
            button.dataset.webformsAttestationCidPrepare = '1';
            button.disabled = true;
            button.title = 'Prepare Package first.';
            button.addEventListener('click', function () {
                prepareCid(root, button);
            });
            bar.appendChild(button);
        }
    }

    function insertActionBar(root, preparePanel, bar) {
        let anchor = preparePanel;

        while (anchor.parentElement && anchor.parentElement !== root) {
            anchor = anchor.parentElement;
        }

        if (anchor && anchor.parentElement === root) {
            root.insertBefore(bar, anchor);
        } else {
            root.insertBefore(bar, root.firstChild);
        }
    }

    async function prepareAttestation(root, button) {
        const servicePack = currentServicePack();
        const profileId = fieldValue(root, 'service_profile_id') || 'ipfs-publication-default';
        const previousLabel = button.textContent;

        lastPreparedOperationId = '';
        setCidPrepareEnabled(root, false);
        button.disabled = true;
        button.textContent = 'Preparing...';

        setFieldValue(root, 'prepare_status', 'preparing');
        setFieldValue(root, 'stored', 'false');
        setFieldValue(root, 'stored_path', '');
        setPanelText(root, 'result-prepare-expected', 'Prepare Package\nstatus: preparing\nprofile: ' + profileId);
        setPanelText(root, 'result-attestation', 'Preparing package through Hubzilla/Webforms and orchestrator1.');

        try {
            const url = 'webforms?webforms_action=attestation_prepare'
                + '&service_pack=' + encodeURIComponent(servicePack)
                + '&profile_id=' + encodeURIComponent(profileId);
            const response = await fetch(url, {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' }
            });
            const data = await responseJson(response);

            if (!response.ok || !data || data.status === 'failed') {
                throw new Error(errorText(data) || 'attestation prepare failed');
            }

            updatePrepareResults(root, data);
        } catch (error) {
            setFieldValue(root, 'prepare_status', 'failed');
            setFieldValue(root, 'current_channel_status', 'requires authenticated channel');
            setFieldValue(root, 'latest_post_status', 'not resolved');
            setFieldValue(root, 'resolution_status', 'failed');
            setFieldValue(root, 'stored', 'false');
            setPanelText(root, 'result-prepare-expected', 'Prepare Package\nstatus: failed\nerror: ' + error.message);
            setPanelText(root, 'result-attestation', 'Prepare Package failed.\nerror: ' + error.message);
        } finally {
            button.disabled = false;
            button.textContent = previousLabel;
        }
    }

    async function prepareCid(root, button) {
        const servicePack = currentServicePack();
        const profileId = fieldValue(root, 'service_profile_id') || 'ipfs-publication-default';
        const operationId = lastPreparedOperationId;
        const previousLabel = button.textContent;

        if (!operationId) {
            setPanelText(root, 'result-attestation', 'Prepare CID\nstatus: failed\nerror: Prepare Package must succeed first.');
            return;
        }

        button.disabled = true;
        button.textContent = 'Preparing...';
        setPanelText(root, 'result-attestation', 'Prepare CID\nstatus: preparing\noperation_id: ' + operationId);

        try {
            const url = 'webforms?webforms_action=attestation_prepare'
                + '&operation=' + encodeURIComponent('ipfs.cid.prepare')
                + '&service_pack=' + encodeURIComponent(servicePack)
                + '&profile_id=' + encodeURIComponent(profileId)
                + '&operation_id=' + encodeURIComponent(operationId);
            const response = await fetch(url, {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' }
            });
            const data = await responseJson(response);

            if (!response.ok || !data || data.status === 'failed') {
                throw new Error(errorText(data) || 'CID prepare failed');
            }

            setPanelText(root, 'result-attestation', formatCidPrepareResponse(data));
        } catch (error) {
            setPanelText(root, 'result-attestation', 'Prepare CID\nstatus: failed\nerror: ' + error.message);
        } finally {
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
        } catch (error) {
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

        lastPreparedOperationId = data.operation_id || '';

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

        setCidPrepareEnabled(root, Boolean(data.stored && lastPreparedOperationId));
    }

    function setCidPrepareEnabled(root, enabled) {
        const button = root.querySelector('[data-webforms-attestation-cid-prepare="1"]');
        if (!button) {
            return;
        }

        button.disabled = !enabled;
        button.title = enabled ? 'Prepare candidate CID through orchestrator1.' : 'Prepare Package first.';
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
    } else {
        init();
    }
}());
