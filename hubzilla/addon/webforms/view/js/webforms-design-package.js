(function () {
    'use strict';

    const ns = window.WebformsDesign = window.WebformsDesign || {};
    const pkgApi = window.WebformsPackage;

    ns.buildPackage = function (draft) {
        return {
            schema: 'hubzilla.webforms.package',
            version: pkgApi.VERSION,
            meta: buildPackageMeta(draft),
            design: buildDesignSection(draft),
            form: pkgApi.buildPortableFormSection(draft),
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

            window.sessionStorage.setItem(pkgApi.packageKeyForForm(pkg.meta.id), payload);
            window.sessionStorage.setItem(pkgApi.activePackageKey(), payload);
        }
        catch (error) {
            console.warn('Webforms package was not persisted to sessionStorage.', error);
        }
    };

    ns.loadPackageDraftForRuntime = function (runtime) {
        const formId = runtime.dataset.webformsDesignForm || 'new-blank-form';
        const pkg = loadPackageForForm(formId);

        if (!pkg) {
            return null;
        }

        try {
            return ns.packageToDraft(pkg, runtime);
        }
        catch (error) {
            console.warn('Webforms package could not be loaded into Design.', error);
            return null;
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
        const formId = pkgApi.packageFormId(pkg) || 'new-blank-form';
        const formTitle = pkgApi.packageFormTitle(pkg) || ns.humanizeSlug(formId);

        return {
            schema: 'hubzilla.webforms.designDraft',
            version: pkgApi.VERSION,
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
                selected_object_id: null,
                source: 'package-json',
                next_object_number: pkgApi.findNextObjectNumber(pkg.design.objects)
            },
            grid: pkg.design.grid || {
                id: 'root-form',
                unit: 'px',
                size: ns.GRID_SIZE,
                columns_observed: 22,
                rows_observed: 17,
                placement_scope: 'immediate-container'
            },
            objects: pkgApi.clonePlainObject(pkg.design.objects),
            notes: [
                'This draft was loaded from package JSON.',
                'No server write, storage, API call, or federation action is performed.'
            ]
        };
    };

    function loadPackageForForm(formId) {
        if (!window.sessionStorage || !formId) {
            return null;
        }

        try {
            const raw = window.sessionStorage.getItem(pkgApi.packageKeyForForm(formId));

            if (!raw) {
                return null;
            }

            const pkg = JSON.parse(raw);

            if (!pkgApi.isValidPackage(pkg)) {
                return null;
            }

            return pkg;
        }
        catch (error) {
            console.warn('Webforms stored package was ignored.', error);
            return null;
        }
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
                version: pkgApi.VERSION
            }
        };
    }

    function buildDesignSection(draft) {
        return {
            schema: 'hubzilla.webforms.design',
            version: pkgApi.VERSION,
            active_tab: draft.design.active_tab,
            selected_object_id: draft.design.selected_object_id,
            grid: pkgApi.clonePlainObject(draft.grid),
            objects: pkgApi.clonePlainObject(draft.objects)
        };
    }

    function buildRuntimeSection() {
        return {
            schema: 'hubzilla.webforms.runtime',
            version: pkgApi.VERSION,
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
})();
