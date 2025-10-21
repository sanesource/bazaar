# Time Filter Feature for Top Gainers/Losers

## Overview

Added a time-based filter dropdown to the Top Gainers & Losers section, allowing users to view stock performance over different time periods.

## Features Added

### UI Components (`ui_components.py`)

- Added a new dropdown selector labeled "Time:" next to the existing "Select Index:" dropdown
- Time period options available:
  - **1D** - 1 Day (daily change)
  - **1Week** - 1 Week (5 trading days)
  - **1Month** - 1 Month (~21 trading days)
  - **6Months** - 6 Months (~126 trading days)
  - **1Year** - 1 Year (~252 trading days)

### Data Fetcher (`data_fetcher.py`)

- Modified `get_gainers_losers()` method to accept a `time_period` parameter
- Implemented intelligent period mapping for yfinance API:
  - `1D`: Fetches 5 days of data, compares last 2 days
  - `1Week`: Fetches 1 month of data, compares 5 trading days back
  - `1Month`: Fetches 3 months of data, compares 21 trading days back
  - `6Months`: Fetches 1 year of data, compares 126 trading days back
  - `1Year`: Fetches 2 years of data, compares 252 trading days back

## Usage

1. Launch the Bazaar application
2. Navigate to the "🔥 Top Gainers & Losers" section
3. Select an index from the "Select Index:" dropdown (NIFTY50, SENSEX, etc.)
4. Select a time period from the "Time:" dropdown (1D, 1Week, 1Month, 6Months, 1Year)
5. The results will automatically update to show top gainers/losers for that time range

## Technical Details

### Calculation Method

- The system fetches historical price data for each stock in the selected index
- It compares the current closing price with the closing price from N trading days ago
- Percentage change is calculated as: `((current - previous) / previous) * 100`
- Stocks are sorted by change percentage to identify top gainers and losers

### Performance Considerations

- Limited to first 30 stocks per index to avoid API rate limiting
- Results are cached during each refresh cycle
- Data fetching is done in a background thread to prevent UI freezing

## Benefits

- Provides a comprehensive view of stock performance across different time horizons
- Helps identify both short-term momentum and long-term trends
- Useful for different trading strategies (day trading vs. long-term investing)
- All data is fetched from free, publicly available sources (yfinance)

## Example Results

```
NIFTY50 - 1 Year Performance:
Top Gainer: BAJFINANCE (+57.15%)
Top Loser: TATAMOTORS (-55.34%)

NIFTY50 - 1 Day Performance:
Top Gainer: AXISBANK (+0.92%)
Top Loser: KOTAKBANK (-0.76%)
```

## Future Enhancements

Potential improvements for future versions:

- Add custom date range selection
- Export data to CSV/Excel
- Chart visualization of performance over time
- Performance comparison charts
- Historical trend analysis
