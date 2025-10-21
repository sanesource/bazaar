"""
Data fetcher module for retrieving Indian stock market data
Uses free APIs and libraries (yfinance, NSEpy alternatives)
"""

import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import requests
from typing import Dict, List, Optional


class DataFetcher:
    """Handles all data fetching operations for Indian stock market"""
    
    def __init__(self):
        # Indian market index symbols for yfinance
        self.indices = {
            'NIFTY50': '^NSEI',
            'BANKNIFTY': '^NSEBANK',
            'SENSEX': '^BSESN',
            'VIX': '^INDIAVIX'
        }
        
        # Sectoral indices
        self.sectors = {
            'IT': '^CNXIT',
            'Bank': '^NSEBANK',
            'Auto': '^CNXAUTO',
            'Pharma': '^CNXPHARMA',
            'Metal': '^CNXMETAL',
            'FMCG': '^CNXFMCG',
            'Realty': '^CNXREALTY',
            'Energy': '^CNXENERGY',
            'Infra': '^CNXINFRA',
            'Media': '^CNXMEDIA'
        }
        
        # Top stocks for gainers/losers tracking
        self.nifty50_stocks = [
            'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS',
            'ICICIBANK.NS', 'KOTAKBANK.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'ITC.NS',
            'LT.NS', 'AXISBANK.NS', 'ASIANPAINT.NS', 'MARUTI.NS', 'TITAN.NS',
            'BAJFINANCE.NS', 'SUNPHARMA.NS', 'WIPRO.NS', 'ULTRACEMCO.NS', 'NTPC.NS',
            'ONGC.NS', 'HCLTECH.NS', 'M&M.NS', 'POWERGRID.NS', 'TATAMOTORS.NS',
            'NESTLEIND.NS', 'DIVISLAB.NS', 'JSWSTEEL.NS', 'TECHM.NS', 'HINDALCO.NS'
        ]
        
        self.sensex_stocks = [
            'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
            'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS',
            'LT.NS', 'AXISBANK.NS', 'BAJFINANCE.NS', 'MARUTI.NS', 'ASIANPAINT.NS',
            'SUNPHARMA.NS', 'TITAN.NS', 'ULTRACEMCO.NS', 'NTPC.NS', 'M&M.NS',
            'WIPRO.NS', 'NESTLEIND.NS', 'POWERGRID.NS', 'HCLTECH.NS', 'TATAMOTORS.NS'
        ]
        
        self.banknifty_stocks = [
            'HDFCBANK.NS', 'ICICIBANK.NS', 'KOTAKBANK.NS', 'SBIN.NS', 'AXISBANK.NS',
            'INDUSINDBK.NS', 'BANKBARODA.NS', 'PNB.NS', 'IDFCFIRSTB.NS', 'BANDHANBNK.NS'
        ]
        
        # Nifty Next 50 stocks
        self.niftynext50_stocks = [
            'ADANIENT.NS', 'ADANIPORTS.NS', 'AMBUJACEM.NS', 'ATGL.NS', 'BAJAJFINSV.NS',
            'BANDHANBNK.NS', 'BEL.NS', 'BERGEPAINT.NS', 'BIOCON.NS', 'BOSCHLTD.NS',
            'CIPLA.NS', 'COLPAL.NS', 'DLF.NS', 'GAIL.NS', 'GODREJCP.NS',
            'GRASIM.NS', 'HAVELLS.NS', 'HINDPETRO.NS', 'ICICIGI.NS', 'INDIGO.NS',
            'INDUSINDBK.NS', 'NAUKRI.NS', 'NMDC.NS', 'PETRONET.NS', 'PIDILITIND.NS',
            'PNB.NS', 'SBILIFE.NS', 'SHREECEM.NS', 'SIEMENS.NS', 'TORNTPHARM.NS',
            'VEDL.NS', 'ZOMATO.NS', 'DMART.NS', 'HDFCLIFE.NS', 'BAJAJHLDNG.NS'
        ]
        
        # Midcap 100 stocks (representative sample)
        self.midcap_stocks = [
            'ABB.NS', 'AUBANK.NS', 'AUROPHARMA.NS', 'BALKRISIND.NS', 'BANDHANBNK.NS',
            'BATAINDIA.NS', 'BIOCON.NS', 'CHOLAFIN.NS', 'COFORGE.NS', 'CONCOR.NS',
            'CUMMINSIND.NS', 'DABUR.NS', 'DALBHARAT.NS', 'DEEPAKNTR.NS', 'ESCORTS.NS',
            'GAIL.NS', 'GLENMARK.NS', 'GODREJCP.NS', 'GODREJPROP.NS', 'HAVELLS.NS',
            'HINDPETRO.NS', 'ICICIPRULI.NS', 'IDFCFIRSTB.NS', 'INDHOTEL.NS', 'INDUSTOWER.NS',
            'JUBLFOOD.NS', 'LICHSGFIN.NS', 'LTI.NS', 'LUPIN.NS', 'MARICO.NS',
            'MCDOWELL-N.NS', 'MPHASIS.NS', 'MRF.NS', 'NAUKRI.NS', 'NMDC.NS',
            'OBEROIRLTY.NS', 'OFSS.NS', 'PAGEIND.NS', 'PEL.NS', 'PERSISTENT.NS',
            'PETRONET.NS', 'PFC.NS', 'PIDILITIND.NS', 'PIIND.NS', 'PNB.NS',
            'RECLTD.NS', 'SAIL.NS', 'SBICARD.NS', 'SBILIFE.NS', 'SRF.NS'
        ]
        
        # Smallcap 250 stocks (representative sample)
        self.smallcap_stocks = [
            'AAVAS.NS', 'ABSLAMC.NS', 'ALKEM.NS', 'ANGELONE.NS', 'APLLTD.NS',
            'ASTRAZEN.NS', 'ATUL.NS', 'BASF.NS', 'BAYERCROP.NS', 'BDL.NS',
            'BSOFT.NS', 'CANFINHOME.NS', 'CDSL.NS', 'CENTRALBK.NS', 'CHAMBLFERT.NS',
            'CLEAN.NS', 'CROMPTON.NS', 'CSBBANK.NS', 'DCM.NS', 'DELTACORP.NS',
            'DIXON.NS', 'EMAMILTD.NS', 'FEDERALBNK.NS', 'FINEORG.NS', 'FLUOROCHEM.NS',
            'GESHIP.NS', 'GLAXO.NS', 'GMMPFAUDLR.NS', 'GNFC.NS', 'GRINDWELL.NS',
            'GSPL.NS', 'GULFOILLUB.NS', 'HAPPSTMNDS.NS', 'HEG.NS', 'HEMIPROP.NS',
            'HONAUT.NS', 'IBREALEST.NS', 'IDFC.NS', 'IEX.NS', 'IIFL.NS',
            'INDIANB.NS', 'INDIAMART.NS', 'IRCON.NS', 'IRCTC.NS', 'JKCEMENT.NS',
            'JKLAKSHMI.NS', 'JMFINANCIL.NS', 'JSL.NS', 'KAJARIACER.NS', 'KEI.NS'
        ]
    
    def get_index_data(self, index_name: str) -> Optional[Dict]:
        """Fetch data for a specific index"""
        try:
            symbol = self.indices.get(index_name)
            if not symbol:
                return None
            
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period='5d')
            
            if hist.empty:
                return None
            
            current_price = hist['Close'].iloc[-1]
            prev_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
            change = current_price - prev_close
            change_pct = (change / prev_close) * 100 if prev_close else 0
            
            return {
                'name': index_name,
                'price': current_price,
                'change': change,
                'change_pct': change_pct,
                'high': hist['High'].iloc[-1],
                'low': hist['Low'].iloc[-1],
                'open': hist['Open'].iloc[-1],
                'volume': hist['Volume'].iloc[-1] if 'Volume' in hist.columns else 0
            }
        except Exception as e:
            print(f"Error fetching {index_name}: {e}")
            return None
    
    def get_market_summary(self) -> Dict:
        """Get overall market summary"""
        summary = {}
        
        # Get main indices
        for index in ['NIFTY50', 'BANKNIFTY', 'SENSEX']:
            data = self.get_index_data(index)
            if data:
                summary[index] = data
        
        # Add market status
        now = datetime.now()
        market_open = now.replace(hour=9, minute=15, second=0, microsecond=0)
        market_close = now.replace(hour=15, minute=30, second=0, microsecond=0)
        
        if now.weekday() < 5 and market_open <= now <= market_close:
            summary['market_status'] = 'OPEN'
        else:
            summary['market_status'] = 'CLOSED'
        
        return summary
    
    def get_gainers_losers(self, index: str = 'NIFTY50', time_period: str = '1D', limit: int = 10) -> Dict[str, List[Dict]]:
        """Get top gainers and losers for a given index and time period"""
        try:
            # Select stocks based on index
            if index == 'NIFTY50':
                stocks = self.nifty50_stocks
            elif index == 'SENSEX':
                stocks = self.sensex_stocks
            elif index == 'BANKNIFTY':
                stocks = self.banknifty_stocks
            elif index == 'NIFTYNEXT50':
                stocks = self.niftynext50_stocks
            elif index == 'MIDCAP100':
                stocks = self.midcap_stocks
            elif index == 'SMALLCAP250':
                stocks = self.smallcap_stocks
            else:
                stocks = self.nifty50_stocks
            
            # Map time period to yfinance period and determine lookback
            period_map = {
                '1D': ('5d', 1),      # Fetch 5 days, compare last 2
                '1Week': ('1mo', 5),  # Fetch 1 month, compare 1 week back (5 trading days)
                '1Month': ('3mo', 21), # Fetch 3 months, compare 1 month back (~21 trading days)
                '6Months': ('1y', 126), # Fetch 1 year, compare 6 months back (~126 trading days)
                '1Year': ('2y', 252)    # Fetch 2 years, compare 1 year back (~252 trading days)
            }
            
            yf_period, lookback_days = period_map.get(time_period, ('5d', 1))
            
            stock_data = []
            
            for symbol in stocks[:30]:  # Limit to avoid rate limiting
                try:
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period=yf_period)
                    
                    if len(hist) >= lookback_days + 1:
                        current = hist['Close'].iloc[-1]
                        # For 1D, compare to previous day; for others, compare to N days ago
                        if time_period == '1D' and len(hist) >= 2:
                            prev = hist['Close'].iloc[-2]
                        else:
                            # Get the closing price from lookback_days ago
                            prev = hist['Close'].iloc[-(lookback_days + 1)]
                        
                        change_pct = ((current - prev) / prev) * 100
                        
                        stock_data.append({
                            'symbol': symbol.replace('.NS', ''),
                            'price': current,
                            'change_pct': change_pct
                        })
                except Exception as e:
                    continue
            
            # Sort by change percentage
            stock_data.sort(key=lambda x: x['change_pct'], reverse=True)
            
            gainers = stock_data[:limit]
            losers = stock_data[-limit:][::-1]  # Reverse to show biggest losers first
            
            return {'gainers': gainers, 'losers': losers}
        
        except Exception as e:
            print(f"Error fetching gainers/losers: {e}")
            return {'gainers': [], 'losers': []}
    
    def get_vix_data(self) -> Optional[Dict]:
        """Get India VIX data"""
        return self.get_index_data('VIX')
    
    def get_fear_greed_index(self) -> Dict:
        """
        Calculate a simple fear & greed indicator based on VIX and market movement
        This is a simplified version as there's no official free API for India
        """
        try:
            vix_data = self.get_vix_data()
            nifty_data = self.get_index_data('NIFTY50')
            
            if not vix_data or not nifty_data:
                return {'score': 50, 'status': 'NEUTRAL'}
            
            # Simple calculation:
            # VIX < 15: Greed, VIX > 25: Fear
            # Nifty positive: +ve sentiment, negative: -ve sentiment
            
            vix_score = max(0, min(100, (25 - vix_data['price']) * 2 + 50))
            market_score = 50 + (nifty_data['change_pct'] * 5)
            market_score = max(0, min(100, market_score))
            
            final_score = (vix_score * 0.6 + market_score * 0.4)
            
            if final_score < 25:
                status = 'EXTREME FEAR'
            elif final_score < 45:
                status = 'FEAR'
            elif final_score < 55:
                status = 'NEUTRAL'
            elif final_score < 75:
                status = 'GREED'
            else:
                status = 'EXTREME GREED'
            
            return {
                'score': round(final_score, 1),
                'status': status,
                'vix': vix_data['price']
            }
        
        except Exception as e:
            print(f"Error calculating fear/greed: {e}")
            return {'score': 50, 'status': 'NEUTRAL', 'vix': 0}
    
    def get_sectoral_performance(self) -> List[Dict]:
        """Get performance of various sectors"""
        sectoral_data = []
        
        for sector_name, symbol in self.sectors.items():
            try:
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period='5d')
                
                if len(hist) >= 2:
                    current = hist['Close'].iloc[-1]
                    prev = hist['Close'].iloc[-2]
                    change_pct = ((current - prev) / prev) * 100
                    
                    sectoral_data.append({
                        'sector': sector_name,
                        'price': current,
                        'change_pct': change_pct
                    })
            except Exception as e:
                continue
        
        # Sort by performance
        sectoral_data.sort(key=lambda x: x['change_pct'], reverse=True)
        
        return sectoral_data

