(function () {
    'use strict';

    const ns = window.WebformsDesign = window.WebformsDesign || {};

    ns.loadDraft = function (runtime) {
        const draft = loadSessionDraft(runtime) || ns.buildDraft(runtime);

        updateRuntimeState(draft, runtime);
        ensureDraftCounters(draft);

        return draft;
    };

    ns.resetDraft = function (runtime) {
        const draft = ns.buildDraft(runtime);

        ns.clearSessionDraft(draft.form.id);
        ns.persistDraft(draft);

        return draft;
    };

    ns.persistDraft = function (draft) {
        if (!window.sessionStorage) {
            return;
        }

        try {
            window.sessionStorage.setItem(storageKeyForForm(draft.form.id), JSON.stringify(draft));
        }
        catch (error) {
            console.warn('Webforms draft was not persisted to sessionStorage.', error);
        }
    };

    ns.clearSessionDraft = function (formId) {
        if (!window.sessionStorage) {
            return;
        }

        try {
            window.sessionStorage.removeItem(storageKeyForForm(formId));
        }
        catch (error) {
            console.warn('Webforms session draft was not cleared.', error);
        }
    };

    function loadSessionDraft(runtime) {
        if (!window.sessionStorage) {
            return null;
        }

        const formId = runtimeFormId(runtime);

        try {
            const raw = window.sessionStorage.getItem(storageKeyForForm(formId));

            if (!raw) {
                return null;
            }

            const draft = JSON.parse(raw);

            if (!isValidSessionDraft(draft, formId)) {
                return null;
            }

            return draft;
        }
        catch (error) {
            console.warn('Webforms session draft was ignored.', error);
            return null;
        }
    }

    function storageKeyForForm(formId) {
        return 'hubzilla.webforms.designDraft.' + ns.VERSION + '.' + formId;
    }

    function runtimeFormId(runtime) {
        return runtime.dataset.webformsDesignForm || 'new-blank-form';
    }

    function isValidSessionDraft(draft, formId) {
        return draft &&
            draft.schema === 'hubzilla.webforms.designDraft' &&
            draft.version === ns.VERSION &&
            draft.form &&
            draft.form.id === formId &&
            Array.isArray(draft.objects);
    }

    function updateRuntimeState(draft, runtime) {
        const access = runtime.dataset.webformsAccess || 'public';

        draft.access = {
            mode: access,
            public_local_only: access === 'public'
        };

        draft.design.active_tab = runtime.dataset.webformsDesignTab || 'grid';
    }

    function ensureDraftCounters(draft) {
        if (!draft.design.next_object_number) {
            draft.design.next_object_number = findNextObjectNumber(draft);
        }
    }

    function findNextObjectNumber(draft) {
        return draft.objects.reduce(function (highest, object) {
            const match = object.id.match(/-(\d+)$/);

            if (!match) {
                return highest;
            }

            return Math.max(highest, parseInt(match[1], 10) + 1);
        }, 1);
    }
})();
