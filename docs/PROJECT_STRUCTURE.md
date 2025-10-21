# 📁 Project Structure

Complete overview of the Bazaar project file organization.

```
bazaar/
│
├── main.py                    # Main application entry point
├── data_fetcher.py           # Data fetching module (Yahoo Finance API)
├── ui_components.py          # UI sections and components
│
├── requirements.txt          # Python dependencies
├── .gitignore               # Git ignore patterns
├── VERSION                  # Current version number
│
├── README.md                # Complete documentation
├── QUICKSTART.md            # Quick start guide
├── FEATURES.md              # Features overview
├── CHANGELOG.md             # Version history and changes
├── PROJECT_STRUCTURE.md     # This file
│
├── setup.sh                 # Setup script (Linux/macOS)
├── setup.bat                # Setup script (Windows)
├── run.sh                   # Launch script (Linux/macOS)
├── run.bat                  # Launch script (Windows)
│
└── test_connection.py       # System compatibility test script
```

---

## 📄 File Descriptions

### Core Application Files

#### `main.py`

**Purpose:** Main application entry point and UI coordinator

**Key Components:**

- `BazaarApp` class - Main application controller
- UI initialization and layout
- Auto-refresh mechanism
- Window management
- Theme application

**Dependencies:** tkinter, threading, ui_components, data_fetcher

---

#### `data_fetcher.py`

**Purpose:** Handles all data fetching operations

**Key Components:**

- `DataFetcher` class - Data retrieval coordinator
- Methods for fetching:
  - Index data (Nifty, Sensex, Bank Nifty, VIX)
  - Market summary
  - Gainers and losers
  - Sectoral performance
  - Fear/Greed indicator

**Data Sources:** Yahoo Finance via yfinance library

**Key Features:**

- Error handling for network issues
- Data caching and formatting
- Support for multiple indices
- Configurable stock lists

---

#### `ui_components.py`

**Purpose:** Modular UI sections and display components

**Key Components:**

- `BaseSection` - Abstract base class for all sections
- `MarketSummarySection` - Market status and overview
- `TickerSection` - Index ticker displays
- `GainersLosersSection` - Top performers and underperformers
- `VixGreedSection` - Volatility and sentiment indicators
- `SectoralPerformanceSection` - Sector performance bars

**Design Pattern:** Each section is independent and self-contained

---

### Configuration Files

#### `requirements.txt`

**Purpose:** Python package dependencies

**Contents:**

```
yfinance>=0.2.32    # Stock market data
pandas>=2.0.0       # Data manipulation
requests>=2.31.0    # HTTP requests
```

**Size Impact:** ~30-40 MB installed

---

#### `.gitignore`

**Purpose:** Exclude unnecessary files from version control

**Excludes:**

- Python cache files (`__pycache__`, `*.pyc`)
- Virtual environments (`venv/`, `env/`)
- IDE files (`.vscode/`, `.idea/`)
- Build artifacts (`dist/`, `build/`)
- OS files (`.DS_Store`, `Thumbs.db`)

---

### Documentation Files

#### `README.md` (Main Documentation)

**Sections:**

- Features overview
- Installation instructions
- Usage guide
- Configuration options
- Troubleshooting
- Contribution guidelines

**Target Audience:** All users (beginners to advanced)

---

#### `QUICKSTART.md` (Quick Start Guide)

**Focus:** Get running in 3 steps

- Prerequisites check
- Installation options
- Running the app
- Basic troubleshooting

**Target Audience:** New users wanting immediate results

---

#### `FEATURES.md` (Features Overview)

**Content:**

- Detailed feature descriptions
- Visual examples
- Use cases
- Design rationale
- Future enhancements

**Target Audience:** Users wanting to understand capabilities

---

#### `CHANGELOG.md` (Version History)

**Content:**

- Version releases
- New features
- Bug fixes
- Breaking changes
- Planned features

**Format:** Keep a Changelog standard

---

#### `PROJECT_STRUCTURE.md` (This File)

**Content:**

- File organization
- Architecture overview
- Module relationships
- Customization guide

**Target Audience:** Developers and contributors

---

### Utility Scripts

#### `scripts/setup.sh` / `scripts/setup.bat`

**Purpose:** Automated setup on different platforms

**Actions:**

1. Check Python installation
2. Verify pip availability
3. Install dependencies from requirements.txt
4. Display success/error messages

**Platform:**

- `.sh` for Linux/macOS
- `.bat` for Windows

**Usage:**

```bash
./scripts/setup.sh      # Linux/macOS
scripts\setup.bat       # Windows
```

---

#### `scripts/run.sh` / `scripts/run.bat`

**Purpose:** Quick launch scripts

**Actions:**

1. Check if dependencies are installed
2. Run setup if needed
3. Launch main.py

**Benefit:** One-click execution

**Usage:**

```bash
./scripts/run.sh        # Linux/macOS
scripts\run.bat         # Windows
```

---

#### `test_connection.py`

**Purpose:** Pre-flight system check

**Tests:**

1. Python version compatibility
2. Required module imports
3. Data connection to Yahoo Finance
4. UI component creation

