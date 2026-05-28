(function () {
    'use strict';

    const ns = window.WebformsDesign = window.WebformsDesign || {};

    function getRuntime() {
        return document.getElementById('webforms-runtime');
    }

    function initToolbar(draft) {
        document.querySelectorAll('[data-webforms-tool]').forEach(function (button) {
            button.addEventListener('click', function () {
                if (button.disabled) {
                    return;
                }

                handleToolClick(draft, button.dataset.webformsTool);
            });
        });
    }

    function handleToolClick(draft, tool) {
        if (tool === 'container') {
            ns.addObject(draft, ns.createContainerObject(draft));
            return;
        }

        if (tool === 'field') {
            ns.addObject(draft, ns.createTextFieldObject(draft));
            return;
        }

        if (tool === 'copy-json' && typeof ns.copyPackageJson === 'function') {
            ns.copyPackageJson(draft);
            return;
        }

        if (tool === 'download-json' && typeof ns.downloadPackageJson === 'function') {
            ns.downloadPackageJson(draft);
        }
    }

    function init() {
        const runtime = getRuntime();

        if (!runtime || runtime.dataset.webformsMode !== 'design') {
            return;
        }

        const draft = ns.loadDraft(runtime);

        window.webformsDesignDraft = draft;

        initToolbar(draft);
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
