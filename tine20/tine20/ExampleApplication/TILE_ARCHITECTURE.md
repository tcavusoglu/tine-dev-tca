# Tile Layout Technical Architecture

## Component Hierarchy

```
Tine.ExampleApplication.ExampleGridPanel
├── Grid View (Ext.grid.GridPanel)
│   ├── Standard table/grid rendering
│   └── Column-based layout
│
├── Tile View (Tine.ExampleApplication.ExampleTileView)
│   ├── Ext.DataView base
│   ├── XTemplate for rendering
│   └── CSS Grid layout
│
└── Details Panel (Tine.ExampleApplication.ExampleDetailsPanel)
    └── Shows selected record details
```

## Layout Selection Flow

```
User clicks Layout Menu
       ↓
GridPanel.js detects layout change
       ↓
grid.getView().setResponsiveMode(mode)
       ↓
onLayoutChange(mode) called
       ↓
┌──────────────┴──────────────┐
│                              │
mode === 'tiles'          mode !== 'tiles'
       ↓                        ↓
switchToTileView()        switchToGridView()
       ↓                        ↓
Hide Grid                 Hide Tile View
Show Tile View            Show Grid
Refresh Tile View         Refresh Grid
```

## Responsive Layout Breakpoints

```
Width (px)    Layout Name    Display
─────────────────────────────────────
0-400         oneColumn      1 column
400-600       small          2-3 columns
600-1000      medium         3-4 columns
1000-1800     big            4-5 columns
1800-2200     big            5+ columns
2200+         tiles          Card grid (NEW)
2200+         large          Maximum columns
```

## Tile Rendering Pipeline

```
1. Store Data
   ↓
2. XTemplate Processing
   ├── Iterate over records
   ├── Apply field renderers
   │   ├── Status (keyfield renderer)
   │   ├── Reason (keyfield renderer)
   │   └── Date (datetime renderer)
   └── Generate HTML
   ↓
3. CSS Grid Layout
   ├── Calculate columns (auto-fill)
   ├── Apply gap spacing
   └── Position tiles
   ↓
4. Event Handlers
   ├── Click → Selection
   ├── Hover → Visual feedback
   └── Selection → Details panel update
```

## CSS Grid Behavior

```css
/* Desktop: Multiple columns */
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));

Example with 1200px container:
[Tile] [Tile] [Tile] [Tile]  (4 tiles × 280px = 1120px + gaps)

/* Tablet: Adjusted sizing */
grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));

/* Mobile: Single column */
grid-template-columns: 1fr;
```

## Selection Synchronization

```
Grid Selection ←→ Tile View Selection
        ↓
    Details Panel
        ↓
  Display Record Info
```

When user selects:
- Single tile → Details panel shows single record
- Multiple tiles → Details panel shows count
- No selection → Details panel shows default view

## File Dependencies

```
ExampleApplication/
│
├── Model/
│   └── ExampleRecord.php
│       └── Defines fields with responsiveLevel: 'tiles'
│
├── js/
│   ├── ExampleGridPanel.js
│   │   └── Manages view switching
│   │
│   └── ExampleTileView.js
│       ├── Extends Ext.DataView
│       ├── Defines tile template
│       └── Handles tile interactions
│
└── css/
    └── ExampleApplication.css
        └── Tile-specific styles
            ├── .example-tiles-container
            ├── .example-tile
            ├── .example-tile-header
            ├── .example-tile-body
            └── .example-tile-footer
```

## Data Flow

```
Backend (PHP)
    ↓
JSON Response
    ↓
Ext.data.Store
    ↓
    ├→ Grid View → Columns → Cells
    │
    └→ Tile View → Template → Cards
         ↓
    User Interaction
         ↓
    Selection Change
         ↓
    Details Panel Update
```

## Key Features Implementation

### 1. View Switching
```javascript
// ExampleGridPanel.js
onLayoutChange(mode) {
    if (mode === 'tiles') {
        this.switchToTileView();
    } else {
        this.switchToGridView();
    }
}
```

### 2. Tile Template
```javascript
// ExampleTileView.js
getTileTemplate() {
    return new Ext.XTemplate(
        '<div class="example-tiles-container">',
        '<tpl for=".">',
            '<div class="example-tile-wrap">',
                // Tile content
            '</div>',
        '</tpl>',
        '</div>'
    );
}
```

### 3. Responsive CSS
```css
/* ExampleApplication.css */
.example-tiles-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
}
```

### 4. Layout Registration
```javascript
// responsiveLayout.js
const defaultConfigs = [
    {level: 4, name: 'tiles', width: 2200},
];
```

## Performance Considerations

- **Virtual scrolling**: Not implemented (DataView renders all)
- **DOM nodes**: ~10-15 nodes per tile
- **Recommended**: <500 records for smooth experience
- **Optimization**: Consider pagination for large datasets

## Browser Rendering

```
HTML Structure:
<div class="example-tiles-container">      ← CSS Grid container
    <div class="example-tile-wrap">        ← Tile wrapper
        <div class="example-tile">         ← Tile card
            <div class="example-tile-header">
            <div class="example-tile-body">
            <div class="example-tile-footer">
        </div>
    </div>
</div>

CSS Rendering:
Grid Container → Calculate columns → Position items
    ↓
Tile Cards → Apply shadows/borders → Handle hover/select
```
