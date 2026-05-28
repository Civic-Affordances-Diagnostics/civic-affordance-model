(function () {
    'use strict';

    const ns = window.WebformsDesign = window.WebformsDesign || {};
    const SELECTED_CLASS = 'webforms-js-object-selected';

    ns.renderGrid = function (draft) {
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
                    ns.selectObject(draft, null);
                }
            });
            grid.dataset.webformsSelectionHandler = '1';
        }

        ns.updateGridSelection(draft.design.selected_object_id);
    };

    ns.updateGridSelection = function (objectId) {
        document.querySelectorAll('[data-webforms-generated-object="1"]').forEach(function (node) {
            const isSelected = node.dataset.webformsObjectId === objectId;
            node.classList.toggle(SELECTED_CLASS, isSelected);
        });
    };

    ns.updateGridObjectPreview = function (object) {
        const wrapper = document.querySelector('[data-webforms-object-id="' + ns.cssEscape(object.id) + '"]');

        if (!wrapper) {
            return;
        }

        wrapper.innerHTML = '';
        renderObjectContent(wrapper, object);
    };

    function removeGeneratedObjects(grid) {
        grid.querySelectorAll('[data-webforms-generated-object="1"]').forEach(function (node) {
            node.remove();
        });
    }

    function createObjectElement(object, gridSize) {
        const placement = object.placement;
        const wrapper = document.createElement('div');

        wrapper.id = 'webforms-object-' + object.id;
        wrapper.className = object.type === 'container' ? 'webforms-js-object webforms-js-container' : 'webforms-js-object';
        wrapper.dataset.webformsGeneratedObject = '1';
        wrapper.dataset.webformsObjectId = object.id;
        wrapper.dataset.webformsObjectType = object.type;

        wrapper.style.left = (placement.x * gridSize) + 'px';
        wrapper.style.top = (placement.y * gridSize) + 'px';
        wrapper.style.width = (placement.width * gridSize) + 'px';
        wrapper.style.minHeight = (placement.height * gridSize) + 'px';

        wrapper.addEventListener('click', function (event) {
            event.stopPropagation();
            ns.selectObject(window.webformsDesignDraft, object.id);
        });

        renderObjectContent(wrapper, object);

        return wrapper;
    }

    function renderObjectContent(wrapper, object) {
        if (object.type === 'container') {
            renderContainerObject(wrapper, object);
            return;
        }

        if (object.type === 'label') {
            renderLabelObject(wrapper, object);
            return;
        }

        if (object.type === 'textarea') {
            renderTextareaObject(wrapper, object);
            return;
        }

        if (object.type === 'checkbox') {
            renderCheckboxObject(wrapper, object);
            return;
        }

        if (object.type === 'button') {
            renderButtonObject(wrapper, object);
            return;
        }

        if (object.type === 'select') {
            renderSelectObject(wrapper, object);
            return;
        }

        if (object.type === 'result_panel') {
            renderResultPanelObject(wrapper, object);
            return;
        }

        if (object.type === 'help_text') {
            renderHelpTextObject(wrapper, object);
            return;
        }

        renderTextObject(wrapper, object);
    }

    function renderContainerObject(wrapper, object) {
        const label = document.createElement('div');
        label.className = 'webforms-object-label';
        label.textContent = object.label || object.id;

        wrapper.appendChild(label);
    }

    function renderLabelObject(wrapper, object) {
        const label = document.createElement('div');
        label.className = 'webforms-object-label';
        label.textContent = object.label || object.id;

        wrapper.appendChild(label);
    }

    function renderTextObject(wrapper, object) {
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
    }

    function renderTextareaObject(wrapper, object) {
        const label = document.createElement('label');
        label.setAttribute('for', 'webforms-preview-' + object.id);
        label.textContent = object.label || object.id;

        const textarea = document.createElement('textarea');
        textarea.id = 'webforms-preview-' + object.id;
        textarea.className = 'form-control form-control-sm';
        textarea.value = object.default || '';
        textarea.placeholder = object.placeholder || '';
        textarea.disabled = true;

        wrapper.appendChild(label);
        wrapper.appendChild(textarea);
    }

    function renderCheckboxObject(wrapper, object) {
        const group = document.createElement('div');
        group.className = 'form-check';

        const input = document.createElement('input');
        input.id = 'webforms-preview-' + object.id;
        input.className = 'form-check-input';
        input.type = 'checkbox';
        input.disabled = true;

        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.setAttribute('for', 'webforms-preview-' + object.id);
        label.textContent = object.label || object.id;

        group.appendChild(input);
        group.appendChild(label);
        wrapper.appendChild(group);
    }

    function renderButtonObject(wrapper, object) {
        const button = document.createElement('button');
        button.className = 'btn btn-sm btn-secondary';
        button.type = 'button';
        button.disabled = true;
        button.textContent = object.label || object.id;

        wrapper.appendChild(button);
    }

    function renderSelectObject(wrapper, object) {
        const label = document.createElement('label');
        label.setAttribute('for', 'webforms-preview-' + object.id);
        label.textContent = object.label || object.id;

        const select = document.createElement('select');
        select.id = 'webforms-preview-' + object.id;
        select.className = 'form-control form-control-sm';
        select.disabled = true;

        if (Array.isArray(object.options)) {
            object.options.forEach(function (option) {
                const opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.label;
                select.appendChild(opt);
            });
        }

        wrapper.appendChild(label);
        wrapper.appendChild(select);
    }

    function renderResultPanelObject(wrapper, object) {
        const label = document.createElement('div');
        label.className = 'webforms-object-label';
        label.textContent = object.label || object.id;

        const panel = document.createElement('div');
        panel.className = 'well well-sm mt-1 mb-0';
        panel.textContent = object.default || 'Result output placeholder';

        wrapper.appendChild(label);
        wrapper.appendChild(panel);
    }

    function renderHelpTextObject(wrapper, object) {
        const label = document.createElement('div');
        label.className = 'webforms-object-label';
        label.textContent = object.label || object.id;

        const text = document.createElement('p');
        text.className = 'small mb-0';
        text.textContent = object.default || 'Helpful instructions or explanatory text.';

        wrapper.appendChild(label);
        wrapper.appendChild(text);
    }
})();
