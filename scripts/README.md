# 🛠️ Scripts

Utility scripts for setting up and running Bazaar.

## 📋 Available Scripts

### Setup Scripts

#### `setup.sh` (Linux/macOS)
**Purpose:** Automated dependency installation for Unix-like systems

**Usage:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**What it does:**
1. Checks Python 3 installation
2. Verifies pip availability
3. Installs dependencies from requirements.txt
4. Shows success/error messages

#### `setup.bat` (Windows)
**Purpose:** Automated dependency installation for Windows

**Usage:**
```cmd
scripts\setup.bat
```

**What it does:**
1. Checks Python installation
2. Upgrades pip
3. Installs dependencies from requirements.txt
4. Shows success/error messages

---

### Run Scripts

#### `run.sh` (Linux/macOS)
**Purpose:** Quick launcher for Unix-like systems

**Usage:**
```bash
chmod +x scripts/run.sh
./scripts/run.sh
```

**What it does:**
1. Checks if dependencies are installed
2. Runs setup if needed
3. Launches main.py

#### `run.bat` (Windows)
**Purpose:** Quick launcher for Windows

**Usage:**
```cmd
scripts\run.bat
```

**What it does:**
1. Checks if dependencies are installed
2. Runs setup if needed
3. Launches main.py

---

## 🚀 Quick Start

**First time setup:**
```bash
# Linux/macOS
./scripts/setup.sh

# Windows
scripts\setup.bat
```

**Run the application:**
```bash
# Linux/macOS
./scripts/run.sh

# Windows
scripts\run.bat
```

---

## 🔧 Making Scripts Executable (Linux/macOS)

If you get "Permission denied" errors:

```bash
chmod +x scripts/setup.sh scripts/run.sh
```

---

## 💡 Tips

1. **Use setup scripts** for first-time installation
2. **Use run scripts** for daily use (they auto-check dependencies)
3. **Direct Python execution** is also available: `python main.py`
4. **Create shortcuts** to run scripts for easier access

---

**Back to [Main README](../README.md)**
