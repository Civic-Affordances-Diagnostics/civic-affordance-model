(function () {
  'use strict';

  const ns = window.WebformsDesign = window.WebformsDesign || {};

  function getRuntime() {
    return document.getElementById('webforms-runtime');
  }

  function initToolbar(draft, runtime) {
    document.querySelectorAll('[data-webforms-tool]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (button.disabled) {
          return;
        }

        const nextDraft = handleToolClick(draft, runtime, button.dataset.webformsTool, function (importedDraft) {
          draft = importedDraft;
        });

        if (nextDraft) {
          draft = nextDraft;
        }
      });
    });
  }

  function handleToolClick(draft, runtime, tool, onImported) {
    if (tool === 'container') {
      ns.addObject(draft, ns.createContainerObject(draft));
      return draft;
    }

    if (tool === 'field') {
      ns.addObject(draft, ns.createTextFieldObject(draft));
      return draft;
    }

    if (tool === 'label') {
      ns.addObject(draft, ns.createLabelObject(draft));
      return draft;
    }

    if (tool === 'textarea') {
      ns.addObject(draft, ns.createTextareaObject(draft));
      return draft;
    }

    if (tool === 'checkbox') {
      ns.addObject(draft, ns.createCheckboxObject(draft));
      return draft;
    }

    if (tool === 'button') {
      ns.addObject(draft, ns.createButtonObject(draft));
      return draft;
    }

    if (tool === 'select') {
      ns.addObject(draft, ns.createSelectObject(draft));
      return draft;
    }

    if (tool === 'result-panel') {
      ns.addObject(draft, ns.createResultPanelObject(draft));
      return draft;
    }

    if (tool === 'help-text') {
      ns.addObject(draft, ns.createHelpTextObject(draft));
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
      ns.importPackageJson(runtime, onImported);
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

  async function init() {
    const runtime = getRuntime();

    if (!runtime || runtime.dataset.webformsMode !== 'design') {
      return;
    }

    let draft = ns.loadDraft(runtime);

    if (typeof ns.loadBundledPackageDraft === 'function') {
      draft = await ns.loadBundledPackageDraft(runtime, draft);
    }

    window.webformsDesignDraft = draft;
    initToolbar(draft, runtime);
    ns.renderGrid(draft);
    ns.renderSelectionPanel(draft, draft.design.selected_object_id);
    renderJsonOrExplain(draft);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  }
  else {
    init();
  }
}());
