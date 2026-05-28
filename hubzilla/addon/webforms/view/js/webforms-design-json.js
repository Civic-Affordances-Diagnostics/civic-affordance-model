(function () {
    'use strict';

    const ns = window.WebformsDesign = window.WebformsDesign || {};

    ns.copyPackageJson = function (draft) {
        const json = packageJson(draft);

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(json).catch(function (error) {
                console.warn('Webforms JSON copy failed.', error);
            });
        }
    };

    ns.downloadPackageJson = function (draft) {
        const json = packageJson(draft);
        const blob = new Blob([json + '\n'], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = fileNameForDraft(draft);
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    };

    ns.importPackageJson = function (runtime, onImported) {
        const input = document.createElement('input');

        input.type = 'file';
        input.accept = 'application/json,.json';
        input.style.display = 'none';

        input.addEventListener('change', function () {
            const file = input.files && input.files[0];

            input.remove();

            if (!file) {
                return;
            }

            readPackageFile(file, runtime, onImported);
        });

        document.body.appendChild(input);
        input.click();
    };

    ns.clearPackageJson = function (draft, runtime) {
        const nextDraft = ns.resetDraft(runtime);

        window.webformsDesignDraft = nextDraft;

        ns.renderGrid(nextDraft);
        ns.renderSelectionPanel(nextDraft, null);
        ns.renderJson(nextDraft);

        return nextDraft;
    };

    function readPackageFile(file, runtime, onImported) {
        const reader = new FileReader();

        reader.addEventListener('load', function () {
            try {
                const pkg = JSON.parse(String(reader.result || ''));
                const draft = ns.packageToDraft(pkg, runtime);

                window.webformsDesignDraft = draft;

                ns.persistDraft(draft);
                ns.persistPackage(ns.buildPackage(draft));
                ns.renderGrid(draft);
                ns.renderSelectionPanel(draft, draft.design.selected_object_id);
                ns.renderJson(draft);

                if (typeof onImported === 'function') {
                    onImported(draft);
                }
            }
            catch (error) {
                window.alert('Unable to load Webforms package JSON: ' + error.message);
            }
        });

        reader.readAsText(file);
    }

    function packageJson(draft) {
        const pkg = ns.buildPackage(draft);

        ns.persistDraft(draft);
        ns.persistPackage(pkg);

        return JSON.stringify(pkg, null, 2);
    }

    function fileNameForDraft(draft) {
        return safeFileName(draft.form.id || 'webforms-package') + '.json';
    }

    function safeFileName(value) {
        const cleaned = String(value).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');

        return cleaned || 'webforms-package';
    }
})();
