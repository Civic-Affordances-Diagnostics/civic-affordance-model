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
        const pkg = loadPackage(formId);

        if (!pkg) {
            renderMessage(root, 'No loaded Webforms package JSON found. Save or Import a package on the JSON tab first.');
            return;
        }

        renderPackage(root, pkg);
    }

    function loadPackage(formId) {
        const exactPackage = formId ? loadStoredPackage(packageKeyForForm(formId)) : null;

        if (isValidPackage(exactPackage)) {
            return exactPackage;
        }

        const activePackage = loadStoredPackage(activePackageKey());

        if (isValidPackage(activePackage)) {
            return activePackage;
        }

        return null;
    }

    function loadStoredPackage(key) {
        if (!window.sessionStorage || !key) {
            return null;
        }

        try {
            const raw = window.sessionStorage.getItem(key);

            if (!raw) {
                return null;
            }

            return JSON.parse(raw);
        }
        catch (error) {
            console.warn('Webforms package load failed.', error);
            return null;
        }
    }

    function packageKeyForForm(formId) {
        return 'hubzilla.webforms.package.' + VERSION + '.' + formId;
    }

    function activePackageKey() {
        return 'hubzilla.webforms.activePackage.' + VERSION;
    }

    function isValidPackage(pkg) {
        return pkg &&
            pkg.schema === 'hubzilla.webforms.package' &&
            pkg.version === VERSION &&
            pkg.form &&
            Array.isArray(pkg.form.fields) &&
            Array.isArray(pkg.form.layout);
    }

    function renderPackage(root, pkg) {
        root.innerHTML = '';

        const heading = document.createElement('h4');
        heading.textContent = pkg.form.title || pkg.meta.title || pkg.form.id || 'Webform';

        const notice = document.createElement('p');
        notice.className = 'small text-muted';
        notice.textContent = 'Browser-local Deploy render from loaded package JSON. No submit, storage, service, or federation action is active.';

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
            return renderLabel(layoutItem);
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

    function renderLabel(layoutItem) {
        const block = document.createElement('p');
        block.className = 'webforms-deploy-label';
        block.dataset.webformsLayoutId = layoutItem.id;
        block.textContent = layoutItem.label || layoutItem.id;

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }
    else {
        init();
    }
})();