**Usage:** Run before first launch to verify setup

---

## 🏗️ Architecture Overview

### Modular Design

```
┌─────────────────────────────────────┐
│           main.py                   │
│         (Controller)                │
├─────────────────────────────────────┤
│  - Window Management                │
│  - Theme Application                │
│  - Auto-refresh Coordinator         │
│  - Section Initialization           │
└───────────┬─────────────────────────┘
            │
            ├───────────────────────────────┐
            │                               │
            ▼                               ▼
┌───────────────────────┐   ┌───────────────────────┐
│   ui_components.py    │   │   data_fetcher.py     │
│     (View Layer)      │   │    (Data Layer)       │
├───────────────────────┤   ├───────────────────────┤
│ - BaseSection         │   │ - DataFetcher         │
│ - MarketSummary       │◄──┤ - get_index_data()    │
│ - TickerSection       │◄──┤ - get_gainers()       │
│ - GainersLosers       │◄──┤ - get_sectoral()      │
│ - VixGreed            │◄──┤ - get_vix()           │
│ - SectoralPerf        │◄──┤                       │
└───────────────────────┘   └───────────┬───────────┘
                                        │
                                        ▼
                            ┌───────────────────────┐
                            │   Yahoo Finance API   │
                            │     (via yfinance)    │
                            └───────────────────────┘
```

### Data Flow

1. **User launches app** → `main.py` initializes
2. **BazaarApp created** → Initializes DataFetcher and UI components
3. **Sections created** → Each section registers with main app
4. **Initial data fetch** → refresh_data() called
5. **Threading** → Data fetched in background thread
6. **UI update** → Each section's update() method called
7. **Auto-refresh** → Repeats every 60 seconds

---

## 🔧 Customization Guide

### Adding a New Section

1. **Create section class** in `ui_components.py`:

```python
class MyNewSection(BaseSection):
    def __init__(self, parent, colors, data_fetcher):
        super().__init__(parent, colors, data_fetcher, "My Section")

    def update(self):
        self.clear_content()
        # Your update logic here
```

2. **Register in main.py**:

```python
self.my_section = MyNewSection(
    self.scrollable_frame, self.colors, self.data_fetcher
)
self.sections.append(self.my_section)
```

### Adding New Data Sources

1. **Add method** to `DataFetcher` class in `data_fetcher.py`:

```python
def get_my_data(self):
    # Fetch and return data
    return data
```

2. **Call from section**:

```python
data = self.data_fetcher.get_my_data()
```

### Modifying Theme

Edit color dictionary in `main.py`:

```python
self.colors = {
    'bg': '#ECE9D8',      # Background
    'fg': '#000000',      # Text
    'header': '#0054E3',  # Header bar
    # ... add more colors
}
```

---

## 📊 Build Size Analysis

### Installed Size Breakdown

| Component      | Size       |
| -------------- | ---------- |
| Python scripts | ~30 KB     |
| yfinance       | ~15 MB     |
| pandas         | ~40 MB     |
| requests       | ~2 MB      |
| Dependencies   | ~30 MB     |
| **Total**      | **~90 MB** |

### Reducing Size

- Use `--exclude-module` with PyInstaller
- Remove unused pandas features
- Use minimal pandas build
- Compress with UPX

### Executable Size (PyInstaller)

- **Windows:** ~60-80 MB
- **macOS:** ~70-90 MB
- **Linux:** ~60-80 MB

---

## 🔐 Security Considerations

### Network Requests

- Only connects to Yahoo Finance API
- No user data is transmitted
- No API keys or authentication

### Data Privacy

- No data is stored permanently
- No user tracking
- No external analytics

### Code Safety

- No eval() or exec() usage
- No dynamic code execution
- Input validation on dropdowns

---

## 🧪 Testing Strategy

### Manual Testing

1. Run `test_connection.py`
2. Verify each section displays correctly
3. Test dropdown functionality
4. Test refresh button
5. Test auto-refresh
6. Test different market conditions (open/closed)

### Automated Testing (Future)

- Unit tests for DataFetcher methods
- UI component tests
- Integration tests
- Mock API responses

---

## 📦 Distribution Options

### Option 1: Source Distribution

**Best for:** Developers, Python users
**Size:** ~30 KB (just the code)
**Requires:** User installs Python + dependencies

### Option 2: PyInstaller Executable

**Best for:** End users
**Size:** ~60-90 MB
**Requires:** Nothing (standalone)

### Option 3: Python Wheel

**Best for:** pip installation
**Command:** `pip install bazaar-stock-app`
**Size:** ~30 KB + dependencies

---

## 🚀 Future Architecture Enhancements

### Planned Improvements

1. **Configuration File**

   - User preferences
   - Custom stock lists
   - Theme customization

2. **Plugin System**

   - Load custom sections
   - Third-party integrations
   - Community contributions

3. **Database Support**

   - Local data caching
   - Historical data storage
   - Offline mode

4. **API Abstraction**
   - Multiple data sources
   - Fallback providers
   - Rate limiting

---

**For questions or contributions, refer to the main README.md**
