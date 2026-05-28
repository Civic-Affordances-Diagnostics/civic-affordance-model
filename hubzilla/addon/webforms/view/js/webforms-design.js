(function () {
    'use strict';

    const ns = window.WebformsDesign = window.WebformsDesign || {};

    function getRuntime() {
        return document.getElementById('webforms-runtime');
    }

    function initToolbar(draft, runtime) {
        document.querySelectorAll('[data-webforms-tool]').forEach(function (button) {
            button.addEventListener('click', function () {
                if (button.disabled) {
                    return;
                }

                const nextDraft = handleToolClick(draft, runtime, button.dataset.webformsTool);

                if (nextDraft) {
                    draft = nextDraft;
                }
            });
        });
    }

    function handleToolClick(draft, runtime, tool) {
        if (tool === 'container') {
            ns.addObject(draft, ns.createContainerObject(draft));
            return draft;
        }

        if (tool === 'field') {
            ns.addObject(draft, ns.createTextFieldObject(draft));
            return draft;
        }

        if (tool === 'delete-selected') {
            ns.deleteSelectedObject(draft);
            return draft;
        }

        if (tool === 'copy-json' && typeof ns.copyPackageJson === 'function') {
            ns.copyPackageJson(draft);
            return draft;
        }

        if (tool === 'download-json' && typeof ns.downloadPackageJson === 'function') {
            ns.downloadPackageJson(draft);
            return draft;
        }

        if (tool === 'clear-json' && typeof ns.clearPackageJson === 'function') {
            return ns.clearPackageJson(draft, runtime);
        }

        return draft;
    }

    function init() {
        const runtime = getRuntime();

        if (!runtime || runtime.dataset.webformsMode !== 'design') {
            return;
        }

        const draft = ns.loadDraft(runtime);

        window.webformsDesignDraft = draft;

        initToolbar(draft, runtime);
        ns.renderGrid(draft);
        ns.renderSelectionPanel(draft, draft.design.selected_object_id);
        ns.renderJson(draft);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }
    else {
        init();
    }
})();
