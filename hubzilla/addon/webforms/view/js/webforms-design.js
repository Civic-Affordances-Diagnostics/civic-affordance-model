(function () {
  'use strict';

  const ns = window.WebformsDesign = window.WebformsDesign || {};
  let activeDraft = null;
  let activeRuntime = null;

  function getRuntime() {
    return document.getElementById('webforms-runtime');
  }

  function initToolbar(runtime) {
    document.querySelectorAll('[data-webforms-tool]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (button.disabled || !activeDraft) {
          return;
        }

        const nextDraft = handleToolClick(activeDraft, runtime, button.dataset.webformsTool, function (importedDraft) {
          activeDraft = importedDraft;
        });

        if (nextDraft) {
          activeDraft = nextDraft;
        }
      });
    });
  }

  function addObjectToActiveStep(draft, object) {
    if (draft && draft.design && draft.design.active_step && object && object.parent === draft.grid.id) {
      object.step = draft.design.active_step;
    }

    ns.addObject(draft, object);
  }

  function handleToolClick(draft, runtime, tool, onImported) {
    if (tool === 'container') {
      addObjectToActiveStep(draft, ns.createContainerObject(draft));
      return draft;
    }

    if (tool === 'field') {
      addObjectToActiveStep(draft, ns.createTextFieldObject(draft));
      return draft;
    }

    if (tool === 'label') {
      addObjectToActiveStep(draft, ns.createLabelObject(draft));
      return draft;
    }

    if (tool === 'textarea') {
      addObjectToActiveStep(draft, ns.createTextareaObject(draft));
      return draft;
    }

    if (tool === 'checkbox') {
      addObjectToActiveStep(draft, ns.createCheckboxObject(draft));
      return draft;
    }

    if (tool === 'button') {
      addObjectToActiveStep(draft, ns.createButtonObject(draft));
      return draft;
    }

    if (tool === 'select') {
      addObjectToActiveStep(draft, ns.createSelectObject(draft));
      return draft;
    }

    if (tool === 'result-panel') {
      addObjectToActiveStep(draft, ns.createResultPanelObject(draft));
      return draft;
    }

    if (tool === 'help-text') {
      addObjectToActiveStep(draft, ns.createHelpTextObject(draft));
      return draft;
    }

    if (tool === 'delete-selected') {
      ns.deleteSelectedObject(draft);
      return draft;
    }

    if (tool === 'copy-json' && typeof ns.copyPackageJson === 'function') {
      ns.copyPackageJson(draft);
      return draft;
    }

    if (tool === 'download-json' && typeof ns.downloadPackageJson === 'function') {
      ns.downloadPackageJson(draft);
      return draft;
    }

    if (tool === 'import-json' && typeof ns.importPackageJson === 'function') {
      ns.importPackageJson(runtime, function (importedDraft) {
        activeDraft = importedDraft;
        if (typeof onImported === 'function') {
          onImported(importedDraft);
        }
      });
      return draft;
    }

    if (tool === 'clear-json' && typeof ns.clearPackageJson === 'function') {
      return ns.clearPackageJson(draft, runtime);
    }

    return draft;
  }

  function renderJsonOrExplain(draft) {
    const output = document.getElementById('webforms-json-output');

    if (typeof ns.renderJson === 'function') {
      ns.renderJson(draft);
      return;
    }

    if (output) {
      output.value = 'Webforms JSON renderer did not load.';
    }
  }

  function renderAll(draft) {
    if (!draft) {
      return;
    }

    window.webformsDesignDraft = draft;
    ns.renderGrid(draft);
    ns.renderSelectionPanel(draft, draft.design.selected_object_id);
    renderJsonOrExplain(draft);
  }

  async function loadSelectedPackage(detail) {
    if (!activeRuntime || typeof ns.loadSelectedBundledPackage !== 'function') {
      return;
    }

    const servicePack = detail && detail.servicePack ? detail.servicePack : '';
    const formId = detail && detail.formId ? detail.formId : '';
    const packageUrl = detail && detail.packageUrl ? detail.packageUrl : '';

    if (!formId) {
      activeRuntime.dataset.webformsServicePack = servicePack;
      activeRuntime.dataset.webformsDesignForm = '';
      activeRuntime.dataset.webformsPackageUrl = '';
      activeDraft = ns.buildDraft(activeRuntime);
      renderAll(activeDraft);
      return;
    }

    const draft = await ns.loadSelectedBundledPackage(activeRuntime, servicePack, formId, packageUrl);

    if (draft) {
      activeDraft = draft;
      renderAll(activeDraft);
    }
  }

  async function init() {
    const runtime = getRuntime();

    if (!runtime || runtime.dataset.webformsMode !== 'design') {
      return;
    }

    activeRuntime = runtime;
    activeDraft = ns.loadDraft(runtime);

    if (typeof ns.loadBundledPackageDraft === 'function') {
      activeDraft = await ns.loadBundledPackageDraft(runtime, activeDraft);
    }

    initToolbar(runtime);
    renderAll(activeDraft);

    document.addEventListener('webforms:design-package-selected', function (event) {
      loadSelectedPackage(event.detail || {});
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  }
  else {
    init();
  }
}());
