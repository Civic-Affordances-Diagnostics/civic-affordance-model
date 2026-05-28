(function () {
    'use strict';

    const ns = window.WebformsDesign = window.WebformsDesign || {};

    ns.humanizeSlug = function (value) {
        return value.split('-').filter(Boolean).map(function (part) {
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join(' ');
    };

    ns.buildDraft = function (runtime) {
        const designForm = runtime.dataset.webformsDesignForm || '';
        const designTab = runtime.dataset.webformsDesignTab || 'grid';
        const access = runtime.dataset.webformsAccess || 'public';

        return {
            schema: 'hubzilla.webforms.designDraft',
            version: ns.VERSION,
            status: 'browser-local',
            access: {
                mode: access,
                public_local_only: access === 'public'
            },
            form: {
                id: designForm || 'new-blank-form',
                title: designForm ? ns.humanizeSlug(designForm) : 'New blank form'
            },
            design: {
                active_tab: designTab,
                selected_object_id: null,
                source: 'browser',
                next_object_number: 2
            },
            grid: {
                id: 'root-form',
                unit: 'px',
                size: ns.GRID_SIZE,
                columns_observed: 22,
                rows_observed: 17,
                placement_scope: 'immediate-container'
            },
            objects: [
                createObject('field-1', 'text', 'Sample field', 'browser-local preview', 3, 3, 9, 3)
            ],
            notes: [
                'This draft exists in browser memory only.',
                'No server write, storage, API call, or federation action is performed.'
            ]
        };
    };

    ns.nextObjectNumber = function (draft) {
        const number = draft.design.next_object_number || 1;
        draft.design.next_object_number = number + 1;

        return number;
    };

    ns.createContainerObject = function (draft) {
        const number = ns.nextObjectNumber(draft);

        return createObject('box-' + number, 'container', 'Box ' + number, '', 2 + number, 2 + number, 10, 5);
    };

    ns.createTextFieldObject = function (draft) {
        const number = ns.nextObjectNumber(draft);

        return createObject('field-' + number, 'text', 'Field ' + number, '', 3 + number, 3 + number, 9, 3);
    };

    ns.createLabelObject = function (draft) {
        const number = ns.nextObjectNumber(draft);

        return createObject('label-' + number, 'label', 'Label ' + number, '', 3 + number, 2 + number, 7, 2);
    };

    ns.createTextareaObject = function (draft) {
        const number = ns.nextObjectNumber(draft);

        return createObject('area-' + number, 'textarea', 'Area ' + number, '', 3 + number, 3 + number, 10, 5);
    };

    ns.createCheckboxObject = function (draft) {
        const number = ns.nextObjectNumber(draft);

        return createObject('check-' + number, 'checkbox', 'Check ' + number, '', 3 + number, 3 + number, 8, 2);
    };

    ns.createButtonObject = function (draft) {
        const number = ns.nextObjectNumber(draft);

        return createObject('button-' + number, 'button', 'Button ' + number, '', 3 + number, 3 + number, 6, 2);
    };

    ns.createSelectObject = function (draft) {
        const number = ns.nextObjectNumber(draft);
        const object = createObject('select-' + number, 'select', 'Select ' + number, '', 3 + number, 3 + number, 9, 3);

        object.options = [
            { value: 'option-1', label: 'Option 1' },
            { value: 'option-2', label: 'Option 2' },
            { value: 'option-3', label: 'Option 3' }
        ];

        return object;
    };

    function createObject(id, type, label, placeholder, x, y, width, height) {
        return {
            id: id,
            type: type,
            parent: 'root-form',
            label: label,
            placeholder: placeholder,
            default: '',
            placement: {
                x: x,
                y: y,
                width: width,
                height: height,
                unit: 'grid'
            },
            validation: {
                required: false
            }
        };
    }

    ns.findObject = function (draft, objectId) {
        return draft.objects.find(function (object) {
            return object.id === objectId;
        });
    };

    ns.setObjectProperty = function (object, property, value) {
        if (property.indexOf('placement.') === 0) {
            const key = property.split('.')[1];
            object.placement[key] = parseInt(value, 10);
            return;
        }

        if (property === 'validation.required') {
            object.validation.required = Boolean(value);
            return;
        }

        if (property === 'options') {
            object.options = parseOptions(value);
            return;
        }

        object[property] = value;
    };

    function parseOptions(value) {
        return String(value).split('\n').map(function (line) {
            return line.trim();
        }).filter(Boolean).map(function (line) {
            const parts = line.split('|');
            const optionValue = parts[0].trim();
            const optionLabel = (parts[1] || parts[0]).trim();

            return {
                value: optionValue,
                label: optionLabel
            };
        });
    }

    ns.optionsToText = function (object) {
        if (!Array.isArray(object.options)) {
            return '';
        }

        return object.options.map(function (option) {
            return option.value + '|' + option.label;
        }).join('\n');
    };

    ns.addObject = function (draft, object) {
        draft.objects.push(object);
        draft.design.selected_object_id = object.id;

        ns.renderGrid(draft);
        ns.renderSelectionPanel(draft, object.id);
        ns.renderJson(draft);
    };

    ns.deleteSelectedObject = function (draft) {
        const selectedId = draft.design.selected_object_id;

        if (!selectedId) {
            return;
        }

        draft.objects = draft.objects.filter(function (object) {
            return object.id !== selectedId;
        });

        draft.design.selected_object_id = null;

        ns.renderGrid(draft);
        ns.renderSelectionPanel(draft, null);
        ns.renderJson(draft);
    };

    ns.selectObject = function (draft, objectId) {
        if (!draft) {
            return;
        }

        draft.design.selected_object_id = objectId;

        ns.updateGridSelection(objectId);
        ns.renderSelectionPanel(draft, objectId);
        ns.renderJson(draft);
    };

    ns.cssEscape = function (value) {
        if (window.CSS && typeof window.CSS.escape === 'function') {
            return window.CSS.escape(value);
        }

        return String(value).replace(/"/g, '\\"');
    };

    ns.escapeHtml = function (value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
})();
