# 🎉 Welcome to Bazaar!

## Your Indian Stock Market Dashboard is Ready!

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Install Dependencies

**Windows:**

```cmd
scripts\setup.bat
```

**macOS/Linux:**

```bash
./scripts/setup.sh
```

### 2️⃣ Run the App

**Windows:**

```cmd
scripts\run.bat
```

**macOS/Linux:**

```bash
./scripts/run.sh
```

### 3️⃣ Enjoy!

The application will open with real-time Indian stock market data!

---

## 📚 Documentation Guide

Not sure where to start? Here's what each document contains:

| Document                 | Purpose                   | Read if...                          |
| ------------------------ | ------------------------- | ----------------------------------- |
| **START_HERE.md**        | This file! Quick overview | You're new here                     |
| **QUICKSTART.md**        | 3-step setup guide        | You want to start immediately       |
| **README.md**            | Complete documentation    | You need detailed information       |
| **INSTALLATION.md**      | Platform-specific setup   | You're having installation issues   |
| **FEATURES.md**          | Features explanation      | You want to understand capabilities |
| **PROJECT_STRUCTURE.md** | Code organization         | You want to modify/extend the app   |
| **CHANGELOG.md**         | Version history           | You want to see what's new          |

---

## ✨ What You Get

### 📊 Market Summary

Quick overview of market status and performance

### 📈 Index Tickers

Real-time data for:

- **Nifty 50**
- **Bank Nifty**
- **Sensex 30**

### 🔥 Top Performers

- Top 10 Gainers
- Top 10 Losers
- Filter by index

### 😰 Market Sentiment

- India VIX (Volatility)
- Fear/Greed Meter

### 🏭 Sectoral Performance

10 major sectors with visual bars

---

## 🎨 Design Philosophy

### Windows XP Theme

Nostalgic, minimalistic, and familiar interface

### Lightweight

- Only 3 dependencies
- ~90 MB installed
- Fast startup
- Low resource usage

### Cross-Platform

Works identically on:

- ✅ Windows 7+
- ✅ macOS 10.12+
- ✅ Ubuntu/Linux 18.04+

---

## 💻 System Requirements

### Minimum

- Python 3.8+
- 256 MB RAM
- 100 MB storage
- Internet connection

### Recommended

- Python 3.10+
- 512 MB RAM
- 200 MB storage
- Broadband internet

---

## 🧪 Test Your Setup

Before running the main app, verify everything works:

```bash
python3 test_connection.py
```

This will check:

- ✓ Python version
- ✓ Required modules
- ✓ Data connection
- ✓ UI components

---

## 🔧 Customization

### Easy Modifications

1. **Change refresh interval** (default: 60 seconds)

   - Edit `main.py`, line ~35

2. **Modify colors** (Windows XP theme)

   - Edit `main.py`, color dictionary

3. **Add more stocks**

   - Edit `data_fetcher.py`, stock lists

4. **Add new sections**
   - See `PROJECT_STRUCTURE.md` for guide

---

## 📦 Build Size Information

### Source Code

- **Size:** ~30 KB
- **Files:** 3 Python files

### With Dependencies

- **Size:** ~90 MB
- **Components:**
  - yfinance (~15 MB)
  - pandas (~40 MB)
  - requests (~2 MB)
  - Dependencies (~33 MB)

### Standalone Executable

- **Size:** 60-90 MB (varies by platform)
- **Build:** `python build.py` or `pyinstaller --onefile --windowed main.py`
- **No Python required** for end users
- **See:** [BUILD_GUIDE.md](BUILD_GUIDE.md) for detailed instructions

---

## 🌐 Data Sources

### Yahoo Finance (Free)

- ✅ No API key needed
- ✅ Real-time data (15-min delay)
- ✅ Historical data
- ✅ No rate limits (reasonable use)

### What's Tracked

- 3 major indices (Nifty, Sensex, BankNifty)
- 30+ Nifty stocks
- 10 sectoral indices
- India VIX

---

## 🔄 Auto-Refresh

The app automatically updates every **60 seconds**:

- Market data
- Gainers/Losers
- Sectoral performance
- VIX and sentiment

**Manual refresh:** Click the **"🔄 Refresh Now"** button

---

## 📱 User Interface

### Navigation

- **Scroll:** Mouse wheel or scrollbar
- **Resize:** Window is fully resizable
- **Minimum size:** 1000×700 pixels
- **Recommended:** 1200×800 or larger

