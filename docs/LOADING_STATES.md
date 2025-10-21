# Loading States & Error Handling

## Overview

The application now includes comprehensive loading indicators and error states for all API calls, providing better user feedback during data fetching. The loading system uses an **absolute positioned overlay** that prevents scrolling issues and layout distortions.

## Features Added

### 1. **Global Loading Overlay** ⏳

- Absolute positioned overlay that appears during data refresh
- Does **NOT** block scrolling - users can still scroll while data loads
- Prevents layout shifts and distorted UI issues
- Centered loading indicator with animated text
- Consistent Windows XP styling
- Non-intrusive visual feedback

### 2. **Error States** ❌

- Graceful error handling when API calls fail
- User-friendly error messages
- Specific error details for debugging
- Error states shown in individual sections

### 3. **Loading Overlay Components**

The global loading overlay includes:

#### Visual Elements

- Large ⏳ hourglass icon (32pt font)
- Animated loading text with dots ("Loading market data.", "..", "...")
- Helpful subtext: "Please wait while we fetch the latest updates"
- Clean white container with Windows XP blue border
- Semi-transparent background matching the app theme

#### Technical Implementation

- Positioned using `place()` with `relwidth=1, relheight=1`
- Lifted to front using `lift()` to appear above all content
- Animation runs at 500ms intervals
- Automatically hidden when data loading completes

### 4. **Base Section Methods**

Available methods in `BaseSection` class:

#### `show_error(error_message)`

Displays an error state with:

- ❌ icon
- "Error" header in red
- Custom error message
- Wrapped text for long messages

## Implementation by Section

All sections now load behind the global overlay, eliminating individual loading states within sections. This provides:

### 📈 Index Tickers

- Fetches 3 indices (NIFTY50, BANKNIFTY, SENSEX)
- No layout shifts during load
- Error if no indices load successfully
- Partial success: Shows available tickers

### 🔥 Top Gainers & Losers

- Dropdown preserved during refresh
- No loading flicker in data area
- Error message shown below dropdown if needed
- Works with all 6 index filters

### 😰 Market Sentiment (VIX & Greed)

- Both metrics load simultaneously
- Fallback text if VIX unavailable
- Comprehensive error handling
- No layout distortion

### 🏭 Sectoral Performance

- All 10 sectors load together
- Error if no sectors available
- Maintains fixed layout structure

## Error Messages

**Network Errors:**

```
❌ Error
Unable to fetch index data. Please check your connection.
```

**Data Unavailable:**

```
❌ Error
No stock data available for this index.
```

**API Failures:**

```
❌ Error
Error loading tickers: [specific error]
```

## User Experience Benefits

1. **No Scroll Blocking**: Users can scroll freely while data loads
2. **No Layout Shifts**: Content remains stable, preventing UI distortion
3. **Clear Feedback**: Global loader shows data is being fetched
4. **Smooth Experience**: No jarring content jumps or flickers
5. **Professional Appearance**: Clean, centered loading indicator
6. **Transparency**: Users know the app is working
7. **Troubleshooting**: Specific error messages help identify issues
8. **Graceful Degradation**: App doesn't crash on failures

## Technical Details

### Global Loading System

The main app manages the loading overlay:

```python
def refresh_data(self):
    """Refresh all data sections"""
    def refresh_thread():
        # Show global overlay
        self.root.after(0, self.show_loading_overlay)

        try:
            # Update all sections
            for section in self.sections:
                self.root.after(0, section.update)
        finally:
            # Hide overlay when done
            self.root.after(0, self.hide_loading_overlay)
```

### Section Updates

Sections now update directly without showing individual loading states:

```python
def update(self):
    # Don't show individual loading - global loader handles this
    try:
        # Fetch and display data
        data = self.data_fetcher.get_data()
        self.render_content(build_fn)
    except Exception as e:
        self.show_error(f"Error: {str(e)}")
```

### State Flow

```
User triggers refresh
     ↓
⏳ Global Overlay Shown
     ↓
Sections update (no individual loaders)
     ↓
   ┌───┴───┐
   ↓       ↓
Success  Error
   ↓       ↓
Hide     Hide
Overlay  Overlay
   ↓       ↓
Show     Show Error
Data     in Section
```

### Overlay Positioning

- Uses `place()` geometry manager for absolute positioning
- `relwidth=1, relheight=1` covers entire window
- `lift()` brings overlay to front
- `place_forget()` removes from display without destroying

## Testing Scenarios

1. **Normal Operation**: Global overlay → smooth data display
2. **Scroll During Load**: Users can scroll freely with overlay visible
3. **Slow Network**: Extended loading state, no UI freezing
4. **Network Failure**: Clear error messages in affected sections
5. **Partial Failures**: Shows what's available, errors for rest
6. **API Rate Limits**: Informative error messages
7. **Multiple Refreshes**: Overlay shows/hides cleanly each time

## Key Improvements (v1.1)

### Before (v1.0)

- ❌ Individual section loaders caused layout shifts
- ❌ Loading states blocked scrolling
- ❌ UI appeared jumpy during data fetch
- ❌ Multiple loading indicators confused users

### After (v1.1)

- ✅ Single global loader overlay
- ✅ Scrolling works during data fetch
- ✅ No layout shifts or distortions
- ✅ Clean, professional UX
- ✅ Animated loading text for engagement

## Future Enhancements

- Retry button on errors
- Progress indicator showing section load status
- Skeleton screens for initial load
- Cached data fallback
- Network status indicator
- Optional timeout handling

---

**Version**: 1.1.0
**Updated**: 2025-10-21
**Major Changes**: Implemented absolute positioned loading overlay to prevent scroll blocking and layout distortions
