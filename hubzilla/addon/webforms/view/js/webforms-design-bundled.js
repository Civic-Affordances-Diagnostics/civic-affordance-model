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
    const packageUrl = runtime.dataset.webformsPackageUrl || '';
    const formId = runtime.dataset.webformsDesignForm || '';

    if ((!packageUrl && !formId) || !shouldLoadBundledPackage(draft)) {
      return draft;
    }

    const nextDraft = await ns.loadBundledPackageFromUrl(runtime, packageUrl, formId);

    return nextDraft || draft;
  };

  ns.loadBundledPackageFromUrl = async function (runtime, packageUrl, formId) {
    if (!packageUrl) {
      return null;
    }

    if (formId) {
      runtime.dataset.webformsDesignForm = formId;
    }

    runtime.dataset.webformsPackageUrl = packageUrl;

    const pkg = loadEmbeddedPackage(formId || '') || await fetchPackage(packageUrl);

    if (!pkgApi.isValidPackage(pkg) || !pkg.design || !Array.isArray(pkg.design.objects)) {
      return null;
    }

    const nextDraft = ns.packageToDraft(pkg, runtime);

    window.webformsDesignDraft = nextDraft;
    ns.persistDraft(nextDraft);
    ns.persistPackage(ns.buildPackage(nextDraft));

    return nextDraft;
  };

  function shouldLoadBundledPackage(draft) {
    if (!draft || !Array.isArray(draft.objects)) {
      return true;
    }

    if (draft.objects.length > 0) {
      return false;
    }

    const source = draft.design && draft.design.source ? draft.design.source : '';

    return source === '' || source === 'browser' || source === 'package-json';
  }


  function loadEmbeddedPackage(formId) {
    if (!formId) {
      return null;
    }

    const script = document.getElementById('webforms-bundled-package-map');

    if (!script) {
      return null;
    }

    try {
      const map = JSON.parse(script.textContent || '{}');
      const servicePacks = Object.keys(map);

      for (let i = 0; i < servicePacks.length; i++) {
        const servicePack = servicePacks[i];

        if (map[servicePack] && map[servicePack][formId]) {
          return map[servicePack][formId];
        }
      }
    }
    catch (error) {
      console.warn('Webforms embedded design package map could not be parsed.', error);
    }

    return null;
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
