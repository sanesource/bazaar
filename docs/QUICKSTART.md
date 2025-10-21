# 🚀 Quick Start Guide

Get Bazaar up and running in 3 easy steps!

## Step 1: Prerequisites

Make sure you have **Python 3.8 or higher** installed:

```bash
python3 --version   # Linux/macOS
python --version    # Windows
```

If not installed, download from [python.org](https://www.python.org/downloads/)

## Step 2: Installation

### Option A: Automatic Setup (Recommended)

**Linux/macOS:**

```bash
./scripts/setup.sh
```

**Windows:**

```
scripts\setup.bat
```

### Option B: Manual Setup

```bash
pip install -r requirements.txt
```

Or:

```bash
pip install yfinance pandas requests
```

## Step 3: Run the Application

### Easy Launch

**Linux/macOS:**

```bash
./scripts/run.sh
```

**Windows:**

```
scripts\run.bat
```

### Direct Launch

```bash
python3 main.py   # Linux/macOS
python main.py    # Windows
```

---

## 🎯 That's it!

The application will open with:

- Real-time market data
- Windows XP-style interface
- Auto-refresh every 60 seconds

## 💡 Tips

- Click **"🔄 Refresh Now"** to manually update data
- Use the **dropdown** in Gainers/Losers to switch indices
- **Scroll** to view all sections
- The app runs entirely **offline** after fetching data

## ⚠️ Troubleshooting

**"Module not found" error?**

- Run the setup script again
- Or manually: `pip install -r requirements.txt`

**Data not loading?**

- Check your internet connection
- Yahoo Finance API might be temporarily down

**UI looks weird on Linux?**

- Install tkinter: `sudo apt-get install python3-tk`

---

**Need help?** Check the full [README.md](README.md) for detailed documentation.
