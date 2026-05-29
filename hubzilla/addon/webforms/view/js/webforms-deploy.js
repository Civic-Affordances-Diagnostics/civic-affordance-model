(function () {
    'use strict';

    const pkgApi = window.WebformsPackage;

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
            renderMessage(root, 'No loaded Webforms package JSON found.\nSave or Import a package on the JSON tab first.');
            return;
        }

        renderPackage(root, pkg);
    }

    function loadPackage(formId) {
        const exactPackage = formId ? loadStoredPackage(pkgApi.packageKeyForForm(formId)) : null;
        if (pkgApi.isValidPackage(exactPackage)) {
            return exactPackage;
        }

        const activePackage = loadStoredPackage(pkgApi.activePackageKey());
        if (pkgApi.isValidPackage(activePackage)) {
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

    function renderPackage(root, pkg) {
        root.innerHTML = '';

        const heading = document.createElement('h4');
        heading.textContent = pkg.form.title || pkgApi.packageFormTitle(pkg) || pkg.form.id || 'Webform';

        const notice = document.createElement('p');
        notice.className = 'small text-muted';
        notice.textContent = 'Browser-local Deploy render from loaded package JSON. Controls are interactive, but no submit, storage, service, or federation action is active.';

        const grid = document.createElement('form');
        grid.className = 'webforms-design-grid webforms-deploy-grid';
        grid.dataset.webformsDeployGrid = '1';
        grid.addEventListener('submit', function (event) {
            event.preventDefault();
        });

        const origin = document.createElement('div');
        origin.id = 'webforms-deploy-grid-origin';
        origin.className = 'webforms-grid-origin';
        origin.dataset.webformsGridOrigin = '0,0';
        origin.textContent = 'root container · Deploy render · browser-local package';

        const gridSize = pkgApi.packageGridSize(pkg);
        const bounds = pkgApi.layoutBounds(pkg.form.layout, gridSize);
        const fieldsById = pkgApi.fieldsMap(pkg.form.fields);

        grid.style.position = 'relative';
        grid.style.width = bounds.width + 'px';
        grid.style.minHeight = bounds.height + 'px';
        grid.appendChild(origin);

        pkg.form.layout.forEach(function (layoutItem) {
            const field = fieldsById[layoutItem.id] || null;
            const rendered = renderLayoutItem(layoutItem, field, gridSize);
            if (rendered) {
                grid.appendChild(rendered);
            }
        });

        root.appendChild(heading);
        root.appendChild(notice);
        root.appendChild(grid);
    }

    function renderLayoutItem(layoutItem, field, gridSize) {
        let rendered = null;

        if (layoutItem.type === 'container') {
            rendered = renderContainer();
        }
        else if (layoutItem.type === 'label') {
            rendered = renderLabel(layoutItem);
        }
        else if (layoutItem.type === 'result_panel') {
            rendered = renderResultPanel(layoutItem);
        }
        else if (layoutItem.type === 'help_text') {
            rendered = renderHelpText(layoutItem);
        }
        else if (field && field.type === 'textarea') {
            rendered = renderTextarea(field, layoutItem, gridSize);
        }
        else if (field && field.type === 'checkbox') {
            rendered = renderCheckbox(field);
        }
        else if (field && field.type === 'button') {
            rendered = renderButton(field);
        }
        else if (field && field.type === 'select') {
            rendered = renderSelect(field);
        }
        else if (field) {
            rendered = renderTextInput(field);
        }

        if (rendered) {
            applyPlacement(rendered, layoutItem, field, gridSize);
        }

        return rendered;
    }

    function applyPlacement(node, layoutItem, field, gridSize) {
        node.classList.add('webforms-js-object');
        node.dataset.webformsGeneratedObject = '1';
        node.dataset.webformsLayoutId = layoutItem.id;
        node.dataset.webformsLayoutType = layoutItem.type;
        node.style.position = 'absolute';
        node.style.left = ((parseInt(layoutItem.x, 10) || 0) * gridSize) + 'px';
        node.style.top = ((parseInt(layoutItem.y, 10) || 0) * gridSize) + 'px';
        node.style.width = ((parseInt(layoutItem.width, 10) || 1) * gridSize) + 'px';
        node.style.minHeight = (visualRowsForLayout(layoutItem, field) * gridSize) + 'px';
    }

    function renderContainer() {
        const box = document.createElement('fieldset');
        box.className = 'webforms-js-container webforms-deploy-container';
        return box;
    }

    function renderLabel(layoutItem) {
        const block = document.createElement('div');
        block.className = 'webforms-object-label webforms-deploy-label';
        block.style.fontWeight = '700';
        block.textContent = layoutItem.label || layoutItem.id;
        return block;
    }

    function renderResultPanel(layoutItem) {
        const panel = document.createElement('div');
        panel.className = 'webforms-deploy-result-panel';

        const label = document.createElement('div');
        label.className = 'webforms-object-label';
        label.textContent = layoutItem.label || layoutItem.id;

        const text = document.createElement('div');
        text.className = 'well well-sm mt-1 mb-0';
        text.textContent = layoutItem.text || 'Result output placeholder';
        text.style.whiteSpace = 'pre-wrap';
        text.style.overflow = 'visible';
        text.style.resize = 'none';
        text.style.wordBreak = 'break-word';

        panel.appendChild(label);
        panel.appendChild(text);
        return panel;
    }

    function renderHelpText(layoutItem) {
        const block = document.createElement('div');
        block.className = 'webforms-deploy-help-text';

        const label = document.createElement('div');
        label.className = 'webforms-object-label';
        label.textContent = layoutItem.label || layoutItem.id;

        const text = document.createElement('p');
        text.className = 'small mb-0';
        text.textContent = layoutItem.text || 'Helpful instructions or explanatory text.';

        block.appendChild(label);
        block.appendChild(text);
        return block;
    }

    function renderTextInput(field) {
        const group = formGroup(field);
        const input = document.createElement('input');
        input.className = 'form-control form-control-sm';
        input.type = 'text';
        input.name = field.id;
        input.id = 'webforms-deploy-field-' + field.id;
        input.placeholder = field.placeholder || '';
        input.value = field.default || '';
        input.required = Boolean(field.required);
        group.appendChild(input);
        return group;
    }

    function renderTextarea(field, layoutItem, gridSize) {
        const group = formGroup(field);
        const textarea = document.createElement('textarea');
        textarea.className = 'form-control form-control-sm';
        textarea.name = field.id;
        textarea.id = 'webforms-deploy-field-' + field.id;
        textarea.placeholder = field.placeholder || '';
        textarea.value = field.default || '';
        textarea.required = Boolean(field.required);
        textarea.rows = textareaRowsForLayout(layoutItem);
        textarea.style.minHeight = textareaMinHeightForLayout(layoutItem, gridSize);
        textarea.style.resize = 'vertical';
        textarea.style.overflowY = 'auto';
        textarea.style.overflowX = 'hidden';
        textarea.style.whiteSpace = 'pre-wrap';
        group.appendChild(textarea);
        return group;
    }

    function renderCheckbox(field) {
        const group = document.createElement('div');
        group.className = 'form-check webforms-deploy-check';

        const input = document.createElement('input');
        input.className = 'form-check-input';
        input.type = 'checkbox';
        input.name = field.id;
        input.id = 'webforms-deploy-field-' + field.id;
        input.required = Boolean(field.required);

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.setAttribute('for', input.id);
        label.style.fontWeight = '700';
        label.textContent = field.label || field.id;

        group.appendChild(input);
        group.appendChild(label);
        return group;
    }

    function renderButton(field) {
        const button = document.createElement('button');
        button.className = 'btn btn-sm btn-secondary';
        button.type = 'button';
        button.style.fontWeight = '700';
        button.textContent = field.label || field.id;
        return button;
    }

    function renderSelect(field) {
        const group = formGroup(field);
        const select = document.createElement('select');
        select.className = 'form-control form-control-sm';
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
        group.className = 'webforms-deploy-field';

        const label = document.createElement('label');
        label.setAttribute('for', 'webforms-deploy-field-' + field.id);
        label.textContent = field.label || field.id;
        group.appendChild(label);

        return group;
    }

    function visualRowsForLayout(layoutItem, field) {
        const height = Math.max(1, parseInt(layoutItem.height, 10) || 1);
        const type = field && field.type ? field.type : layoutItem.type;

        if (type === 'textarea') {
            return Math.max(4, height);
        }

        if (type === 'text' || type === 'select' || type === 'help_text' || type === 'result_panel') {
            return Math.max(2, height);
        }

        return height;
    }

    function textareaRowsForLayout(layoutItem) {
        const height = layoutItem && parseInt(layoutItem.height, 10);
        return Math.max(4, height || 4);
    }

    function textareaMinHeightForLayout(layoutItem, gridSize) {
        const height = layoutItem && parseInt(layoutItem.height, 10);
        const size = parseInt(gridSize, 10) || 24;
        const gridHeight = Math.max(4, height || 4) * size;
        return Math.max(96, gridHeight - 56) + 'px';
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
}());
