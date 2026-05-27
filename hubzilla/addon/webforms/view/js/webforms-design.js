(function () {
    'use strict';

    const GRID_SIZE = 24;

    function getRuntime() {
        return document.getElementById('webforms-runtime');
    }

    function buildDraft(runtime) {
        const designForm = runtime.dataset.webformsDesignForm || '';
        const designTab = runtime.dataset.webformsDesignTab || 'grid';

        return {
            schema: 'hubzilla.webforms.designDraft',
            version: '0.1',
            status: 'browser-local',
            form: {
                id: designForm || 'new-blank-form',
                title: designForm ? humanizeSlug(designForm) : 'New blank form'
            },
            design: {
                active_tab: designTab,
                source: 'browser'
            },
            grid: {
                id: 'root-form',
                unit: 'px',
                size: GRID_SIZE,
                columns_observed: 22,
                rows_observed: 17,
                placement_scope: 'immediate-container'
            },
            objects: [
                {
                    id: 'sample-field',
                    type: 'text',
                    parent: 'root-form',
                    label: 'Sample field',
                    placeholder: 'browser-local preview',
                    default: '',
                    placement: {
                        x: 3,
                        y: 3,
                        width: 9,
                        height: 3,
                        unit: 'grid'
                    },
                    validation: {
                        required: false
                    }
                }
            ],
            notes: [
                'This draft exists in browser memory only.',
                'No server write, storage, API call, or federation action is performed.'
            ]
        };
    }

    function humanizeSlug(value) {
        return value
            .split('-')
            .filter(Boolean)
            .map(function (part) {
                return part.charAt(0).toUpperCase() + part.slice(1);
            })
            .join(' ');
    }

    function renderGrid(draft) {
        const grid = document.getElementById('webforms-design-grid');

        if (!grid) {
            return;
        }

        removeGeneratedObjects(grid);

        draft.objects.forEach(function (object) {
            if (object.parent !== draft.grid.id) {
                return;
            }

            grid.appendChild(createObjectElement(object, draft.grid.size));
        });
    }

    function removeGeneratedObjects(grid) {
        grid.querySelectorAll('[data-webforms-generated-object="1"]').forEach(function (node) {
            node.remove();
        });
    }

    function createObjectElement(object, gridSize) {
        const placement = object.placement;
        const wrapper = document.createElement('div');

        wrapper.id = 'webforms-object-' + object.id;
        wrapper.className = 'webforms-js-object';
        wrapper.dataset.webformsGeneratedObject = '1';
        wrapper.dataset.webformsObjectId = object.id;
        wrapper.dataset.webformsObjectType = object.type;

        wrapper.style.position = 'absolute';
        wrapper.style.left = (placement.x * gridSize) + 'px';
        wrapper.style.top = (placement.y * gridSize) + 'px';
        wrapper.style.width = (placement.width * gridSize) + 'px';
        wrapper.style.minHeight = (placement.height * gridSize) + 'px';
        wrapper.style.border = '1px dashed #777';
        wrapper.style.borderRadius = '4px';
        wrapper.style.background = 'rgba(255,255,255,0.85)';
        wrapper.style.padding = '0.5rem';

        const label = document.createElement('label');
        label.setAttribute('for', 'webforms-preview-' + object.id);
        label.textContent = object.label || object.id;

        const input = document.createElement('input');
        input.id = 'webforms-preview-' + object.id;
        input.className = 'form-control form-control-sm';
        input.type = 'text';
        input.value = object.default || '';
        input.placeholder = object.placeholder || '';
        input.disabled = true;

        wrapper.appendChild(label);
        wrapper.appendChild(input);

        return wrapper;
    }

    function renderJson(draft) {
        const output = document.getElementById('webforms-json-output');

        if (!output) {
            return;
        }

        output.value = JSON.stringify(draft, null, 2);
    }

    function init() {
        const runtime = getRuntime();

        if (!runtime || runtime.dataset.webformsMode !== 'design') {
            return;
        }

        const draft = buildDraft(runtime);

        window.webformsDesignDraft = draft;

        renderGrid(draft);
        renderJson(draft);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }
    else {
        init();
    }
})();
