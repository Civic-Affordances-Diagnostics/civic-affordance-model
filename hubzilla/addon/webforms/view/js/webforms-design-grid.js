(function () {
  'use strict';

  const ns = window.WebformsDesign = window.WebformsDesign || {};
  const SELECTED_CLASS = 'webforms-js-object-selected';

  ns.renderGrid = function (draft) {
    const grid = document.getElementById('webforms-design-grid');

    if (!grid) {
      return;
    }

    window.webformsDesignDraft = draft;

    const activeStep = activeWorkflowStep(draft);

    renderWorkflowSelector(draft, activeStep);
    removeGeneratedObjects(grid);
    renderChildObjects(grid, draft, draft.grid.id, draft.grid.size, activeStep);

    if (!grid.dataset.webformsSelectionHandler) {
      grid.addEventListener('pointerdown', function (event) {
        const objectNode = event.target.closest('[data-webforms-generated-object="1"]');
        const activeDraft = window.webformsDesignDraft || draft;

        if (objectNode && grid.contains(objectNode)) {
          event.preventDefault();
          event.stopPropagation();
          ns.selectObject(activeDraft, objectNode.dataset.webformsObjectId || null);
          return;
        }

        if (event.target === grid) {
          ns.selectObject(activeDraft, null);
        }
      }, true);

      grid.addEventListener('click', function (event) {
        const objectNode = event.target.closest('[data-webforms-generated-object="1"]');
        const activeDraft = window.webformsDesignDraft || draft;

        if (objectNode && grid.contains(objectNode)) {
          event.preventDefault();
          event.stopPropagation();
          ns.selectObject(activeDraft, objectNode.dataset.webformsObjectId || null);
          return;
        }

        if (event.target === grid) {
          ns.selectObject(activeDraft, null);
        }
      }, true);

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
    if (object && object.type === 'container' && window.webformsDesignDraft) {
      ns.renderGrid(window.webformsDesignDraft);
      return;
    }

    const wrapper = document.querySelector('[data-webforms-object-id="' + ns.cssEscape(object.id) + '"]');

    if (!wrapper) {
      return;
    }

    wrapper.innerHTML = '';
    renderObjectContent(wrapper, object, ns.GRID_SIZE || 24);
  };

  function workflowSteps(draft) {
    const preserved = draft && draft.package && draft.package.deploy ? draft.package.deploy : null;

    if (preserved && preserved.workflow && Array.isArray(preserved.workflow.steps)) {
      return preserved.workflow.steps;
    }

    return [];
  }

  function activeWorkflowStep(draft) {
    const steps = workflowSteps(draft);
    const active = draft && draft.design ? draft.design.active_step || '' : '';

    if (!steps.length) {
      return '';
    }

    if (steps.some(function (step) { return step.id === active; })) {
      return active;
    }

    draft.design.active_step = steps[0].id || '';
    return draft.design.active_step;
  }

  function renderWorkflowSelector(draft, activeStep) {
    const host = document.getElementById('webforms-design-workflow');
    const steps = workflowSteps(draft);

    if (!host) {
      return;
    }

    host.innerHTML = '';

    if (!steps.length) {
      return;
    }

    const label = document.createElement('div');
    label.className = 'small text-muted mb-1';
    label.textContent = 'Workflow panel';
    host.appendChild(label);

    const nav = document.createElement('ul');
    nav.className = 'nav nav-pills webforms-design-workflow-tabs';

    steps.forEach(function (step) {
      const item = document.createElement('li');
      const button = document.createElement('button');

      item.className = 'nav-item';
      button.type = 'button';
      button.className = step.id === activeStep ? 'nav-link active' : 'nav-link';
      button.textContent = step.label || step.id || 'Step';
      button.dataset.webformsDesignStep = step.id || '';
      button.addEventListener('click', function () {
        draft.design.active_step = step.id || '';
        draft.design.selected_object_id = null;
        window.webformsDesignDraft = draft;
        ns.persistDraft(draft);
        ns.persistPackage(ns.buildPackage(draft));
        ns.renderGrid(draft);
        ns.renderSelectionPanel(draft, null);
        ns.renderJson(draft);
      });

      item.appendChild(button);
      nav.appendChild(item);
    });

    host.appendChild(nav);
  }

  function renderChildObjects(parentNode, draft, parentId, gridSize, activeStep) {
    draft.objects.forEach(function (object) {
      if (object.parent !== parentId) {
        return;
      }

      if (parentId === draft.grid.id && activeStep && object.step && object.step !== activeStep) {
        return;
      }

      const element = createObjectElement(object, gridSize, draft);
      parentNode.appendChild(element);

      if (object.type === 'container') {
        renderChildObjects(element, draft, object.id, gridSize, activeStep);
      }
    });
  }

  function removeGeneratedObjects(grid) {
    grid.querySelectorAll('[data-webforms-generated-object="1"]').forEach(function (node) {
      node.remove();
    });
  }

  function createObjectElement(object, gridSize, draft) {
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
    wrapper.style.minHeight = (visualRowsForObject(object) * gridSize) + 'px';

    if (object.type === 'container') {
      wrapper.style.position = 'absolute';
    }

    wrapper.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      event.stopPropagation();
      ns.selectObject(window.webformsDesignDraft || draft, object.id);
    }, true);

    wrapper.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      ns.selectObject(window.webformsDesignDraft || draft, object.id);
    }, true);

    renderObjectContent(wrapper, object, gridSize);

    return wrapper;
  }

  function renderObjectContent(wrapper, object, gridSize) {
    if (object.type === 'container') {
      renderContainerObject(wrapper, object);
      return;
    }

    if (object.type === 'label') {
      renderLabelObject(wrapper, object);
      return;
    }

    if (object.type === 'textarea') {
      renderTextareaObject(wrapper, object, gridSize);
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
    label.style.fontWeight = '700';
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

  function renderTextareaObject(wrapper, object, gridSize) {
    const label = document.createElement('label');

    label.setAttribute('for', 'webforms-preview-' + object.id);
    label.textContent = object.label || object.id;

    const textarea = document.createElement('textarea');

    textarea.id = 'webforms-preview-' + object.id;
    textarea.className = 'form-control form-control-sm';
    textarea.value = object.default || '';
    textarea.placeholder = object.placeholder || '';
    textarea.disabled = true;
    textarea.rows = textareaRowsForPlacement(object.placement);
    textarea.style.minHeight = textareaMinHeightForPlacement(object.placement, gridSize);
    textarea.style.resize = 'vertical';
    textarea.style.overflowY = 'auto';
    textarea.style.overflowX = 'hidden';
    textarea.style.whiteSpace = 'pre-wrap';

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
    label.style.fontWeight = '700';
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
    button.style.fontWeight = '700';
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
    panel.style.whiteSpace = 'pre-wrap';
    panel.style.overflow = 'visible';
    panel.style.resize = 'none';
    panel.style.wordBreak = 'break-word';

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

  function visualRowsForObject(object) {
    const placement = object && object.placement ? object.placement : {};
    const height = Math.max(1, parseInt(placement.height, 10) || 1);
    const type = object && object.type ? object.type : 'text';

    if (type === 'textarea') {
      return Math.max(4, height);
    }

    if (type === 'text' || type === 'select' || type === 'help_text' || type === 'result_panel') {
      return Math.max(2, height);
    }

    return height;
  }

  function textareaRowsForPlacement(placement) {
    const height = placement && parseInt(placement.height, 10);
    return Math.max(4, height || 4);
  }

  function textareaMinHeightForPlacement(placement, gridSize) {
    const height = placement && parseInt(placement.height, 10);
    const size = parseInt(gridSize, 10) || 24;
    const gridHeight = Math.max(4, height || 4) * size;
    return Math.max(96, gridHeight - 56) + 'px';
  }
}());
