(function () {
    'use strict';

    const GRID_SIZE = 24;
    const SELECTED_CLASS = 'webforms-js-object-selected';

    function getRuntime() {
        return document.getElementById('webforms-runtime');
    }

    function buildDraft(runtime) {
        const designForm = runtime.dataset.webformsDesignForm || '';
        const designTab = runtime.dataset.webformsDesignTab || 'grid';
        const access = runtime.dataset.webformsAccess || 'public';

        return {
            schema: 'hubzilla.webforms.designDraft',
            version: '0.1',
            status: 'browser-local',
            access: {
                mode: access,
                public_local_only: access === 'public'
            },
            form: {
                id: designForm || 'new-blank-form',
                title: designForm ? humanizeSlug(designForm) : 'New blank form'
            },
            design: {
                active_tab: designTab,
                selected_object_id: null,
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
        return value.split('-').filter(Boolean).map(function (part) {
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join(' ');
    }

    function renderGrid(draft) {
        const grid = document.getElementById('webforms-design-grid');

        if (!grid) {
            return;
        }

        removeGeneratedObjects(grid);

        draft.objects.forEach(function (object) {
            if (object.parent === draft.grid.id) {
                grid.appendChild(createObjectElement(object, draft.grid.size));
            }
        });

        if (!grid.dataset.webformsSelectionHandler) {
            grid.addEventListener('click', function (event) {
                if (event.target === grid) {
                    selectObject(draft, null);
                }
            });
            grid.dataset.webformsSelectionHandler = '1';
        }

        updateGridSelection(draft.design.selected_object_id);
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

        wrapper.style.left = (placement.x * gridSize) + 'px';
        wrapper.style.top = (placement.y * gridSize) + 'px';
        wrapper.style.width = (placement.width * gridSize) + 'px';
        wrapper.style.minHeight = (placement.height * gridSize) + 'px';

        wrapper.addEventListener('click', function (event) {
            event.stopPropagation();
            selectObject(window.webformsDesignDraft, object.id);
        });

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

    function selectObject(draft, objectId) {
        if (!draft) {
            return;
        }

        draft.design.selected_object_id = objectId;

        updateGridSelection(objectId);
        renderSelectionPanel(draft, objectId);
        renderJson(draft);
    }

    function updateGridSelection(objectId) {
        document.querySelectorAll('[data-webforms-generated-object="1"]').forEach(function (node) {
            const isSelected = node.dataset.webformsObjectId === objectId;
            node.classList.toggle(SELECTED_CLASS, isSelected);
        });
    }

    function renderSelectionPanel(draft, objectId) {
        const panel = document.getElementById('webforms-design-selection');

        if (!panel) {
            return;
        }

        if (!objectId) {
            panel.innerHTML = '<p class="small mb-0">No object selected.</p>';
            return;
        }

        const object = findObject(draft, objectId);

        if (!object) {
            panel.innerHTML = '<p class="small mb-0">Selected object not found.</p>';
            return;
        }

        panel.innerHTML = [
            compactInputRow('ID', 'id', object.id, true),
            compactInputRow('Label', 'label', object.label || '', false),
            compactInputRow('Hint', 'placeholder', object.placeholder || '', false),
            compactInputRow('Default', 'default', object.default || '', false),
            placementSelectRow(object.placement),
            requiredRow(Boolean(object.validation.required))
        ].join('');

        panel.querySelectorAll('[data-webforms-property]').forEach(function (input) {
            input.addEventListener('change', function () {
                updateObjectFromInput(draft, object.id, input);
            });

            if (input.tagName.toLowerCase() === 'input' && input.type !== 'checkbox') {
                input.addEventListener('input', function () {
                    updateObjectTextProperty(draft, object.id, input);
                });
            }
        });
    }

    function compactInputRow(label, property, value, readonly) {
        const id = 'webforms-prop-' + property.replace(/\./g, '-');

        return [
            '<div class="webforms-property-row mb-1">',
            '<label class="small mb-0" for="' + escapeHtml(id) + '">' + escapeHtml(label) + '</label>',
            '<input id="' + escapeHtml(id) + '" class="form-control form-control-sm" type="text" value="' + escapeHtml(value) + '" data-webforms-property="' + escapeHtml(property) + '"' + (readonly ? ' readonly="readonly"' : '') + '>',
            '</div>'
        ].join('');
    }

    function placementSelectRow(placement) {
        return [
            '<div class="webforms-placement-row mb-1">',
            placementSelect('X', 'placement.x', placement.x, 0, 99),
            placementSelect('Y', 'placement.y', placement.y, 0, 99),
            placementSelect('W', 'placement.width', placement.width, 1, 99),
            placementSelect('H', 'placement.height', placement.height, 1, 99),
            '</div>'
        ].join('');
    }

    function placementSelect(label, property, value, min, max) {
        const id = 'webforms-prop-' + property.replace(/\./g, '-');

        return [
            '<label class="small mb-0" for="' + escapeHtml(id) + '">' + escapeHtml(label) + '</label>',
            '<select id="' + escapeHtml(id) + '" class="form-control form-control-sm" data-webforms-property="' + escapeHtml(property) + '">',
            numberOptions(value, min, max),
            '</select>'
        ].join('');
    }

    function numberOptions(current, min, max) {
        let out = '';
        const selectedValue = parseInt(current, 10);

        for (let i = min; i <= max; i++) {
            out += '<option value="' + i + '"' + (i === selectedValue ? ' selected="selected"' : '') + '>' + i + '</option>';
        }

        return out;
    }

    function requiredRow(checked) {
        const id = 'webforms-prop-validation-required';

        return [
            '<div class="form-check mt-1 mb-0">',
            '<input id="' + id + '" class="form-check-input" type="checkbox" data-webforms-property="validation.required"' + (checked ? ' checked="checked"' : '') + '>',
            '<label class="form-check-label small" for="' + id + '">Required</label>',
            '</div>'
        ].join('');
    }

    function updateObjectTextProperty(draft, objectId, input) {
        const object = findObject(draft, objectId);

        if (!object || input.readOnly) {
            return;
        }

        const property = input.dataset.webformsProperty;
        object[property] = input.value;

        updateGridObjectPreview(object);
        renderJson(draft);
    }

    function updateObjectFromInput(draft, objectId, input) {
        const object = findObject(draft, objectId);

        if (!object || input.readOnly) {
            return;
        }

        const property = input.dataset.webformsProperty;
        const value = input.type === 'checkbox' ? input.checked : input.value;

        setObjectProperty(object, property, value);

        renderGrid(draft);
        renderSelectionPanel(draft, objectId);
        renderJson(draft);
    }

    function updateGridObjectPreview(object) {
        const wrapper = document.querySelector('[data-webforms-object-id="' + cssEscape(object.id) + '"]');

        if (!wrapper) {
            return;
        }

        const label = wrapper.querySelector('label');
        const input = wrapper.querySelector('input');

        if (label) {
            label.textContent = object.label || object.id;
        }

        if (input) {
            input.value = object.default || '';
            input.placeholder = object.placeholder || '';
        }
    }

    function setObjectProperty(object, property, value) {
        if (property.indexOf('placement.') === 0) {
            const key = property.split('.')[1];
            object.placement[key] = parseInt(value, 10);
            return;
        }

        if (property === 'validation.required') {
            object.validation.required = Boolean(value);
            return;
        }

        object[property] = value;
    }

    function findObject(draft, objectId) {
        return draft.objects.find(function (object) {
            return object.id === objectId;
        });
    }

    function renderJson(draft) {
        const output = document.getElementById('webforms-json-output');

        if (!output) {
            return;
        }

        output.value = JSON.stringify(draft, null, 2);
    }

    function cssEscape(value) {
        if (window.CSS && typeof window.CSS.escape === 'function') {
            return window.CSS.escape(value);
        }

        return String(value).replace(/"/g, '\\"');
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function init() {
        const runtime = getRuntime();

        if (!runtime || runtime.dataset.webformsMode !== 'design') {
            return;
        }

        const draft = buildDraft(runtime);

        window.webformsDesignDraft = draft;

        renderGrid(draft);
        renderSelectionPanel(draft, null);
        renderJson(draft);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }
    else {
        init();
    }
})();
