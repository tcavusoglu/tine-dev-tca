# Tile Layout for ExampleApplication

## Overview
The ExampleApplication now includes a new "Tiles" layout option that displays records as visual cards in a responsive grid layout.

## Features

### Visual Design
- **Card-based tiles**: Each record is displayed as a card with rounded corners and shadow effects
- **Hover effects**: Tiles lift slightly and show enhanced shadows on hover
- **Selection states**: Selected tiles have a blue highlight with enhanced visual feedback
- **Responsive grid**: Tiles automatically adjust to fit the available width

### Display Information
Each tile shows:
- **Title**: Record name prominently displayed
- **Status**: Current status with proper rendering
- **Reason**: Displayed when available
- **Description**: Truncated to 100 characters with ellipsis
- **Metadata**: Last modified or creation date in the footer

### Responsive Breakpoints
- **Desktop (>2200px)**: Multiple tiles per row (minimum 280px per tile)
- **Medium screens (900-1400px)**: Adjusted tile sizing (250px minimum)
- **Small screens (600-900px)**: Compact tiles (220px minimum)
- **Mobile (<600px)**: Single column layout

## How to Use

### Accessing Tile Layout
1. Navigate to the ExampleApplication module
2. Open the record list view
3. Click on the layout switcher icon in the toolbar (columns icon)
4. Select "Tiles" from the dropdown menu

### Layout Options Available
- **Auto**: Automatically selects layout based on window width
- **One column**: Single column view
- **Big**: Standard multi-column grid (default)
- **Tiles**: Card-based tile view (NEW)
- **Large**: Maximum columns view

### Switching Views
The tile view integrates seamlessly with the existing grid functionality:
- **Selection**: Click tiles to select them (multi-select with Ctrl/Cmd)
- **Details panel**: Selected tile details appear in the details panel
- **Switching back**: Select any other layout option to return to grid view

## Technical Implementation

### Files Modified
- `Tinebase/js/util/responsiveLayout.js`: Added 'tiles' layout level (2200px breakpoint)
- `ExampleApplication/js/ExampleGridPanel.js`: Added view switching logic
- `ExampleApplication/js/ExampleTileView.js`: New DataView component (NEW FILE)
- `ExampleApplication/css/ExampleApplication.css`: Added tile styling
- `ExampleApplication/Model/ExampleRecord.php`: Added responsiveLevel configuration
- `ExampleApplication/ExampleApplication.jsb2`: Registered new TileView file

### Architecture
The implementation uses:
- **Ext.DataView**: Base component for rendering tiles
- **XTemplate**: Template system for tile HTML generation
- **CSS Grid**: Modern responsive layout
- **Event synchronization**: Keeps grid and tile selections in sync

## Customization

### Modifying Tile Appearance
Edit `ExampleApplication/css/ExampleApplication.css`:
- `.example-tile`: Main tile container
- `.example-tile-header`: Title section
- `.example-tile-body`: Content area
- `.example-tile-footer`: Metadata section

### Changing Tile Content
Edit `ExampleApplication/js/ExampleTileView.js`:
- `getTileTemplate()`: Modify the XTemplate to change displayed fields
- Template helper functions: Add custom renderers for fields

### Adjusting Breakpoints
Edit `Tinebase/js/util/responsiveLayout.js`:
- Change the width value for 'tiles' level (currently 2200px)
- Modify CSS media queries in `ExampleApplication.css` accordingly

## Browser Compatibility
- Modern browsers with CSS Grid support
- Chrome/Edge 57+
- Firefox 52+
- Safari 10.1+
- Opera 44+

## Performance
- Efficient rendering using DataView
- CSS Grid for hardware-accelerated layout
- Optimized for large record sets
- Smooth animations with CSS transitions

## Future Enhancements
Potential improvements:
- Drag-and-drop for tiles
- Inline editing in tile view
- Custom tile templates per module
- User-configurable tile sizes
- Bulk actions from tile view
- Filter chips displayed on tiles
