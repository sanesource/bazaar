# ✨ Features Overview

## Application Interface

Bazaar features a clean, light-inspired interface with the following sections:

---

## 📊 1. Market Summary

**What it shows:**

- Current market status (OPEN/CLOSED)
- Quick snapshot of all major indices
- Today's performance at a glance

**Example Display:**

```
Market Status: OPEN
Today's Performance: NIFTY50 ▲ 0.85% | SENSEX ▲ 0.92% | BANKNIFTY ▼ 0.23%
```

---

## 📈 2. Index Tickers

**What it shows:**

- Real-time data for three major indices
- Large, easy-to-read cards for each index

**Information displayed:**

- Current price
- Change amount and percentage
- Open, High, Low values
- Visual indicators (▲ for gains, ▼ for losses)
- Color-coded (Green for positive, Red for negative)

**Indices covered:**

1. **NIFTY 50** - India's benchmark stock index
2. **BANK NIFTY** - Banking sector index
3. **SENSEX 30** - BSE's 30-stock index

---

## 🔥 3. Top Gainers & Losers

**What it shows:**

- Top 10 stocks with highest gains
- Top 10 stocks with biggest losses
- Filterable by index

**Features:**

- **Dropdown filter** to select index (NIFTY50, SENSEX, BANKNIFTY)
- Side-by-side comparison of gainers vs losers
- Displays: Symbol, Price, % Change
- Color-coded performance indicators

**Example:**

```
Top Gainers              Top Losers
RELIANCE  ₹2,450  ▲3.2%  ITC      ₹425  ▼2.8%
TCS       ₹3,680  ▲2.9%  WIPRO    ₹480  ▼2.3%
...                      ...
```

---

## 😰 4. Market Sentiment

### India VIX (Volatility Index)

- Shows market volatility
- Higher VIX = More fear/uncertainty
- Lower VIX = More stability

### Market Greed Meter

- **Custom indicator** (0-100 scale)
- Combines VIX and market movement
- Visual color coding:
  - 🔴 **0-25**: Extreme Fear
  - 🟠 **25-45**: Fear
  - 🟡 **45-55**: Neutral
  - 🟢 **55-75**: Greed
  - 💚 **75-100**: Extreme Greed

**Why it matters:**

- Helps gauge overall market sentiment
- Useful for contrarian investing
- Historical indicator: "Be fearful when others are greedy, greedy when others are fearful"

---

## 🏭 5. Sectoral Performance

**What it shows:**

- Performance of 10 major market sectors
- Visual bar chart representation
- Sorted by performance (best to worst)

**Sectors tracked:**

1. **IT** - Information Technology
2. **Bank** - Banking & Financial Services
3. **Auto** - Automobile
4. **Pharma** - Pharmaceuticals
5. **Metal** - Metals & Mining
6. **FMCG** - Fast-Moving Consumer Goods
7. **Realty** - Real Estate
8. **Energy** - Energy & Oil
9. **Infra** - Infrastructure
10. **Media** - Media & Entertainment

**Display format:**

- Horizontal bars showing relative performance
- Green bars for positive performance
- Red bars for negative performance
- Percentage change displayed

---

## 🔄 Auto-Refresh

- Automatically updates every **60 seconds**
- Keeps data fresh during market hours
- Manual refresh button available
- Shows "Last Updated" timestamp

---

## 🎨 Light Theme

**Design elements:**

- Classic Windows beige background (#ECE9D8)
- Blue title bars (#0054E3)
- Raised/sunken borders
- Tahoma font family
- Button styling reminiscent of classic interfaces
- Familiar, comfortable interface

---

## 🖱️ User Interaction

### Mouse Controls

- **Scroll wheel**: Navigate through sections
- **Click**: Interact with buttons and dropdowns
- **Resize**: Window is resizable (minimum 1000x700)

### Interactive Elements

- **🔄 Refresh Now** button: Manual data refresh
- **Index dropdown**: Filter gainers/losers by index
- **Scrollbar**: Navigate when content exceeds window height

---

## 📱 Responsive Design

- Adapts to different window sizes
- Minimum size: 1000x700 pixels
- Recommended: 1200x800 pixels or larger
- All sections remain accessible via scrolling

---

## 🌐 Data Sources

All data is sourced from **Yahoo Finance** via the `yfinance` library:

- ✅ Completely free
- ✅ No API key required
- ✅ Real-time data (with ~15 min delay for free tier)
- ✅ Historical data available
- ✅ Reliable and widely used

---

## ⚡ Performance

- **Lightweight**: ~50-100 MB with dependencies
- **Fast startup**: < 3 seconds
- **Low CPU usage**: Minimal resource consumption
- **Memory efficient**: ~100-150 MB RAM usage
- **Cross-platform**: Works identically on Windows/macOS/Linux

---

## 🔮 Future Enhancement Ideas

Want to contribute? Here are some ideas:

1. **Charts & Graphs**

   - Historical price charts
   - Candlestick charts
   - Volume indicators

2. **More Data**

   - Stock news feed
   - Dividend information
   - Corporate actions
   - FII/DII data

3. **Alerts**

   - Price alerts
   - Volatility alerts
   - Custom notifications

4. **Watchlist**

   - Personal stock watchlist
   - Portfolio tracking
   - P&L calculations

5. **Technical Indicators**

   - RSI, MACD, Moving Averages
   - Support/Resistance levels
   - Fibonacci retracements

6. **Export Features**
   - CSV export
   - PDF reports
   - Screenshot capture

---

## 🎯 Use Cases

**Day Traders:**

- Quick market overview
- Real-time price tracking
- Sector rotation analysis

**Investors:**

- Market sentiment gauge
- Sector performance comparison
- Long-term trend observation

**Market Enthusiasts:**

- Educational tool
- Market monitoring
- Pattern recognition

**Students:**

- Learn about stock markets
- Understand indices
- Study market behavior

---

**Enjoy exploring the markets! 📈**
