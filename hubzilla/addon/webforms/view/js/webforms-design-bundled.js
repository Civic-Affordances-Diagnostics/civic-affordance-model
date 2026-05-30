(function () {
  'use strict';

  const ns = window.WebformsDesign = window.WebformsDesign || {};
  const pkgApi = window.WebformsPackage || null;

  if (!pkgApi || typeof ns.packageToDraft !== 'function' || typeof ns.buildPackage !== 'function') {
    return;
  }

  const originalPackageToDraft = ns.packageToDraft;
  const originalBuildPackage = ns.buildPackage;

  ns.packageToDraft = function (pkg, runtime) {
    const draft = originalPackageToDraft(pkg, runtime);
    const preserved = preservedPackageState(pkg);

    if (Object.keys(preserved).length) {
      draft.package = preserved;
    }

    if (draft.design) {
      draft.design.source = packageSource(pkg);
      draft.design.route_form_id = runtime.dataset.webformsDesignForm || draft.form.id;
      draft.design.active_step = firstWorkflowStepId(pkg);
    }

    return draft;
  };

  ns.buildPackage = function (draft) {
    const pkg = originalBuildPackage(draft);
    const preserved = draft && draft.package ? draft.package : null;

    if (!preserved) {
      return pkg;
    }

    if (preserved.meta) {
      pkg.meta = Object.assign({}, pkg.meta, clonePlainObject(preserved.meta));
    }

    if (preserved.deploy) {
      pkg.deploy = clonePlainObject(preserved.deploy);
    }

    if (preserved.runtime) {
      pkg.runtime = clonePlainObject(preserved.runtime);
    }

    return pkg;
  };

  ns.loadBundledPackageDraft = async function (runtime, draft) {
    const servicePack = runtime.dataset.webformsServicePack || '';
    const formId = runtime.dataset.webformsDesignForm || '';
    const packageUrl = runtime.dataset.webformsPackageUrl || '';

    if (!formId || !shouldLoadBundledPackage(draft, servicePack, formId)) {
      return draft;
    }

    const pkg = await loadPackage(servicePack, formId, packageUrl);

    if (!pkgApi.isValidPackage(pkg) || !pkg.design || !Array.isArray(pkg.design.objects)) {
      return draft;
    }

    const nextDraft = ns.packageToDraft(pkg, runtime);

    window.webformsDesignDraft = nextDraft;
    ns.persistDraft(nextDraft);
    ns.persistPackage(ns.buildPackage(nextDraft));

    return nextDraft;
  };

  ns.loadSelectedBundledPackage = async function (runtime, servicePack, formId, packageUrl) {
    const pkg = await loadPackage(servicePack, formId, packageUrl);

    if (!pkgApi.isValidPackage(pkg) || !pkg.design || !Array.isArray(pkg.design.objects)) {
      return null;
    }

    runtime.dataset.webformsServicePack = servicePack || '';
    runtime.dataset.webformsDesignForm = formId || '';
    runtime.dataset.webformsPackageUrl = packageUrl || '';

    const nextDraft = ns.packageToDraft(pkg, runtime);

    window.webformsDesignDraft = nextDraft;
    ns.persistDraft(nextDraft);
    ns.persistPackage(ns.buildPackage(nextDraft));

    return nextDraft;
  };

  function shouldLoadBundledPackage(draft, servicePack, formId) {
    if (!draft || !Array.isArray(draft.objects)) {
      return true;
    }

    const source = draft.design && draft.design.source ? draft.design.source : '';
    const routeForm = draft.design && draft.design.route_form_id ? draft.design.route_form_id : '';
    const packageServicePack = draft.package && draft.package.meta && draft.package.meta.service_pack ? draft.package.meta.service_pack : '';

    if (source === 'addon-bundled-package' && routeForm === formId && packageServicePack === servicePack) {
      return false;
    }

    if (draft.objects.length > 0 && routeForm === formId) {
      return false;
    }

    return source === '' || source === 'browser' || source === 'package-json' || routeForm !== formId;
  }

  async function loadPackage(servicePack, formId, packageUrl) {
    const fromMap = packageFromEmbeddedMap(servicePack, formId);

    if (pkgApi.isValidPackage(fromMap)) {
      return fromMap;
    }

    return packageUrl ? await fetchPackage(packageUrl) : null;
  }

  function packageFromEmbeddedMap(servicePack, formId) {
    const node = document.getElementById('webforms-bundled-package-map');

    if (!node || !node.textContent) {
      return null;
    }

    try {
      const map = JSON.parse(node.textContent);
      return map && map[servicePack] && map[servicePack][formId] ? map[servicePack][formId] : null;
    }
    catch (error) {
      console.warn('Webforms bundled package map could not be parsed.', error);
      return null;
    }
  }

  async function fetchPackage(packageUrl) {
    try {
      const response = await fetch(packageUrl, { credentials: 'same-origin' });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    }
    catch (error) {
      console.warn('Webforms bundled design package load failed.', error);
      return null;
    }
  }

  function preservedPackageState(pkg) {
    const preserved = {};
    const meta = preservedMeta(pkg);

    if (Object.keys(meta).length) {
      preserved.meta = meta;
    }

    if (pkg.deploy) {
      preserved.deploy = clonePlainObject(pkg.deploy);
    }

    if (pkg.runtime) {
      preserved.runtime = clonePlainObject(pkg.runtime);
    }

    return preserved;
  }

  function preservedMeta(pkg) {
    const meta = {};
    const source = pkg && pkg.meta ? pkg.meta : {};

    [
      'service_pack',
      'webform',
      'certification',
      'purpose'
    ].forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        meta[key] = clonePlainObject(source[key]);
      }
    });

    return meta;
  }

  function firstWorkflowStepId(pkg) {
    if (!pkg || !pkg.deploy || !pkg.deploy.workflow || !Array.isArray(pkg.deploy.workflow.steps)) {
      return '';
    }

    return pkg.deploy.workflow.steps.length ? (pkg.deploy.workflow.steps[0].id || '') : '';
  }

  function packageSource(pkg) {
    const generatorMode = pkg && pkg.meta && pkg.meta.generator && pkg.meta.generator.mode;

    if (generatorMode === 'addon-bundled') {
      return 'addon-bundled-package';
    }

    return 'package-json';
  }

  function clonePlainObject(value) {
    return JSON.parse(JSON.stringify(value));
  }
}());
