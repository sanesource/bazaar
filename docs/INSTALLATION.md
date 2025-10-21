# 💿 Complete Installation Guide

Detailed installation instructions for all platforms.

---

## 🖥️ Platform-Specific Installation

### Windows

#### Prerequisites

1. **Download Python** from [python.org](https://www.python.org/downloads/)

   - Minimum: Python 3.8
   - Recommended: Python 3.10 or newer
   - ⚠️ **Important:** Check "Add Python to PATH" during installation

2. **Verify Installation**
   ```cmd
   python --version
   ```

#### Installation

1. **Download Bazaar** (extract to a folder)

2. **Run Setup Script** (Double-click or from CMD):

   ```cmd
   scripts\setup.bat
   ```

3. **Launch Application**:
   ```cmd
   scripts\run.bat
   ```
   Or:
   ```cmd
   python main.py
   ```

#### Troubleshooting Windows

**Issue: "python is not recognized"**

- Solution: Reinstall Python with "Add to PATH" checked
- Or manually add Python to PATH in Environment Variables

**Issue: "tkinter not found"**

- Solution: Reinstall Python with "tcl/tk and IDLE" option checked

---

### macOS

#### Prerequisites

1. **Check Python** (usually pre-installed):

   ```bash
   python3 --version
   ```

2. **Install Python if needed** (via Homebrew):
   ```bash
   brew install python@3.10
   ```

#### Installation

1. **Download Bazaar** (extract to a folder)

2. **Open Terminal** in the bazaar folder

3. **Run Setup Script**:

   ```bash
   chmod +x scripts/setup.sh scripts/run.sh
   ./scripts/setup.sh
   ```

4. **Launch Application**:
   ```bash
   ./scripts/run.sh
   ```
   Or:
   ```bash
   python3 main.py
   ```

#### Troubleshooting macOS

**Issue: "Permission denied"**

- Solution: Make scripts executable
  ```bash
  chmod +x scripts/setup.sh scripts/run.sh main.py
  ```

**Issue: "pip not found"**

- Solution: Install pip
  ```bash
  python3 -m ensurepip --upgrade
  ```

---

### Ubuntu/Debian Linux

#### Prerequisites

1. **Update system**:

   ```bash
   sudo apt update
   ```

2. **Install Python** (if not installed):

   ```bash
   sudo apt install python3 python3-pip python3-tk
   ```

3. **Verify**:
   ```bash
   python3 --version
   pip3 --version
   ```

#### Installation

1. **Download Bazaar**:

   ```bash
   cd ~/Downloads
   # Extract if needed
   cd bazaar
   ```

2. **Run Setup**:

   ```bash
   chmod +x scripts/setup.sh scripts/run.sh
   ./scripts/setup.sh
   ```

3. **Launch**:
   ```bash
   ./scripts/run.sh
   ```

#### Troubleshooting Ubuntu/Debian

**Issue: "tkinter not found"**

```bash
sudo apt install python3-tk
```

**Issue: "pip not found"**

```bash
sudo apt install python3-pip
```

---

### Fedora/RHEL/CentOS Linux

#### Prerequisites

```bash
sudo dnf install python3 python3-pip python3-tkinter
```

#### Installation

Same as Ubuntu, but use `dnf` instead of `apt`.

---

### Arch Linux

#### Prerequisites

```bash
sudo pacman -S python python-pip tk
```

#### Installation

Same as Ubuntu.

---

## 🐍 Virtual Environment Installation (Recommended)

Using a virtual environment keeps your system clean.

### Create Virtual Environment

**Windows:**

```cmd
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**macOS/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

### Deactivate Virtual Environment

```bash
deactivate
```

---

## 📦 Manual Dependency Installation

If the setup scripts don't work:

```bash
pip install yfinance
pip install pandas
pip install requests
```

Or all at once:

```bash
pip install yfinance pandas requests
```

---

## 🔍 Verify Installation

Run the test script to verify everything is working:

```bash
python3 test_connection.py
```

Expected output:

```
Testing imports...
✓ tkinter is available
✓ yfinance is installed
✓ pandas is installed
✓ requests is installed

Testing data connection...
✓ Successfully fetched data from Yahoo Finance

Testing UI capabilities...
✓ UI components can be created

✅ All tests passed! You're ready to run Bazaar.
```

---

## 🚀 First Run

### Normal Mode

```bash
python3 main.py
```

The application will:

1. Initialize the UI
2. Fetch market data (requires internet)
3. Display all sections
4. Auto-refresh every 60 seconds

### What to Expect

**On First Launch:**

- Window opens with Windows XP theme
- "Loading..." message appears
- Data fetches in background (~5-10 seconds)
- All sections populate with data
- Status shows "✓ Data refreshed successfully"

**During Market Hours:**

- Real-time data (15-min delayed for free tier)
- Market Status shows "OPEN"
- All indices update regularly

**Outside Market Hours:**

- Last available data is shown
- Market Status shows "CLOSED"
- VIX and other indicators still work

---

## 💾 Build Size Considerations

### Installed Size

- **Application code:** ~30 KB
- **Dependencies:** ~90 MB
  - yfinance: ~15 MB
  - pandas: ~40 MB
  - requests: ~2 MB
  - Other dependencies: ~33 MB
- **Total:** ~90 MB

### Creating Standalone Executable

To create a single executable file (no Python required):

1. **Install PyInstaller**:

   ```bash
   pip install pyinstaller
   ```

2. **Build Executable**:

   ```bash
   pyinstaller --onefile --windowed --name Bazaar main.py
   ```

3. **Find Executable**:
   - Windows: `dist/Bazaar.exe`
   - macOS: `dist/Bazaar.app`
   - Linux: `dist/Bazaar`

#### Executable Size

- **Windows:** ~60-80 MB
- **macOS:** ~70-90 MB
- **Linux:** ~60-80 MB

#### Reducing Executable Size

**Option 1: Exclude unused modules**

```bash
pyinstaller --onefile --windowed \
  --exclude-module matplotlib \
  --exclude-module numpy.test \
  --name Bazaar main.py
```

**Option 2: Use UPX compression**

```bash
# Install UPX first
pyinstaller --onefile --windowed \
  --upx-dir=/path/to/upx \
  --name Bazaar main.py
```

**Option 3: One-folder mode** (faster startup)

```bash
pyinstaller --onedir --windowed --name Bazaar main.py
```

---

## 🌐 Network Requirements

### During Installation

- Internet required to download dependencies (~90 MB)
- One-time setup

### During Runtime

- Internet required to fetch stock data
- Minimal bandwidth (~1-2 MB per refresh)
- Data fetched every 60 seconds
- Works on slow connections (3G+)

### Offline Mode

- Application requires internet for data
- No offline caching in v1.0
- Future versions may include offline mode

---

## 🔒 Firewall and Security

### Outgoing Connections

The application only connects to:

- `query1.finance.yahoo.com` (Yahoo Finance API)
- Standard HTTPS ports (443)

### Firewall Rules

If you have a strict firewall, allow:

- **Domain:** `*.yahoo.com`
- **Protocol:** HTTPS (TCP port 443)
- **Application:** Python or Bazaar executable

---

## 🔄 Updating Bazaar

### Update Application Code

1. Download latest version
2. Replace files (keep requirements.txt)
3. No need to reinstall dependencies

### Update Dependencies

```bash
pip install --upgrade yfinance pandas requests
```

Or:

```bash
pip install --upgrade -r requirements.txt
```

---

## ❌ Uninstallation

### Remove Application

Simply delete the bazaar folder.

### Remove Dependencies (optional)

```bash
pip uninstall yfinance pandas requests
```

### Remove Python (optional)

- **Windows:** Control Panel → Programs → Uninstall
- **macOS:** `brew uninstall python`
- **Linux:** `sudo apt remove python3` (not recommended)

---

## 📊 System Requirements

### Minimum Requirements

- **OS:** Windows 7+, macOS 10.12+, Ubuntu 18.04+
- **RAM:** 256 MB
- **Storage:** 100 MB
- **CPU:** Any modern processor
- **Internet:** Required for data fetching

### Recommended Requirements

- **OS:** Windows 10+, macOS 11+, Ubuntu 20.04+
- **RAM:** 512 MB
- **Storage:** 200 MB
- **CPU:** Dual-core or better
- **Internet:** Broadband (for faster updates)
- **Display:** 1920x1080 or higher

---

## 🐛 Common Issues

### Issue: Slow startup

**Cause:** Fetching data from Yahoo Finance
**Solution:** Normal behavior, wait 5-10 seconds

### Issue: "No module named 'yfinance'"

**Cause:** Dependencies not installed
**Solution:** Run `setup.sh` or `pip install -r requirements.txt`

### Issue: Empty sections

**Cause:** Network issue or API temporarily down
**Solution:** Check internet, wait a moment, click Refresh

### Issue: "Rate limit exceeded"

**Cause:** Too many requests to Yahoo Finance
**Solution:** Wait 5 minutes, reduce refresh frequency

### Issue: High CPU usage

**Cause:** Too many stocks being tracked
**Solution:** Reduce stock lists in `data_fetcher.py`

---

## 💡 Tips for Best Experience

1. **Run during market hours** (9:15 AM - 3:30 PM IST) for live data
2. **Use wired connection** for more reliable updates
3. **Maximize window** for best viewing experience
4. **Create desktop shortcut** to scripts/run.sh or scripts/run.bat
5. **Check firewall settings** if data doesn't load

---

## 🆘 Getting Help

**Still having issues?**

1. Run `python test_connection.py` to diagnose
2. Check the [README.md](../README.md) for more info
3. Review [FEATURES.md](FEATURES.md) for usage tips
4. Check [CHANGELOG.md](CHANGELOG.md) for known issues

---

**Happy Trading! 📈**
