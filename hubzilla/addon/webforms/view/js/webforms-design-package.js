(function () {
  'use strict';

  const ns = window.WebformsDesign = window.WebformsDesign || {};
  const VERSION = ns.VERSION || '0.1';
  const GRID_SIZE = ns.GRID_SIZE || 24;

  ns.buildPackage = function (draft) {
    return {
      schema: 'hubzilla.webforms.package',
      version: VERSION,
      meta: buildPackageMeta(draft),
      design: buildDesignSection(draft),
      form: buildPortableFormSection(draft),
      runtime: buildRuntimeSection()
    };
  };

  ns.renderJson = function (draft) {
    const output = document.getElementById('webforms-json-output');
    const pkg = ns.buildPackage(draft);

    ns.persistDraft(draft);
    ns.persistPackage(pkg);

    if (!output) {
      return;
    }

    output.value = JSON.stringify(pkg, null, 2);
  };

  ns.persistPackage = function (pkg) {
    if (!window.sessionStorage || !pkg || !pkg.meta || !pkg.meta.id) {
      return;
    }

    try {
      const payload = JSON.stringify(pkg);
      window.sessionStorage.setItem(packageKeyForForm(pkg.meta.id), payload);
      window.sessionStorage.setItem(activePackageKey(), payload);
    }
    catch (error) {
      console.warn('Webforms package was not persisted to sessionStorage.', error);
    }
  };

  ns.packageToDraft = function (pkg, runtime) {
    if (!pkg || pkg.schema !== 'hubzilla.webforms.package') {
      throw new Error('Not a hubzilla.webforms.package document.');
    }

    if (!pkg.design || !Array.isArray(pkg.design.objects)) {
      throw new Error('Package does not contain design.objects.');
    }

    const access = runtime.dataset.webformsAccess || 'public';
    const routeFormId = runtimeFormId(runtime);
    const formId = packageFormId(pkg) || routeFormId;
    const formTitle = packageFormTitle(pkg) || humanizeSlug(formId);

    return {
      schema: 'hubzilla.webforms.designDraft',
      version: VERSION,
      status: 'browser-local',
      access: {
        mode: access,
        public_local_only: access === 'public'
      },
      form: {
        id: formId,
        title: formTitle
      },
      design: {
        active_tab: runtime.dataset.webformsDesignTab || 'grid',
        active_step: packageActiveStep(pkg),
        selected_object_id: null,
        source: 'package-json',
        route_form_id: routeFormId,
        next_object_number: findNextObjectNumber(pkg.design.objects)
      },
      grid: pkg.design.grid || {
        id: 'root-form',
        unit: 'px',
        size: GRID_SIZE,
        columns_observed: 22,
        rows_observed: 17,
        placement_scope: 'immediate-container'
      },
      objects: clonePlainObject(pkg.design.objects),
      notes: [
        'This draft was loaded from package JSON.',
        'No server write, storage, API call, or federation action is performed.'
      ]
    };
  };

  function packageKeyForForm(formId) {
    return 'hubzilla.webforms.package.' + VERSION + '.' + formId;
  }

  function activePackageKey() {
    return 'hubzilla.webforms.activePackage.' + VERSION;
  }

  function runtimeFormId(runtime) {
    return runtime.dataset.webformsDesignForm || 'new-blank-form';
  }

  function packageFormId(pkg) {
    if (pkg.meta && pkg.meta.id) {
      return pkg.meta.id;
    }

    if (pkg.form && pkg.form.id) {
      return pkg.form.id;
    }

    return '';
  }

  function packageFormTitle(pkg) {
    if (pkg.meta && pkg.meta.title) {
      return pkg.meta.title;
    }

    if (pkg.form && pkg.form.title) {
      return pkg.form.title;
    }

    return '';
  }

  function packageActiveStep(pkg) {
    if (pkg.design && pkg.design.active_step) {
      return pkg.design.active_step;
    }

    if (pkg.deploy && pkg.deploy.workflow && Array.isArray(pkg.deploy.workflow.steps) && pkg.deploy.workflow.steps.length) {
      return pkg.deploy.workflow.steps[0].id || '';
    }

    return '';
  }

  function buildPackageMeta(draft) {
    return {
      id: draft.form.id,
      title: draft.form.title,
      status: draft.status,
      access: draft.access,
      generator: {
        name: 'Hubzilla Webforms',
        mode: 'browser-local',
        version: VERSION
      }
    };
  }

  function buildDesignSection(draft) {
    return {
      schema: 'hubzilla.webforms.design',
      version: VERSION,
      active_tab: draft.design.active_tab,
      active_step: draft.design.active_step || '',
      selected_object_id: draft.design.selected_object_id,
      grid: clonePlainObject(draft.grid),
      objects: clonePlainObject(draft.objects)
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

  function buildRuntimeSection() {
    return {
      schema: 'hubzilla.webforms.runtime',
      version: VERSION,
      storage: {
        mode: 'none'
      },
      services: [],
      federation: [],
      notes: [
        'Runtime execution is not active.',
        'No storage, service call, credential use, or federation action is performed by this package.'
      ]
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

    if (object.step) {
      item.step = object.step;
    }

    if (object.type === 'result_panel' || object.type === 'help_text') {
      item.label = object.label || object.id;
      item.text = object.default || '';
    }

    if (object.type === 'label' || object.type === 'container') {
      item.label = object.label || object.id;
    }

    return item;
  }

  function findNextObjectNumber(objects) {
    return objects.reduce(function (highest, object) {
      const match = object.id.match(/-(\d+)$/);

      if (!match) {
        return highest;
      }

      return Math.max(highest, parseInt(match[1], 10) + 1);
    }, 1);
  }

  function humanizeSlug(value) {
    if (typeof ns.humanizeSlug === 'function') {
      return ns.humanizeSlug(value);
    }

    return String(value).split('-').filter(Boolean).map(function (part) {
      return part.charAt(0).toUpperCase() + part.slice(1);
    }).join(' ');
  }

  function clonePlainObject(value) {
    return JSON.parse(JSON.stringify(value));
  }
}());
