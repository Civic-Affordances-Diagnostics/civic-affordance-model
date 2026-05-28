(function () {
    'use strict';

    const ns = window.WebformsDesign = window.WebformsDesign || {};

    ns.renderSelectionPanel = function (draft, objectId) {
        const panel = document.getElementById('webforms-design-selection');

        if (!panel) {
            return;
        }

        if (!objectId) {
            panel.innerHTML = '<p class="small mb-0">No object selected.</p>';
            return;
        }

        const object = ns.findObject(draft, objectId);

        if (!object) {
            panel.innerHTML = '<p class="small mb-0">Selected object not found.</p>';
            return;
        }

        const rows = [
            compactInputRow('ID', 'id', object.id, true),
            compactInputRow('Label', 'label', object.label || '', false),
            compactInputRow('Hint', 'placeholder', object.placeholder || '', false),
            compactInputRow('Default', 'default', object.default || '', false),
            placementSelectRow(object.placement),
            requiredRow(Boolean(object.validation.required))
        ];

        if (object.type === 'select') {
            rows.push(optionsRow(object));
        }

        panel.innerHTML = rows.join('');

        panel.querySelectorAll('[data-webforms-property]').forEach(function (input) {
            input.addEventListener('change', function () {
                updateObjectFromInput(draft, object.id, input, true);
            });

            if (input.tagName.toLowerCase() === 'input' && input.type !== 'checkbox') {
                input.addEventListener('input', function () {
                    updateObjectTextProperty(draft, object.id, input);
                });
            }
        });

        panel.querySelectorAll('textarea[data-webforms-property="options"]').forEach(function (textarea) {
            textarea.addEventListener('input', function () {
                updateObjectFromInput(draft, object.id, textarea, false);
            });
        });
    };

    function compactInputRow(label, property, value, readonly) {
        const id = 'webforms-prop-' + property.replace(/\./g, '-');

        return [
            '<div class="webforms-property-row mb-1">',
            '<label class="small mb-0" for="' + ns.escapeHtml(id) + '">' + ns.escapeHtml(label) + '</label>',
            '<input id="' + ns.escapeHtml(id) + '" class="form-control form-control-sm" type="text" value="' + ns.escapeHtml(value) + '" data-webforms-property="' + ns.escapeHtml(property) + '"' + (readonly ? ' readonly="readonly"' : '') + '>',
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
            '<label class="small mb-0" for="' + ns.escapeHtml(id) + '">' + ns.escapeHtml(label) + '</label>',
            '<select id="' + ns.escapeHtml(id) + '" class="form-control form-control-sm" data-webforms-property="' + ns.escapeHtml(property) + '">',
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

    function optionsRow(object) {
        const id = 'webforms-prop-options';

        return [
            '<div class="mt-2">',
            '<label class="small mb-1" for="' + id + '">Options value|label, one per line</label>',
            '<textarea id="' + id + '" class="form-control form-control-sm" rows="4" data-webforms-property="options">',
            ns.escapeHtml(ns.optionsToText(object)),
            '</textarea>',
            '</div>'
        ].join('');
    }

    function updateObjectTextProperty(draft, objectId, input) {
        const object = ns.findObject(draft, objectId);

        if (!object || input.readOnly) {
            return;
        }

        const property = input.dataset.webformsProperty;
        object[property] = input.value;

        ns.updateGridObjectPreview(object);
        ns.renderJson(draft);
    }

    function updateObjectFromInput(draft, objectId, input, rerenderPanel) {
        const object = ns.findObject(draft, objectId);

        if (!object || input.readOnly) {
            return;
        }

        const property = input.dataset.webformsProperty;
        const value = input.type === 'checkbox' ? input.checked : input.value;

        ns.setObjectProperty(object, property, value);

        ns.renderGrid(draft);

        if (rerenderPanel) {
            ns.renderSelectionPanel(draft, objectId);
        }
        else {
            ns.updateGridSelection(objectId);
        }

        ns.renderJson(draft);
    }
})();
