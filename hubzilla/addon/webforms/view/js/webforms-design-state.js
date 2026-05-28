(function () {
    'use strict';

    const ns = window.WebformsDesign = window.WebformsDesign || {};

    ns.GRID_SIZE = 24;

    ns.humanizeSlug = function (value) {
        return value.split('-').filter(Boolean).map(function (part) {
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join(' ');
    };

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

    ns.buildDraft = function (runtime) {
        const designForm = runtime.dataset.webformsDesignForm || '';
        const designTab = runtime.dataset.webformsDesignTab || 'grid';
        const access = runtime.dataset.webformsAccess || 'public';

        return {
            schema: 'hubzilla.webforms.designDraft',
            version: '0.1',
            status: 'browser-local',
            access: {
                mode: access,
                public_local_only: access === 'public'
            },
            form: {
                id: designForm || 'new-blank-form',
                title: designForm ? ns.humanizeSlug(designForm) : 'New blank form'
            },
            design: {
                active_tab: designTab,
                selected_object_id: null,
                source: 'browser',
                next_object_number: 2
            },
            grid: {
                id: 'root-form',
                unit: 'px',
                size: ns.GRID_SIZE,
                columns_observed: 22,
                rows_observed: 17,
                placement_scope: 'immediate-container'
            },
            objects: [
                {
                    id: 'field-1',
                    type: 'text',
                    parent: 'root-form',
                    label: 'Sample field',
                    placeholder: 'browser-local preview',
                    default: '',
                    placement: {
                        x: 3,
                        y: 3,
                        width: 9,
                        height: 3,
                        unit: 'grid'
                    },
                    validation: {
                        required: false
                    }
                }
            ],
            notes: [
                'This draft exists in browser memory only.',
                'No server write, storage, API call, or federation action is performed.'
            ]
        };
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
        return 'hubzilla.webforms.designDraft.0.1.' + formId;
    }

    function runtimeFormId(runtime) {
        return runtime.dataset.webformsDesignForm || 'new-blank-form';
    }

    function isValidSessionDraft(draft, formId) {
        return draft &&
            draft.schema === 'hubzilla.webforms.designDraft' &&
            draft.version === '0.1' &&
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
            const match = object.id.match(/-(\\d+)$/);

            if (!match) {
                return highest;
            }

            return Math.max(highest, parseInt(match[1], 10) + 1);
        }, 1);
    }

    ns.buildPackage = function (draft) {
        return {
            schema: 'hubzilla.webforms.package',
            version: '0.1',
            meta: buildPackageMeta(draft),
            design: buildDesignSection(draft),
            form: buildPortableFormSection(draft),
            runtime: buildRuntimeSection(draft)
        };
    };

    function buildPackageMeta(draft) {
        return {
            id: draft.form.id,
            title: draft.form.title,
            status: draft.status,
            access: draft.access,
            generator: {
                name: 'Hubzilla Webforms',
                mode: 'browser-local',
                version: '0.1'
            }
        };
    }

    function buildDesignSection(draft) {
        return {
            schema: 'hubzilla.webforms.design',
            version: '0.1',
            active_tab: draft.design.active_tab,
            selected_object_id: draft.design.selected_object_id,
            grid: clonePlainObject(draft.grid),
            objects: clonePlainObject(draft.objects)
        };
    }

    function buildPortableFormSection(draft) {
        return {
            schema: 'hubzilla.webforms.form',
            version: '0.1',
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
            version: '0.1',
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
        return object.type !== 'container';
    }

    function buildPortableField(object) {
        return {
            id: object.id,
            type: object.type,
            label: object.label || object.id,
            placeholder: object.placeholder || '',
            default: object.default || '',
            required: Boolean(object.validation && object.validation.required)
        };
    }

    function buildPortableLayoutItem(object) {
        return {
            id: object.id,
            type: object.type,
            parent: object.parent,
            x: object.placement.x,
            y: object.placement.y,
            width: object.placement.width,
            height: object.placement.height,
            unit: object.placement.unit
        };
    }

    function clonePlainObject(value) {
        return JSON.parse(JSON.stringify(value));
    }

    ns.nextObjectNumber = function (draft) {
        const number = draft.design.next_object_number || 1;
        draft.design.next_object_number = number + 1;

        return number;
    };

    ns.createContainerObject = function (draft) {
        const number = ns.nextObjectNumber(draft);

        return {
            id: 'box-' + number,
            type: 'container',
            parent: 'root-form',
            label: 'Box ' + number,
            placeholder: '',
            default: '',
            placement: {
                x: 2 + number,
                y: 2 + number,
                width: 10,
                height: 5,
                unit: 'grid'
            },
            validation: {
                required: false
            }
        };
    };

    ns.createTextFieldObject = function (draft) {
        const number = ns.nextObjectNumber(draft);

        return {
            id: 'field-' + number,
            type: 'text',
            parent: 'root-form',
            label: 'Field ' + number,
            placeholder: '',
            default: '',
            placement: {
                x: 3 + number,
                y: 3 + number,
                width: 9,
                height: 3,
                unit: 'grid'
            },
            validation: {
                required: false
            }
        };
    };

    ns.findObject = function (draft, objectId) {
        return draft.objects.find(function (object) {
            return object.id === objectId;
        });
    };

    ns.setObjectProperty = function (object, property, value) {
        if (property.indexOf('placement.') === 0) {
            const key = property.split('.')[1];
            object.placement[key] = parseInt(value, 10);
            return;
        }

        if (property === 'validation.required') {
            object.validation.required = Boolean(value);
            return;
        }

        object[property] = value;
    };

    ns.addObject = function (draft, object) {
        draft.objects.push(object);
        draft.design.selected_object_id = object.id;

        ns.renderGrid(draft);
        ns.renderSelectionPanel(draft, object.id);
        ns.renderJson(draft);
    };

    ns.deleteSelectedObject = function (draft) {
        const selectedId = draft.design.selected_object_id;

        if (!selectedId) {
            return;
        }

        draft.objects = draft.objects.filter(function (object) {
            return object.id !== selectedId;
        });

        draft.design.selected_object_id = null;

        ns.renderGrid(draft);
        ns.renderSelectionPanel(draft, null);
        ns.renderJson(draft);
    };

    ns.selectObject = function (draft, objectId) {
        if (!draft) {
            return;
        }

        draft.design.selected_object_id = objectId;

        ns.updateGridSelection(objectId);
        ns.renderSelectionPanel(draft, objectId);
        ns.renderJson(draft);
    };

    ns.renderJson = function (draft) {
        const output = document.getElementById('webforms-json-output');

        ns.persistDraft(draft);

        if (!output) {
            return;
        }

        output.value = JSON.stringify(ns.buildPackage(draft), null, 2);
    };

    ns.cssEscape = function (value) {
        if (window.CSS && typeof window.CSS.escape === 'function') {
            return window.CSS.escape(value);
        }

        return String(value).replace(/"/g, '\\"');
    };

    ns.escapeHtml = function (value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
})();
