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

    function packageJson(draft) {
        ns.persistDraft(draft);
        return JSON.stringify(ns.buildPackage(draft), null, 2);
    }

    function fileNameForDraft(draft) {
        return safeFileName(draft.form.id || 'webforms-package') + '.json';
    }

    function safeFileName(value) {
        const cleaned = String(value).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');

        return cleaned || 'webforms-package';
    }
})();
