(function () {
    'use strict';

    const api = window.WebformsPackage = window.WebformsPackage || {};

    api.VERSION = '0.1';
    api.DEFAULT_GRID_SIZE = 24;

    api.packageKeyForForm = function (formId) {
        return 'hubzilla.webforms.package.' + api.VERSION + '.' + formId;
    };

    api.activePackageKey = function () {
        return 'hubzilla.webforms.activePackage.' + api.VERSION;
    };

    api.isValidPackage = function (pkg) {
        return pkg &&
            pkg.schema === 'hubzilla.webforms.package' &&
            pkg.version === api.VERSION &&
            pkg.form &&
            Array.isArray(pkg.form.fields) &&
            Array.isArray(pkg.form.layout);
    };

    api.packageFormId = function (pkg) {
        if (pkg.meta && pkg.meta.id) {
            return pkg.meta.id;
        }

        if (pkg.form && pkg.form.id) {
            return pkg.form.id;
        }

        return '';
    };

    api.packageFormTitle = function (pkg) {
        if (pkg.meta && pkg.meta.title) {
            return pkg.meta.title;
        }

        if (pkg.form && pkg.form.title) {
            return pkg.form.title;
        }

        return '';
    };

    api.buildPortableFormSection = function (draft) {
        return {
            schema: 'hubzilla.webforms.form',
            version: api.VERSION,
            id: draft.form.id,
            title: draft.form.title,
            fields: draft.objects
                .filter(api.isPortableField)
                .map(api.buildPortableField),
            layout: draft.objects.map(api.buildPortableLayoutItem)
        };
    };

    api.isPortableField = function (object) {
        return ![
            'container',
            'label',
            'result_panel',
            'help_text'
        ].includes(object.type);
    };

    api.buildPortableField = function (object) {
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
            field.options = api.clonePlainObject(object.options || []);
        }

        if (object.type === 'button') {
            field.action = 'none';
        }

        return field;
    };

    api.buildPortableLayoutItem = function (object) {
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

        if (object.type === 'label') {
            item.label = object.label || object.id;
        }

        if (object.type === 'container') {
            item.label = object.label || object.id;
        }

        return item;
    };

    api.packageGridSize = function (pkg) {
        if (pkg.design && pkg.design.grid && pkg.design.grid.size) {
            return parseInt(pkg.design.grid.size, 10) || api.DEFAULT_GRID_SIZE;
        }

        return api.DEFAULT_GRID_SIZE;
    };

    api.layoutBounds = function (layout, gridSize) {
        const extents = layout.reduce(function (bounds, item) {
            const right = (parseInt(item.x, 10) || 0) + (parseInt(item.width, 10) || 1);
            const bottom = (parseInt(item.y, 10) || 0) + (parseInt(item.height, 10) || 1);

            return {
                columns: Math.max(bounds.columns, right),
                rows: Math.max(bounds.rows, bottom)
            };
        }, { columns: 22, rows: 17 });

        return {
            width: extents.columns * gridSize,
            height: extents.rows * gridSize
        };
    };

    api.fieldsMap = function (fields) {
        return fields.reduce(function (map, field) {
            map[field.id] = field;
            return map;
        }, {});
    };

    api.findNextObjectNumber = function (objects) {
        return objects.reduce(function (highest, object) {
            const match = object.id.match(/-(\d+)$/);

            if (!match) {
                return highest;
            }

            return Math.max(highest, parseInt(match[1], 10) + 1);
        }, 1);
    };

    api.clonePlainObject = function (value) {
        return JSON.parse(JSON.stringify(value));
    };
})();
