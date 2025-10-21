# 🏛️ Bazaar - Indian Stock Market Dashboard

A lightweight, cross-platform Python GUI application for displaying real-time Indian stock market information with a nostalgic Windows XP-style interface.

## ✨ Features

- **📊 Market Summary** - Quick overview of market status and major indices
- **📈 Index Tickers** - Real-time data for Nifty50, Bank Nifty, and Sensex30
- **🔥 Top Gainers & Losers** - Top 10 performing stocks with index filter
- **😰 Market Sentiment** - India VIX and Fear/Greed meter
- **🏭 Sectoral Performance** - Visual representation of sector performance

## 🎨 Design

- **Windows XP Theme** - Classic, minimalistic UI inspired by Windows XP
- **Modular Architecture** - Easy to extend with new sections
- **Cross-Platform** - Works on Windows, macOS, and Ubuntu/Linux

## 📚 Documentation

For detailed documentation, see the [`docs/`](docs/) folder:

- **[START_HERE.md](docs/START_HERE.md)** - Complete overview and quick start
- **[QUICKSTART.md](docs/QUICKSTART.md)** - Get running in 3 steps
- **[INSTALLATION.md](docs/INSTALLATION.md)** - Platform-specific installation guide
- **[FEATURES.md](docs/FEATURES.md)** - Detailed feature documentation
- **[PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)** - Architecture and customization
- **[BUILD_GUIDE.md](docs/BUILD_GUIDE.md)** - Building executables for distribution
- **[CHANGELOG.md](docs/CHANGELOG.md)** - Version history and updates
- **[LOADING_STATES.md](docs/LOADING_STATES.md)** - Loading & error handling documentation

## 🚀 Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Setup

1. **Clone or download this repository**

2. **Install dependencies:**

```bash
# Automatic setup (recommended)
./scripts/setup.sh      # Linux/macOS
scripts\setup.bat       # Windows

# Or manual installation
pip install -r requirements.txt
```

That's it! The application uses only 3 lightweight dependencies:

- `yfinance` - For fetching stock market data (free API)
- `pandas` - For data processing
- `requests` - For HTTP requests

## 🖥️ Usage

### Running the Application

**Quick launch:**

```bash
./scripts/run.sh        # Linux/macOS
scripts\run.bat         # Windows
```

**Or directly:**

```bash
python main.py
```

### Features Explanation

- **Auto-Refresh**: Data automatically refreshes every 60 seconds
- **Manual Refresh**: Click the "🔄 Refresh Now" button to update immediately
- **Index Selection**: Use the dropdown in Gainers/Losers section to switch between indices
- **Scrollable**: Scroll through all sections using mouse wheel or scrollbar

## 🔧 Configuration

### Changing Refresh Interval

Edit `main.py` and modify the refresh interval (in seconds):

```python
self.refresh_interval = 60  # Change to desired seconds
```

### Adding New Sections

The application is designed to be modular. To add a new section:

1. Create a new class in `ui_components.py` that inherits from `BaseSection`
2. Implement the `update()` method
3. Add the section to `main.py` in the `create_ui()` method:

```python
self.new_section = NewSection(
    self.scrollable_frame, self.colors, self.data_fetcher
)
self.sections.append(self.new_section)
```

### Modifying Stock Lists

Edit `data_fetcher.py` to modify the stock lists for different indices:

```python
self.nifty50_stocks = [
    'RELIANCE.NS', 'TCS.NS', ...
]
```

## 📦 Building Executable (Optional)

To create a standalone executable for distribution:

### Quick Build

**Option 1: Automated Build Script (Recommended)**

```bash
# Install PyInstaller first
pip install pyinstaller

# Optional: Create application icons from your logo
python3 create_icons.py

# Run the automated build script
python build.py          # All platforms
```

**Option 2: Manual Build**

```bash
# Windows
pyinstaller --onefile --windowed --name Bazaar main.py

# macOS/Linux
pyinstaller --onefile --windowed --name Bazaar main.py
```

The executable will be in the `dist/` folder.

### Testing Your Build

```bash
python test_build.py
```

### Complete Build Documentation

For detailed instructions including:

- Platform-specific optimizations
- Build size reduction techniques
- Creating installers and distribution packages
- Code signing
- Troubleshooting

See the **[docs/](docs/)** folder for complete documentation:

- **[BUILD_GUIDE.md](docs/BUILD_GUIDE.md)** - Complete build guide
- **[BUILDING.md](docs/BUILDING.md)** - Quick reference
- **[README_ICONS.md](docs/README_ICONS.md)** - Icon setup guide

**Expected build size:** 60-100 MB (includes Python runtime and dependencies)

## 🌐 Data Sources

This application uses **free and open-source** data sources:

- **Yahoo Finance API** (via `yfinance` library) - Provides real-time and historical data for Indian stock market indices and stocks

All data is fetched in real-time with no API key required!

## 🛠️ Troubleshooting

### Data Not Loading

- Check your internet connection
- Yahoo Finance API might be temporarily unavailable - try again later
- Some stocks might have different symbols; verify them on Yahoo Finance

### UI Not Displaying Correctly

- Ensure you're using Python 3.8+
- On Linux, you might need to install tkinter: `sudo apt-get install python3-tk`
- Try resizing the window if elements appear cut off

### Performance Issues

- Reduce the number of stocks being tracked in `data_fetcher.py`
- Increase the refresh interval in `main.py`

## 📝 System Requirements

- **OS**: Windows 7+, macOS 10.12+, Ubuntu 18.04+ (or any Linux with Python 3.8+)
- **RAM**: 256 MB minimum
- **Storage**: 100 MB (including Python and dependencies)
- **Internet**: Required for fetching real-time data

## 🤝 Contributing

Contributions are welcome! Here are some ways you can contribute:

- Add more market indicators
- Improve the UI/UX
- Add chart visualizations
- Optimize data fetching
- Fix bugs

## 📄 License

This project is free and open-source. Feel free to use, modify, and distribute.

## ⚠️ Disclaimer

This application is for informational purposes only. The stock market data is provided as-is without any guarantees of accuracy or completeness. Do not use this application as the sole basis for making investment decisions. Always consult with a qualified financial advisor before making investment decisions.

## 🙏 Acknowledgments

- **Yahoo Finance** - For providing free access to market data
- **Python tkinter** - For the lightweight, cross-platform GUI framework
- **Windows XP** - For the iconic UI design inspiration

## 📧 Support

If you encounter any issues or have suggestions, please open an issue on the project repository.

---

**Happy Trading! 📈💰**
