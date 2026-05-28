(function () {
    'use strict';

    const VERSION = '0.1';

    function init() {
        const runtime = document.getElementById('webforms-runtime');

        if (!runtime || runtime.dataset.webformsMode !== 'deploy') {
            return;
        }

        const root = document.getElementById('webforms-deploy-render-root');

        if (!root) {
            return;
        }

        const formId = runtime.dataset.webformsDeployForm || '';

        if (!formId) {
            renderMessage(root, 'No webform selected.');
            return;
        }

        const draft = loadDraft(formId);

        if (!draft) {
            renderMessage(root, 'No browser-session draft found for "' + formId + '". Design this form in the Grid first, then return to Deploy.');
            return;
        }

        const pkg = buildPackage(draft);

        renderPackage(root, pkg);
    }

    function loadDraft(formId) {
        if (!window.sessionStorage) {
            return null;
        }

        try {
            const raw = window.sessionStorage.getItem(storageKeyForForm(formId));

            if (!raw) {
                return null;
            }

            const draft = JSON.parse(raw);

            if (!isValidDraft(draft, formId)) {
                return null;
            }

            return draft;
        }
        catch (error) {
            console.warn('Webforms deploy draft load failed.', error);
            return null;
        }
    }

    function storageKeyForForm(formId) {
        return 'hubzilla.webforms.designDraft.' + VERSION + '.' + formId;
    }

    function isValidDraft(draft, formId) {
        return draft &&
            draft.schema === 'hubzilla.webforms.designDraft' &&
            draft.version === VERSION &&
            draft.form &&
            draft.form.id === formId &&
            Array.isArray(draft.objects);
    }

    function buildPackage(draft) {
        return {
            schema: 'hubzilla.webforms.package',
            version: VERSION,
            meta: {
                id: draft.form.id,
                title: draft.form.title,
                status: draft.status,
                access: draft.access,
                generator: {
                    name: 'Hubzilla Webforms',
                    mode: 'browser-local',
                    version: VERSION
                }
            },
            form: buildPortableFormSection(draft),
            runtime: {
                schema: 'hubzilla.webforms.runtime',
                version: VERSION,
                storage: {
                    mode: 'none'
                },
                services: [],
                federation: []
            }
        };
    }

    function buildPortableFormSection(draft) {
        return {
            schema: 'hubzilla.webforms.form',
            version: VERSION,
            id: draft.form.id,
            title: draft.form.title,
            fields: draft.objects
                .filter(isPortableField)
                .map(buildPortableField),
            layout: draft.objects.map(buildPortableLayoutItem)
        };
    }

    function isPortableField(object) {
        return ![
            'container',
            'label',
            'result_panel',
            'help_text'
        ].includes(object.type);
    }

    function buildPortableField(object) {
        const field = {
            id: object.id,
            type: object.type,
            label: object.label || object.id,
            required: Boolean(object.validation && object.validation.required)
        };

        if (object.type !== 'checkbox' && object.type !== 'button') {
            field.placeholder = object.placeholder || '';
            field.default = object.default || '';
        }

        if (object.type === 'select') {
            field.options = clonePlainObject(object.options || []);
        }

        if (object.type === 'button') {
            field.action = 'none';
        }

        return field;
    }

    function buildPortableLayoutItem(object) {
        const item = {
            id: object.id,
            type: object.type,
            parent: object.parent,
            x: object.placement.x,
            y: object.placement.y,
            width: object.placement.width,
            height: object.placement.height,
            unit: object.placement.unit
        };

        if (object.type === 'result_panel' || object.type === 'help_text') {
            item.label = object.label || object.id;
            item.text = object.default || '';
        }

        return item;
    }

    function renderPackage(root, pkg) {
        root.innerHTML = '';

        const heading = document.createElement('h4');
        heading.textContent = pkg.form.title;

        const notice = document.createElement('p');
        notice.className = 'small text-muted';
        notice.textContent = 'Browser-session Deploy render. No submit, storage, service, or federation action is active.';

        const form = document.createElement('form');
        form.className = 'webforms-deploy-rendered-form';
        form.addEventListener('submit', function (event) {
            event.preventDefault();
        });

        const fieldsById = fieldsMap(pkg.form.fields);

        pkg.form.layout.forEach(function (layoutItem) {
            const field = fieldsById[layoutItem.id] || null;
            const rendered = renderLayoutItem(layoutItem, field);

            if (rendered) {
                form.appendChild(rendered);
            }
        });

        root.appendChild(heading);
        root.appendChild(notice);
        root.appendChild(form);
    }

    function fieldsMap(fields) {
        return fields.reduce(function (map, field) {
            map[field.id] = field;
            return map;
        }, {});
    }

    function renderLayoutItem(layoutItem, field) {
        if (layoutItem.type === 'container') {
            return renderContainer(layoutItem);
        }

        if (layoutItem.type === 'label') {
            return renderTextBlock(layoutItem, layoutItem.id);
        }

        if (layoutItem.type === 'result_panel') {
            return renderResultPanel(layoutItem);
        }

        if (layoutItem.type === 'help_text') {
            return renderHelpText(layoutItem);
        }

        if (!field) {
            return null;
        }

        if (field.type === 'textarea') {
            return renderTextarea(field);
        }

        if (field.type === 'checkbox') {
            return renderCheckbox(field);
        }

        if (field.type === 'button') {
            return renderButton(field);
        }

        if (field.type === 'select') {
            return renderSelect(field);
        }

        return renderTextInput(field);
    }

    function renderContainer(layoutItem) {
        const box = document.createElement('fieldset');
        box.className = 'well webforms-deploy-container';
        box.dataset.webformsLayoutId = layoutItem.id;

        const legend = document.createElement('legend');
        legend.className = 'small';
        legend.textContent = layoutItem.id;

        box.appendChild(legend);

        return box;
    }

    function renderTextBlock(layoutItem) {
        const block = document.createElement('p');
        block.className = 'webforms-deploy-label';
        block.dataset.webformsLayoutId = layoutItem.id;
        block.textContent = layoutItem.id;

        return block;
    }

    function renderResultPanel(layoutItem) {
        const panel = document.createElement('div');
        panel.className = 'well webforms-deploy-result-panel';
        panel.dataset.webformsLayoutId = layoutItem.id;

        const label = document.createElement('strong');
        label.textContent = layoutItem.label || layoutItem.id;

        const text = document.createElement('p');
        text.className = 'mb-0';
        text.textContent = layoutItem.text || 'Result output placeholder';

        panel.appendChild(label);
        panel.appendChild(text);

        return panel;
    }

    function renderHelpText(layoutItem) {
        const block = document.createElement('div');
        block.className = 'alert alert-secondary py-2 webforms-deploy-help-text';
        block.dataset.webformsLayoutId = layoutItem.id;
        block.textContent = layoutItem.text || layoutItem.label || layoutItem.id;

        return block;
    }

    function renderTextInput(field) {
        const group = formGroup(field);
        const input = document.createElement('input');

        input.className = 'form-control';
        input.type = 'text';
        input.name = field.id;
        input.id = 'webforms-deploy-field-' + field.id;
        input.placeholder = field.placeholder || '';
        input.value = field.default || '';
        input.required = Boolean(field.required);

        group.appendChild(input);

        return group;
    }

    function renderTextarea(field) {
        const group = formGroup(field);
        const textarea = document.createElement('textarea');

        textarea.className = 'form-control';
        textarea.name = field.id;
        textarea.id = 'webforms-deploy-field-' + field.id;
        textarea.placeholder = field.placeholder || '';
        textarea.value = field.default || '';
        textarea.required = Boolean(field.required);

        group.appendChild(textarea);

        return group;
    }

    function renderCheckbox(field) {
        const group = document.createElement('div');
        group.className = 'form-check mb-2';

        const input = document.createElement('input');
        input.className = 'form-check-input';
        input.type = 'checkbox';
        input.name = field.id;
        input.id = 'webforms-deploy-field-' + field.id;
        input.required = Boolean(field.required);

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.setAttribute('for', input.id);
        label.textContent = field.label || field.id;

        group.appendChild(input);
        group.appendChild(label);

        return group;
    }

    function renderButton(field) {
        const button = document.createElement('button');

        button.className = 'btn btn-secondary mb-2';
        button.type = 'button';
        button.disabled = true;
        button.textContent = field.label || field.id;

        return button;
    }

    function renderSelect(field) {
        const group = formGroup(field);
        const select = document.createElement('select');

        select.className = 'form-control';
        select.name = field.id;
        select.id = 'webforms-deploy-field-' + field.id;
        select.required = Boolean(field.required);

        (field.options || []).forEach(function (option) {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            select.appendChild(opt);
        });

        group.appendChild(select);

        return group;
    }

    function formGroup(field) {
        const group = document.createElement('div');
        group.className = 'form-group mb-2';

        const label = document.createElement('label');
        label.setAttribute('for', 'webforms-deploy-field-' + field.id);
        label.textContent = field.label || field.id;

        group.appendChild(label);

        return group;
    }

    function renderMessage(root, message) {
        root.innerHTML = '';

        const empty = document.createElement('div');
        empty.className = 'well';
        empty.textContent = message;

        root.appendChild(empty);
    }

    function clonePlainObject(value) {
        return JSON.parse(JSON.stringify(value));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }
    else {
        init();
    }
})();
