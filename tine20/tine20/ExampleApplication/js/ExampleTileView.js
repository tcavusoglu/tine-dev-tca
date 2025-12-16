/*
 * Tine 2.0
 * 
 * @package     ExampleApplication
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      GitHub Copilot
 * @copyright   Copyright (c) 2025 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */

Ext.namespace('Tine.ExampleApplication');

/**
 * Tile view for Example Records
 * 
 * @namespace   Tine.ExampleApplication
 * @class       Tine.ExampleApplication.ExampleTileView
 * @extends     Ext.DataView
 * 
 * @param       {Object} config
 * @constructor
 */
Tine.ExampleApplication.ExampleTileView = Ext.extend(Ext.DataView, {
    
    /**
     * @cfg {String} itemSelector
     */
    itemSelector: 'div.example-tile-wrap',
    
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
    overClass: 'example-tile-over',
    
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
        this.tpl = this.getTileTemplate();
        
        Tine.ExampleApplication.ExampleTileView.superclass.initComponent.call(this);
        
        // Add click handler for tile selection
        this.on('click', this.onTileClick, this);
    },
    
    /**
     * Get tile template
     * @return {Ext.XTemplate}
     */
    getTileTemplate: function() {
        return new Ext.XTemplate(
            '<div class="example-tiles-container">',
            '<tpl for=".">',
                '<div class="example-tile-wrap" id="example-tile-{id}">',
                    '<div class="example-tile">',
                        '<div class="example-tile-header">',
                            '<h3 class="example-tile-title">{[Ext.util.Format.htmlEncode(values.name)]}</h3>',
                        '</div>',
                        '<div class="example-tile-body">',
                            '<div class="example-tile-field">',
                                '<span class="example-tile-label">Status:</span>',
                                '<span class="example-tile-value">{[this.renderStatus(values.status)]}</span>',
                            '</div>',
                            '<tpl if="values.reason">',
                                '<div class="example-tile-field">',
                                    '<span class="example-tile-label">Reason:</span>',
                                    '<span class="example-tile-value">{[this.renderReason(values.reason)]}</span>',
                                '</div>',
                            '</tpl>',
                            '<tpl if="values.description">',
                                '<div class="example-tile-description">',
                                    '{[Ext.util.Format.ellipsis(Ext.util.Format.htmlEncode(values.description), 100)]}',
                                '</div>',
                            '</tpl>',
                        '</div>',
                        '<div class="example-tile-footer">',
                            '<span class="example-tile-meta">{[this.renderDate(values)]}</span>',
                        '</div>',
                    '</div>',
                '</div>',
            '</tpl>',
            '</div>',
            {
                renderStatus: function(status) {
                    const app = Tine.Tinebase.appMgr.get('ExampleApplication');
                    const renderer = Tine.Tinebase.widgets.keyfield.Renderer.get('ExampleApplication', 'exampleStatus', 'text');
                    if (renderer) {
                        return Ext.util.Format.htmlEncode(renderer(status));
                    }
                    return Ext.util.Format.htmlEncode(status || '');
                },
                renderReason: function(reason) {
                    const renderer = Tine.Tinebase.widgets.keyfield.Renderer.get('ExampleApplication', 'exampleReason', 'text');
                    if (renderer) {
                        return Ext.util.Format.htmlEncode(renderer(reason));
                    }
                    return Ext.util.Format.htmlEncode(reason || '');
                },
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
     * Handle tile click
     * @param {Ext.DataView} view
     * @param {Number} index
     * @param {HTMLElement} node
     * @param {Ext.EventObject} e
     */
    onTileClick: function(view, index, node, e) {
        // The selection is handled automatically by DataView
        // We can add custom behavior here if needed
    },
    
    /**
     * Refresh view
     */
    refresh: function() {
        Tine.ExampleApplication.ExampleTileView.superclass.refresh.call(this);
        
        // Apply any post-render adjustments
        this.applyTileStyles();
    },
    
    /**
     * Apply tile styles after render
     */
    applyTileStyles: function() {
        // Optional: Add any dynamic styling here
    }
});
