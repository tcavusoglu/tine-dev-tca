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

    initComponent: function() {

        Tine.log.debug('== Tine.ExampleApplication.ExampleGridPanel.initComponent()');

        if (this.gridConfig.view) {
            Tine.log.debug('== setting gridConfig.view.enableMultiColumnLayout SUCCESS');
            this.gridConfig.view.enableMultiColumnLayout = true;
        } else {
            Tine.log.debug('== setting gridConfig.view.enableMultiColumnLayout FAILED');
        }

        this.initDetailsPanel();

        Tine.ExampleApplication.ExampleGridPanel.superclass.initComponent.call(this);

        // Listen for layout changes
        if (this.grid && this.grid.getView()) {
            Tine.log.debug('== ExampleGridPanel: layout change listener attached');
            const originalSetResponsiveMode = this.grid.getView().setResponsiveMode;
            const self = this;
            this.grid.getView().setResponsiveMode = function(mode) {
                Tine.log.debug('== ExampleGridPanel: setResponsiveMode called: ' + mode);
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
     * Called after grid render
     */
    afterRender: function() {
        Tine.ExampleApplication.ExampleGridPanel.superclass.afterRender.call(this);

        Tine.log.debug('== Tine.ExampleApplication.ExampleGridPanel.afterRender()');
        Tine.log.debug('== this.centerPanel');
        Tine.log.debug(this.centerPanel);
        Tine.log.debug('== this.tileView');
        Tine.log.debug(this.tileView);

        // Add multiColumn view to the center panel
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
        if (mode === 'multiColumn') {
            Tine.log.debug('== layout change: multiColumn !!!');
        } else {
            Tine.log.debug('== layout change: not multiColumn: ' + mode);
        }
    },
});
