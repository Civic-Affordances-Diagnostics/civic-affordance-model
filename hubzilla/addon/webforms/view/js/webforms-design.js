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
        }
    }

    function init() {
        const runtime = getRuntime();

        if (!runtime || runtime.dataset.webformsMode !== 'design') {
            return;
        }

        const draft = ns.buildDraft(runtime);

        window.webformsDesignDraft = draft;

        initToolbar(draft);
        ns.renderGrid(draft);
        ns.renderSelectionPanel(draft, null);
        ns.renderJson(draft);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }
    else {
        init();
    }
})();
