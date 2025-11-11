# 🏛️ Bazaar - Indian Stock Market Dashboard

A lightweight, cross-platform Electron desktop application for displaying real-time Indian stock market information with a classic light interface.

![Bazaar Screenshot](https://github.com/user-attachments/assets/4d7947c9-31ad-40a8-a9a4-8cd7b0aa30d4)

## ✨ Features

- 📊 **Market Summary** - Major indices (Nifty50, Bank Nifty, Sensex)
- 🔥 **Top Gainers & Losers** - Dynamic stock lists with time period filters
- 😰 **Market Sentiment** - India VIX and Fear/Greed meter
- 🏭 **Sectoral Performance** - Visual sector charts
- 🎨 **Multiple Themes** - Light classic and Dark terminal themes
- ⚡ **Auto-Refresh** - Updates every 60 seconds
- 🌐 **Real NSE Data** - Uses official NSE India API

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ ([Download](https://nodejs.org/))
- npm v9+

### Installation & Run

```bash
# Clone the repository
git clone <repository-url>
cd bazaar

# Install dependencies
npm install

# Run the application
npm start
```

### Or use helper scripts:

**Linux/macOS:**

```bash
./scripts/setup.sh
npm start
```

**Windows:**

```bash
scripts\setup.bat
npm start
```

## 📥 Download & Install from Releases

### Download

1. Go to the [Releases](https://github.com/sanesource/bazaar/releases) page
2. Download the appropriate package for your platform:
   - **macOS**: `Bazaar-darwin-x64.dmg` or `Bazaar-darwin-arm64.dmg`
   - **Windows**: `Bazaar-win32-x64.exe`
   - **Linux**: `Bazaar-linux-x64.AppImage` or `.deb` package

### Installation

#### macOS

1. Open the downloaded `.dmg` file
2. Drag `Bazaar.app` to your `Applications` folder
3. **Important**: Before first launch, open Terminal and run:

   ```bash
   xattr -cr /Applications/Bazaar.app
   ```

   This removes macOS quarantine attributes that prevent unsigned apps from running.

4. Launch Bazaar from Applications or Spotlight

#### Windows

1. Run the downloaded `.exe` installer
2. Follow the installation wizard
3. Launch Bazaar from Start Menu or desktop shortcut

#### Linux

**For AppImage:**

```bash
chmod +x Bazaar-linux-x64.AppImage
./Bazaar-linux-x64.AppImage
```

**For .deb package:**

```bash
sudo dpkg -i Bazaar-linux-x64.deb
```

## 📦 Build Executables

```bash
# Build for current platform
npm run build

# Build for specific platform
npm run build:win     # Windows
npm run build:mac     # macOS
npm run build:linux   # Linux
```

Executables will be in the `dist/` folder (~80-100 MB).

## 📚 Documentation

All documentation is in the [`docs/`](docs/) folder:

- **[GETTING_STARTED.txt](docs/GETTING_STARTED.txt)** - Simple text guide
- **[QUICKSTART.md](docs/QUICKSTART.md)** - Get running in 3 steps
- **[ELECTRONJS_IMPLEMENTATION_GUIDE.md](docs/ELECTRONJS_IMPLEMENTATION_GUIDE.md)** - Complete implementation guide
- **[ELECTRON_MIGRATION.md](docs/ELECTRON_MIGRATION.md)** - Migration from Python summary
- **[FEATURES.md](docs/FEATURES.md)** - Detailed features
- **[PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)** - Architecture
- **[INSTALLATION.md](docs/INSTALLATION.md)** - Platform-specific setup
- **[MACOS_INSTALLATION.md](docs/MACOS_INSTALLATION.md)** - macOS installation and Gatekeeper fix
- **[BUILD_GUIDE.md](docs/BUILD_GUIDE.md)** - Building executables
- **[CHANGELOG.md](docs/CHANGELOG.md)** - Version history

## 🛠️ Technology Stack

- **Electron** (v28+) - Desktop framework
- **Node.js** - JavaScript runtime
- **stock-nse-india** - NSE India API for real-time data
- **HTML5/CSS3** - UI structure and Light theme
- **Vanilla JavaScript** - No frameworks for minimal size

## 🎯 Key Features

### Dynamic Stock Lists

Stock lists are fetched dynamically from NSE India API - no hardcoding! This means the app automatically updates when index constituents change.

### Optimized Bundle

- Only 1 production dependency (`stock-nse-india`)
- No React/Vue - pure JavaScript
- ASAR compression enabled
- ~80-100 MB final build size

### Real-Time Data

All data fetched from official NSE India API:

- ✅ Free and open
- ✅ No API key required
- ✅ Real-time market data

## 🐛 Troubleshooting

### macOS "App is Damaged" Error

If you see **"Bazaar" is damaged and can't be opened** when installing on macOS:

1. **Quick Fix**: Open Terminal and run:

   ```bash
   xattr -cr /path/to/Bazaar.app
   ```

2. **Alternative**: Right-click the app and select "Open"

For detailed instructions, see [macOS Installation Guide](docs/MACOS_INSTALLATION.md).

### Linux Sandbox Error

If you get sandbox errors on Linux, the app already includes `--no-sandbox` flag. If issues persist, check [docs/INSTALLATION.md](docs/INSTALLATION.md).

### Data Not Loading

- Check internet connection
- NSE API might be temporarily down - wait and refresh
- Click the "🔄 Refresh Now" button

### Application Won't Start

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📝 System Requirements

- **OS:** Windows 10+, macOS 10.12+, Ubuntu 18.04+
- **RAM:** 512 MB minimum
- **Storage:** 150 MB
- **Internet:** Required for real-time data

## 🤝 Contributing

Contributions welcome! See documentation for architecture details.

## 📄 License

MIT License - Free and open-source

## ⚠️ Disclaimer

For informational purposes only. Not financial advice. Always consult a qualified financial advisor before making investment decisions.

## 🙏 Acknowledgments

- **NSE India** - Official market data API
- **Electron.js** - Cross-platform framework
- **Light** - UI design inspiration

---

**Happy Trading! 📈💰**

For detailed documentation, see the [docs/](docs/) folder.
