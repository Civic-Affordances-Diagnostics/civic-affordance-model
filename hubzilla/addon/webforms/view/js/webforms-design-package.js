(function () {
    'use strict';

    const ns = window.WebformsDesign = window.WebformsDesign || {};

    ns.buildPackage = function (draft) {
        return {
            schema: 'hubzilla.webforms.package',
            version: ns.VERSION,
            meta: buildPackageMeta(draft),
            design: buildDesignSection(draft),
            form: buildPortableFormSection(draft),
            runtime: buildRuntimeSection()
        };
    };

    ns.renderJson = function (draft) {
        const output = document.getElementById('webforms-json-output');

        ns.persistDraft(draft);

        if (!output) {
            return;
        }

        output.value = JSON.stringify(ns.buildPackage(draft), null, 2);
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
                version: ns.VERSION
            }
        };
    }

    function buildDesignSection(draft) {
        return {
            schema: 'hubzilla.webforms.design',
            version: ns.VERSION,
            active_tab: draft.design.active_tab,
            selected_object_id: draft.design.selected_object_id,
            grid: clonePlainObject(draft.grid),
            objects: clonePlainObject(draft.objects)
        };
    }

    function buildPortableFormSection(draft) {
        return {
            schema: 'hubzilla.webforms.form',
            version: ns.VERSION,
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
            version: ns.VERSION,
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

        if (object.type === 'result_panel' || object.type === 'help_text') {
            item.label = object.label || object.id;
            item.text = object.default || '';
        }

        return item;
    }

    function clonePlainObject(value) {
        return JSON.parse(JSON.stringify(value));
    }
})();