### Sections (Top to Bottom)

1. Header with title and refresh button
2. Market Summary
3. Index Tickers (3 cards)
4. Gainers & Losers (2 columns)
5. VIX & Greed Meter (2 columns)
6. Sectoral Performance (bars)
7. Footer with last update time

---

## ⚠️ Important Notes

### Market Hours

- **Open:** Monday-Friday, 9:15 AM - 3:30 PM IST
- **Closed:** Weekends and holidays
- App works outside hours but shows last available data

### Internet Required

- App needs internet to fetch data
- ~1-2 MB per refresh
- Works on slow connections

### Free Data Disclaimer

- Data is delayed ~15 minutes (Yahoo Finance free tier)
- For informational purposes only
- Not for real-time trading decisions

---

## 🎯 Use Cases

### Perfect For:

- 📊 Market monitoring
- 📈 Learning about stocks
- 💼 Portfolio tracking
- 🎓 Educational purposes
- 📱 Quick market checks

### Not Suitable For:

- ❌ Real-time day trading
- ❌ Professional trading (use paid terminals)
- ❌ Regulated financial advice

---

## 🤝 Contributing

Want to improve Bazaar? Great!

### Ideas for Contributions:

- Add new sections (News, Charts, etc.)
- Improve UI design
- Optimize data fetching
- Add more indicators
- Create themes
- Fix bugs
- Improve documentation

### How to Contribute:

1. Fork the project
2. Create your feature
3. Test thoroughly
4. Submit for review

---

## 🐛 Troubleshooting

### Quick Fixes

**App won't start?**

```bash
python3 test_connection.py
```

**Data not loading?**

- Check internet connection
- Try manual refresh
- Wait a moment (API might be busy)

**UI looks wrong?**

- Linux: `sudo apt install python3-tk`
- Resize the window

**Dependencies missing?**

```bash
pip install -r requirements.txt
```

---

## 📞 Need Help?

### Resources

1. **QUICKSTART.md** - Fast setup guide
2. **README.md** - Complete documentation
3. **INSTALLATION.md** - Platform-specific help
4. **test_connection.py** - Diagnostic tool

### Common Questions

**Q: Is this free?**
A: Yes! 100% free and open-source.

**Q: Do I need an API key?**
A: No! Yahoo Finance API is free to use.

**Q: Can I use this for trading?**
A: It's for informational/educational purposes. Data is delayed ~15 minutes.

**Q: Does it work offline?**
A: No, internet is required for fetching data.

**Q: Can I customize it?**
A: Yes! It's designed to be easily modifiable.

---

## 🎓 Learning Resources

### Understanding the Code

- **main.py** - Application structure
- **data_fetcher.py** - API integration
- **ui_components.py** - UI sections

### Adding Features

See **PROJECT_STRUCTURE.md** for:

- Architecture overview
- Adding new sections
- Customization guide

---

## 📈 What's Next?

### Version 1.1 (Planned)

- Historical charts
- Export to CSV
- Custom watchlist
- More themes

### Version 2.0 (Future)

- Technical indicators
- News integration
- Advanced analytics
- Mobile version?

---

## 🙏 Acknowledgments

### Built With

- **Python** - Programming language
- **tkinter** - GUI framework
- **yfinance** - Market data API
- **pandas** - Data processing

### Inspired By

- Windows XP - Classic UI design
- Stock market enthusiasts
- Open-source community

---

## 📜 License & Disclaimer

### License

Free and open-source. Use, modify, and distribute freely.

### Disclaimer

⚠️ **This application is for informational and educational purposes only.**

- Stock market data is provided as-is
- No guarantees of accuracy or completeness
- Not financial advice
- Do not use as sole basis for investment decisions
- Always consult qualified financial advisors

**The creators are not liable for any losses or damages arising from use of this application.**

---

## 🎉 Ready to Start?

### Run Now:

**Windows:**

```cmd
scripts\scripts\run.bat
```

**macOS/Linux:**

```bash
./scripts/run.sh
```

Or:

```bash
python3 main.py
```

---

## 📧 Feedback

Found a bug? Have a suggestion? Want to contribute?

We'd love to hear from you!

---

**Happy Trading! 📈💰**

_"The stock market is filled with individuals who know the price of everything, but the value of nothing." - Philip Fisher_

---

**Version 1.0.0** | October 2025 | Made with ❤️ for the trading community
