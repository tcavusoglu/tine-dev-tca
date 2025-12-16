/*
 * Tine 2.0
 * 
 * @package     ExampleApplication
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Alexander Stintzing <a.stintzing@metaways.de>
 * @copyright   Copyright (c) 2012 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */
 
Ext.namespace('Tine.ExampleApplication');

/**
 * Example grid panel
 * 
 * @namespace   Tine.ExampleApplication
 * @class       Tine.ExampleApplication.ExampleGridPanel
 * @extends     Tine.widgets.grid.GridPanel
 * 
 * <p>Example Grid Panel</p>
 * <p><pre>
 * </pre></p>
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Alexander Stintzing <a.stintzing@metaways.de>
 * 
 * @param       {Object} config
 * @constructor
 * Create a new Tine.ExampleApplication.ExampleGridPanel
 */
Tine.ExampleApplication.ExampleGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
    
    /**
     * @property {Boolean} useTileView
     * Track if tile view is active
     */
    useTileView: false,
    
    /**
     * @property {Tine.ExampleApplication.ExampleTileView} tileView
     * Reference to tile view
     */
    tileView: null,
    
    initComponent: function() {
        this.initDetailsPanel();
        this.initTileView();
        
        Tine.ExampleApplication.ExampleGridPanel.superclass.initComponent.call(this);
        
        // Listen for layout changes
        if (this.grid && this.grid.getView()) {
            const originalSetResponsiveMode = this.grid.getView().setResponsiveMode;
            const self = this;
            this.grid.getView().setResponsiveMode = function(mode) {
                originalSetResponsiveMode.call(this, mode);
                self.onLayoutChange(mode);
            };
        }
    },
    
    /**
     * @private
     */
    initDetailsPanel: function() {
        this.detailsPanel = new Tine.ExampleApplication.ExampleDetailsPanel({
            grid : this,
            app: this.app
        });
    },
    
    /**
     * Initialize tile view
     * @private
     */
    initTileView: function() {
        this.tileView = new Tine.ExampleApplication.ExampleTileView({
            store: this.store,
            hidden: true
        });
        
        // Sync selection between grid and tile view
        this.tileView.on('selectionchange', function(view, selections) {
            if (this.useTileView && this.detailsPanel) {
                if (selections.length === 1) {
                    const record = this.store.getById(selections[0].id);
                    this.detailsPanel.updateDetails(record);
                } else if (selections.length > 1) {
                    this.detailsPanel.showMulti(this.grid.getSelectionModel());
                } else {
                    this.detailsPanel.showDefault();
                }
            }
        }, this);
    },
    
    /**
     * Called after grid render
     */
    afterRender: function() {
        Tine.ExampleApplication.ExampleGridPanel.superclass.afterRender.call(this);
        
        // Add tile view to the center panel
        if (this.centerPanel && this.tileView) {
            this.centerPanel.add(this.tileView);
            this.centerPanel.doLayout();
        }
    },
    
    /**
     * Handle layout change
     * @param {String} mode
     */
    onLayoutChange: function(mode) {
        if (mode === 'tiles') {
            this.switchToTileView();
        } else if (this.useTileView) {
            this.switchToGridView();
        }
    },
    
    /**
     * Switch to tile view
     */
    switchToTileView: function() {
        if (this.useTileView) return;
        
        this.useTileView = true;
        
        if (this.grid) {
            this.grid.hide();
        }
        
        if (this.tileView) {
            this.tileView.show();
            this.tileView.refresh();
        }
        
        if (this.centerPanel) {
            this.centerPanel.doLayout();
        }
    },
    
    /**
     * Switch to grid view
     */
    switchToGridView: function() {
        if (!this.useTileView) return;
        
        this.useTileView = false;
        
        if (this.tileView) {
            this.tileView.hide();
        }
        
        if (this.grid) {
            this.grid.show();
        }
        
        if (this.centerPanel) {
            this.centerPanel.doLayout();
        }
    }
});
