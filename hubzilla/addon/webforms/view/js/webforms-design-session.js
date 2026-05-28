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
            const payload = JSON.stringify(draft);

            window.sessionStorage.setItem(storageKeyForForm(draft.form.id), payload);
            window.sessionStorage.setItem(activeDraftKey(), payload);
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
            window.sessionStorage.removeItem(activeDraftKey());
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
        const activeDraft = loadStoredDraft(activeDraftKey());

        if (isValidSessionDraft(activeDraft, formId)) {
            return activeDraft;
        }

        return loadStoredDraft(storageKeyForForm(formId));
    }

    function loadStoredDraft(key) {
        try {
            const raw = window.sessionStorage.getItem(key);

            if (!raw) {
                return null;
            }

            return JSON.parse(raw);
        }
        catch (error) {
            console.warn('Webforms session draft was ignored.', error);
            return null;
        }
    }

    function storageKeyForForm(formId) {
        return 'hubzilla.webforms.designDraft.' + ns.VERSION + '.' + formId;
    }

    function activeDraftKey() {
        return 'hubzilla.webforms.activeDesignDraft.' + ns.VERSION;
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
