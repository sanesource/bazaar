# Changelog

All notable changes to Bazaar will be documented in this file.

## [1.1.0] - 2025-10-21

### ✨ Major UX Improvements

#### Enhanced Loading System

- ✅ **Absolute Positioned Loading Overlay** - No more scroll blocking!
  - Centered loading indicator that doesn't interfere with scrolling
  - Users can now scroll freely while data is being fetched
  - Prevents layout shifts and UI distortion during data refresh

#### Visual Enhancements

- ✅ **Animated Loading Text** - Engaging dots animation ("Loading market data.", "..", "...")
- ✅ **Professional Loading UI** - Clean white container with Windows XP blue border
- ✅ **Large Visual Feedback** - 32pt hourglass icon for clear visibility
- ✅ **Helpful Subtext** - "Please wait while we fetch the latest updates"

#### Technical Improvements

- ✅ Removed individual section loading indicators (eliminated layout jumps)
- ✅ Global loading state managed at application level
- ✅ Overlay uses `place()` geometry for absolute positioning
- ✅ Non-blocking UI - content remains stable during refresh
- ✅ Smooth show/hide animations with proper cleanup

### 🐛 Bug Fixes

- Fixed scroll blocking issue during data fetch
- Fixed layout distortion when sections loaded sequentially
- Fixed jarring UI jumps caused by individual loading states

### 📚 Documentation

- Updated LOADING_STATES.md with new overlay implementation details
- Added before/after comparison showing improvements
- Documented technical implementation with code examples

---

## [1.0.0] - 2025-10-21

### 🎉 Initial Release

#### Features

- ✅ Real-time Indian stock market data display
- ✅ Windows XP-inspired UI theme
- ✅ Market Summary section with status indicator
- ✅ Index Tickers for Nifty50, Bank Nifty, and Sensex30
- ✅ Top 10 Gainers and Losers with index filter dropdown
- ✅ India VIX (Volatility Index) display
- ✅ Custom Market Greed Meter (Fear/Greed indicator)
- ✅ Sectoral Performance with 10 major sectors
- ✅ Auto-refresh functionality (60-second interval)
- ✅ Manual refresh button
- ✅ Cross-platform support (Windows, macOS, Linux)
- ✅ Modular architecture for easy extension
- ✅ Scrollable interface for all screen sizes

#### Technical

- Built with Python 3.8+ and tkinter
- Uses yfinance for free stock market data
- Lightweight dependencies (yfinance, pandas, requests)
- No API key required
- Threading for non-blocking data updates
- Comprehensive error handling

#### Documentation

- README with full setup instructions
- QUICKSTART guide for quick setup
- FEATURES overview document
- Setup scripts for Windows (.bat) and Unix (.sh)
- Run scripts for easy launching
- Code comments and docstrings

#### Design

- Windows XP Classic theme colors
- Tahoma font family
- Color-coded performance indicators (green/red)
- Visual separators and borders
- Responsive layout with scrolling support

---

## Upcoming Features (Planned)

### Version 1.2.0

- [ ] Historical price charts
- [ ] Export to CSV functionality
- [ ] Customizable refresh interval
- [ ] Dark mode option
- [ ] More sectoral indices

### Version 1.3.0

- [ ] Personal watchlist
- [ ] Price alerts
- [ ] News integration
- [ ] Portfolio tracking

### Version 2.0.0

- [ ] Advanced charting with technical indicators
- [ ] Multi-timeframe analysis
- [ ] Option chain data
- [ ] FII/DII data

---

**Note:** Version numbers follow [Semantic Versioning](https://semver.org/)

- MAJOR version for incompatible API changes
- MINOR version for added functionality (backwards-compatible)
- PATCH version for backwards-compatible bug fixes
