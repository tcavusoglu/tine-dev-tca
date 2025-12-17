/*
 * Tine 2.0
 *
 * @package     Tasks
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      GitHub Copilot
 * @copyright   Copyright (c) 2025 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */

Ext.namespace('Tine.Tasks');

/**
 * MultiColumn view for Tasks
 *
 * @namespace   Tine.Tasks
 * @class       Tine.Tasks.TaskMultiColumnView
 * @extends     Ext.DataView
 *
 * @param       {Object} config
 * @constructor
 */
Tine.Tasks.TaskMultiColumnView = Ext.extend(Ext.DataView, {

    /**
     * @cfg {String} itemSelector
     */
    itemSelector: 'div.task-multicolumn-wrap',

    /**
     * @cfg {Boolean} multiSelect
     */
    multiSelect: true,

    /**
     * @cfg {Boolean} simpleSelect
     */
    simpleSelect: true,

    /**
     * @cfg {String} overClass
     */
    overClass: 'task-multicolumn-over',

    /**
     * @cfg {Boolean} autoHeight
     */
    autoHeight: false,

    /**
     * @cfg {String} emptyText
     */
    emptyText: '',

    /**
     * Initialize component
     */
    initComponent: function() {
        this.tpl = this.getMultiColumnTemplate();

        Tine.Tasks.TaskMultiColumnView.superclass.initComponent.call(this);

        // Add click handler for item selection
        this.on('click', this.onItemClick, this);
    },

    /**
     * Get multiColumn template
     * @return {Ext.XTemplate}
     */
    getMultiColumnTemplate: function() {
        return new Ext.XTemplate(
            '<div class="task-multicolumns-container">',
            '<tpl for=".">',
                '<div class="task-multicolumn-wrap" id="task-multicolumn-{id}">',
                    '<div class="task-multicolumn">',
                        '<div class="task-multicolumn-header">',
                            '<h3 class="task-multicolumn-summary">{[Ext.util.Format.htmlEncode(values.summary)]}</h3>',
                        '</div>',
                        '<div class="task-multicolumn-body">',
                            '<h3>INSERT source HERE</h3>',
                            '<h3>INSERT description HERE</h3>',
                            '<h3>INSERT due HERE</h3>',
                            '<h3>INSERT estimated_duration HERE</h3>',
                            '<h3>INSERT priority HERE</h3>',
                            '<h3>INSERT dependens_on HERE</h3>',
                            '<h3>INSERT dependent_taks HERE</h3>',
                            '<h3>INSERT percent HERE</h3>',
                            '<h3>INSERT status HERE</h3>',
                            '<h3>INSERT organizer HERE</h3>',
                            '<h3>INSERT completed HERE</h3>',
                        '</div>',
                        '<div class="task-multicolumn-footer">',
                            '<span class="task-multicolumn-meta">{[this.renderDate(values)]}</span>',
                        '</div>',
                    '</div>',
                '</div>',
            '</tpl>',
            '</div>',
            {
                renderDate: function(values) {
                    if (values.last_modified_time) {
                        return 'Modified: ' + Tine.Tinebase.common.dateTimeRenderer(values.last_modified_time);
                    } else if (values.creation_time) {
                        return 'Created: ' + Tine.Tinebase.common.dateTimeRenderer(values.creation_time);
                    }
                    return '';
                }
            }
        );
    },

    /**
     * Handle item click
     * @param {Ext.DataView} view
     * @param {Number} index
     * @param {HTMLElement} node
     * @param {Ext.EventObject} e
     */
    onItemClick: function(view, index, node, e) {
        // The selection is handled automatically by DataView
        // We can add custom behavior here if needed
    },

    /**
     * Refresh view
     */
    refresh: function() {
        Tine.Tasks.TaskMultiColumnView.superclass.refresh.call(this);

        // Apply any post-render adjustments
        this.applyMultiColumnStyles();
    },

    /**
     * Apply item styles after render
     */
    applyMultiColumnStyles: function() {
        // Optional: Add any dynamic styling here
    }
});