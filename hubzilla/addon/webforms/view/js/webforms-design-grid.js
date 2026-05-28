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

        if (object.type === 'container') {
            const label = wrapper.querySelector('.webforms-object-label');

            if (label) {
                label.textContent = object.label || object.id;
            }

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

        if (object.type === 'container') {
            renderContainerObject(wrapper, object);
        }
        else {
            renderTextObject(wrapper, object);
        }

        return wrapper;
    }

    function renderContainerObject(wrapper, object) {
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
})();
