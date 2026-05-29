(function () {
    'use strict';

    const ns = window.WebformsDesign = window.WebformsDesign || {};

    ns.renderSelectionPanel = function (draft, objectId) {
        const panel = document.getElementById('webforms-design-selection');
        if (!panel) {
            return;
        }

        if (!objectId) {
            panel.innerHTML = '<p class="small text-muted mb-0">No object selected.</p>';
            return;
        }

        const object = ns.findObject(draft, objectId);
        if (!object) {
            panel.innerHTML = '<p class="small text-muted mb-0">Selected object not found.</p>';
            return;
        }

        const rows = [compactInputRow('ID', 'id', object.id, true)];

        if (usesLabel(object)) {
            rows.push(compactInputRow('Label', 'label', object.label || '', false));
        }

        if (usesHint(object)) {
            rows.push(compactInputRow('Hint', 'placeholder', object.placeholder || '', false));
        }

        if (usesDefault(object)) {
            rows.push(defaultRow(object));
        }

        rows.push(placementSelectRow(object.placement));

        if (usesRequired(object)) {
            rows.push(requiredRow(Boolean(object.validation.required)));
        }

        if (object.type === 'select') {
            rows.push(optionsRow(object));
        }

        panel.innerHTML = rows.join('');

        panel.querySelectorAll('[data-webforms-property]').forEach(function (input) {
            input.addEventListener('change', function () {
                updateObjectFromInput(draft, object.id, input, true);
            });

            if (isImmediateTextPropertyInput(input)) {
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

    function usesLabel(object) {
        return Boolean(object && object.type !== 'result_panel');
    }

    function usesHint(object) {
        return Boolean(object && (object.type === 'text' || object.type === 'textarea'));
    }

    function usesDefault(object) {
        return Boolean(object && (
            object.type === 'text' ||
            object.type === 'textarea' ||
            object.type === 'help_text' ||
            object.type === 'result_panel'
        ));
    }

    function usesRequired(object) {
        return Boolean(object && (
            object.type === 'text' ||
            object.type === 'textarea' ||
            object.type === 'checkbox' ||
            object.type === 'select'
        ));
    }

    function defaultRow(object) {
        if (object.type === 'textarea') {
            return compactTextareaRow('Default', 'default', object.default || '', false, 3, false);
        }

        if (object.type === 'result_panel') {
            return compactTextareaRow('Default', 'default', object.default || '', false, 3, true);
        }

        return compactInputRow('Default', 'default', object.default || '', false);
    }

    function compactInputRow(label, property, value, readonly) {
        const id = 'webforms-prop-' + property.replace(/\./g, '-');
        return [
            '<div class="webforms-property-row mb-1">',
            '<label class="small mb-0" for="' + ns.escapeHtml(id) + '">' + ns.escapeHtml(label) + '</label>',
            '<input id="' + ns.escapeHtml(id) + '" class="form-control form-control-sm" type="text" value="' + ns.escapeHtml(value) + '" data-webforms-property="' + ns.escapeHtml(property) + '"' + (readonly ? ' readonly="readonly"' : '') + '>',
            '</div>'
        ].join('');
    }

    function compactTextareaRow(label, property, value, readonly, rows, fixed) {
        const id = 'webforms-prop-' + property.replace(/\./g, '-');
        const style = fixed ? ' style="resize:none;overflow:hidden;"' : '';
        return [
            '<div class="webforms-property-row mb-1">',
            '<label class="small mb-0" for="' + ns.escapeHtml(id) + '">' + ns.escapeHtml(label) + '</label>',
            '<textarea id="' + ns.escapeHtml(id) + '" class="form-control form-control-sm" rows="' + (rows || 3) + '" data-webforms-property="' + ns.escapeHtml(property) + '"' + (readonly ? ' readonly="readonly"' : '') + style + '>',
            ns.escapeHtml(value),
            '</textarea>',
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

    function isImmediateTextPropertyInput(input) {
        const tag = input.tagName.toLowerCase();
        if (tag === 'input' && input.type !== 'checkbox') {
            return true;
        }
        return tag === 'textarea' && input.dataset.webformsProperty !== 'options';
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
}());
