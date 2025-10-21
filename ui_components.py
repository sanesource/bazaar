"""
UI Components module containing all display sections
Each section is modular and can be easily extended or modified
"""

import tkinter as tk
from tkinter import ttk
from typing import Dict


class BaseSection:
    """Base class for all UI sections"""
    
    def __init__(self, parent, colors: Dict, data_fetcher, title: str):
        self.parent = parent
        self.colors = colors
        self.data_fetcher = data_fetcher
        self.title = title
        self.is_updating = False
        
        # Create section frame with double buffering
        self.frame = tk.Frame(parent, bg=self.colors['bg'], relief=tk.GROOVE, bd=2)
        self.frame.pack(fill=tk.X, padx=5, pady=5)
        
        # Create header (persistent, pixel-stable, and flat to avoid distortion)
        self.header = tk.Frame(
            self.frame,
            bg=self.colors['header'],
            relief=tk.FLAT,
            bd=0,
            highlightthickness=0,
            height=28
        )
        self.header.pack(fill=tk.X)
        # Fix height to prevent jitter during layout changes
        self.header.pack_propagate(False)
        
        self.header_label = tk.Label(
            self.header,
            text=self.title,
            font=('Tahoma', 10, 'bold'),
            bg=self.colors['header'],
            fg=self.colors['header_text'],
            pady=5,
            highlightthickness=0
        )
        self.header_label.pack()

        # Crisp 1px bottom border to visually separate header from content
        self.header_bottom_border = tk.Frame(self.header, bg=self.colors['border'], height=1)
        self.header_bottom_border.pack(fill=tk.X, side=tk.BOTTOM)
        
        # Content frame (will be replaced atomically to avoid flicker)
        self.content_frame = tk.Frame(self.frame, bg=self.colors['bg'])
        self.content_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
    
    def update(self):
        """Override this method in subclasses"""
        pass
    
    def clear_content(self):
        """Clear all widgets from content frame (legacy path)."""
        if self.is_updating:
            return
        self.is_updating = True
        try:
            for widget in self.content_frame.winfo_children():
                widget.destroy()
        finally:
            self.is_updating = False

    def render_content(self, build_fn):
        """Build content in an offscreen frame, then swap atomically to reduce flicker."""
        if self.is_updating:
            return
        self.is_updating = True
        try:
            new_content = tk.Frame(self.frame, bg=self.colors['bg'])
            # Build new content without disturbing current one
            build_fn(new_content)
            # Swap frames
            try:
                self.content_frame.pack_forget()
            except Exception:
                pass
            new_content.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
            old_content = self.content_frame
            self.content_frame = new_content
            # Destroy old content after idle to avoid visible tearing
            try:
                old_content.after_idle(old_content.destroy)
            except Exception:
                try:
                    old_content.destroy()
                except Exception:
                    pass
        finally:
            self.is_updating = False
    
    def show_loading(self):
        """Display loading state using atomic content swap."""
        def build(parent):
            loading_frame = tk.Frame(parent, bg=self.colors['bg'])
            loading_frame.pack(expand=True, pady=20)
            tk.Label(
                loading_frame,
                text="⏳ Loading...",
                font=('Tahoma', 10),
                bg=self.colors['bg'],
                fg='#666666'
            ).pack()
        self.render_content(build)
    
    def show_error(self, error_message: str = "Failed to load data"):
        """Display error state using atomic content swap."""
        def build(parent):
            error_frame = tk.Frame(parent, bg=self.colors['bg'])
            error_frame.pack(expand=True, pady=20)
            tk.Label(
                error_frame,
                text="❌ Error",
                font=('Tahoma', 11, 'bold'),
                bg=self.colors['bg'],
                fg=self.colors['negative']
            ).pack()
            tk.Label(
                error_frame,
                text=error_message,
                font=('Tahoma', 9),
                bg=self.colors['bg'],
                fg='#666666',
                wraplength=400
            ).pack(pady=(5, 0))
        self.render_content(build)


class MarketSummarySection(BaseSection):
    """Market Summary Section - displays overall market status"""
    
    def __init__(self, parent, colors, data_fetcher):
        super().__init__(parent, colors, data_fetcher, "📊 Market Summary")
    
    def update(self):
        """Update market summary data"""
        self.clear_content()
        
        summary = self.data_fetcher.get_market_summary()
        
        # Market Status
        status = summary.get('market_status', 'UNKNOWN')
        status_color = '#00AA00' if status == 'OPEN' else '#CC0000'
        
        status_frame = tk.Frame(self.content_frame, bg=self.colors['bg'])
        status_frame.pack(fill=tk.X, pady=(0, 10))
        
        tk.Label(
            status_frame,
            text="Market Status:",
            font=('Tahoma', 9, 'bold'),
            bg=self.colors['bg']
        ).pack(side=tk.LEFT)
        
        tk.Label(
            status_frame,
            text=f" {status}",
            font=('Tahoma', 9, 'bold'),
            bg=self.colors['bg'],
            fg=status_color
        ).pack(side=tk.LEFT)
        
        # Quick summary of main indices
        summary_text = "Today's Performance: "
        
        for idx in ['NIFTY50', 'SENSEX', 'BANKNIFTY']:
            if idx in summary:
                data = summary[idx]
                change_pct = data['change_pct']
                arrow = "▲" if change_pct >= 0 else "▼"
                summary_text += f"{idx} {arrow} {abs(change_pct):.2f}%  |  "
        
        summary_label = tk.Label(
            self.content_frame,
            text=summary_text.rstrip(' | '),
            font=('Tahoma', 9),
            bg=self.colors['bg'],
            wraplength=1100,
            justify=tk.LEFT
        )
        summary_label.pack(fill=tk.X)


class TickerSection(BaseSection):
    """Ticker Section - displays Nifty50, BankNifty, and Sensex"""
    
    def __init__(self, parent, colors, data_fetcher):
        super().__init__(parent, colors, data_fetcher, "📈 Index Tickers")
    
    def update(self):
        """Update ticker data"""
        # Don't show individual loading - global loader handles this
        try:
            indices = ['NIFTY50', 'BANKNIFTY', 'SENSEX']
            items = []
            for i, index in enumerate(indices):
                data = self.data_fetcher.get_index_data(index)
                if data:
                    items.append((i, data))
            if not items:
                self.show_error("Unable to fetch index data. Please check your connection.")
                return
            def build(parent):
                ticker_container = tk.Frame(parent, bg=self.colors['bg'])
                ticker_container.pack(fill=tk.BOTH, expand=True)
                for i, data in items:
                    self.create_ticker_card(ticker_container, data, i)
            self.render_content(build)
        except Exception as e:
            self.show_error(f"Error loading tickers: {str(e)}")
    
    def create_ticker_card(self, parent, data: Dict, column: int):
        """Create a ticker display card"""
        card = tk.Frame(parent, bg=self.colors['text_bg'], relief=tk.SUNKEN, bd=2)
        card.grid(row=0, column=column, padx=10, pady=5, sticky='ew')
        parent.grid_columnconfigure(column, weight=1)
        
        # Index name
        tk.Label(
            card,
            text=data['name'],
            font=('Tahoma', 11, 'bold'),
            bg=self.colors['text_bg']
        ).pack(pady=(10, 5))
        
        # Price
        tk.Label(
            card,
            text=f"{data['price']:.2f}",
            font=('Tahoma', 16, 'bold'),
            bg=self.colors['text_bg']
        ).pack()
        
        # Change
        change = data['change']
        change_pct = data['change_pct']
        color = self.colors['positive'] if change >= 0 else self.colors['negative']
        arrow = "▲" if change >= 0 else "▼"
        
        tk.Label(
            card,
            text=f"{arrow} {abs(change):.2f} ({abs(change_pct):.2f}%)",
            font=('Tahoma', 10, 'bold'),
            bg=self.colors['text_bg'],
            fg=color
        ).pack(pady=(5, 10))
        
        # Additional info
        info_frame = tk.Frame(card, bg=self.colors['text_bg'])
        info_frame.pack(fill=tk.X, padx=10, pady=(0, 10))
        
        info_text = f"Open: {data['open']:.2f}  |  High: {data['high']:.2f}  |  Low: {data['low']:.2f}"
        tk.Label(
            info_frame,
            text=info_text,
            font=('Tahoma', 8),
            bg=self.colors['text_bg'],
            fg='#666666'
        ).pack()


class GainersLosersSection(BaseSection):
    """Top Gainers and Losers Section"""
    
    def __init__(self, parent, colors, data_fetcher):
        super().__init__(parent, colors, data_fetcher, "🔥 Top Gainers & Losers")
        self.selected_index = tk.StringVar(value='NIFTY50')
        self.selected_time_period = tk.StringVar(value='1D')
        self.selector_frame = None
        self.data_frame = None
        self.loading_label = None  # Store loading label reference
        # Fixed data area height to avoid layout jumps between loading and content
        self.fixed_data_height = 320  # pixels, sized for 10 rows per list
    
    def update(self):
        """Update gainers and losers data"""
        # First time setup - create persistent selector
        if self.selector_frame is None:
            self.selector_frame = tk.Frame(self.content_frame, bg=self.colors['bg'])
            self.selector_frame.pack(fill=tk.X, pady=(0, 10))
            
            # Index selector
            tk.Label(
                self.selector_frame,
                text="Select Index:",
                font=('Tahoma', 9, 'bold'),
                bg=self.colors['bg']
            ).pack(side=tk.LEFT, padx=(0, 5))
            
            index_dropdown = ttk.Combobox(
                self.selector_frame,
                textvariable=self.selected_index,
                values=['NIFTY50', 'NIFTYNEXT50', 'SENSEX', 'BANKNIFTY', 'MIDCAP100', 'SMALLCAP250'],
                state='readonly',
                width=18,
                font=('Tahoma', 8),
                cursor='hand2'
            )
            index_dropdown.pack(side=tk.LEFT)
            index_dropdown.bind('<<ComboboxSelected>>', lambda e: self.update_data())
            
            # Time period selector
            tk.Label(
                self.selector_frame,
                text="Time:",
                font=('Tahoma', 9, 'bold'),
                bg=self.colors['bg']
            ).pack(side=tk.LEFT, padx=(20, 5))
            
            time_dropdown = ttk.Combobox(
                self.selector_frame,
                textvariable=self.selected_time_period,
                values=['1D', '1Week', '1Month', '6Months', '1Year'],
                state='readonly',
                width=12,
                font=('Tahoma', 8),
                cursor='hand2'
            )
            time_dropdown.pack(side=tk.LEFT)
            time_dropdown.bind('<<ComboboxSelected>>', lambda e: self.update_data())
        
        # Create data frame for first time
        if self.data_frame is None:
            self.data_frame = tk.Frame(self.content_frame, bg=self.colors['bg'], height=self.fixed_data_height)
            self.data_frame.pack(fill=tk.BOTH, expand=False)
            # Keep the fixed pixel height regardless of children
            self.data_frame.pack_propagate(False)
        
        # Update the data
        self.update_data()
    
    def update_data(self):
        """Update only the data, keeping the selector"""
        # Clear only the data frame
        if self.data_frame:
            for widget in self.data_frame.winfo_children():
                widget.destroy()
        
        # Show inline loading indicator (doesn't cause layout shift due to fixed height)
        self.loading_label = tk.Label(
            self.data_frame,
            text="⏳ Loading stocks...",
            font=('Tahoma', 10),
            bg=self.colors['bg'],
            fg='#666666'
        )
        self.loading_label.place(relx=0.5, rely=0.5, anchor='center')
        
        # Force UI update to show loading
        self.data_frame.update_idletasks()
        
        try:
            # Fetch data
            data = self.data_fetcher.get_gainers_losers(
                self.selected_index.get(), 
                time_period=self.selected_time_period.get(),
                limit=10
            )
            
            # Remove loading indicator
            if self.loading_label:
                self.loading_label.destroy()
                self.loading_label = None
            
            if not data['gainers'] and not data['losers']:
                error_label = tk.Label(
                    self.data_frame,
                    text="❌ No stock data available for this index.",
                    font=('Tahoma', 9),
                    bg=self.colors['bg'],
                    fg=self.colors['negative']
                )
                error_label.pack(pady=20)
                return
        
            # Create two columns: Gainers and Losers
            columns_frame = tk.Frame(self.data_frame, bg=self.colors['bg'])
            columns_frame.pack(fill=tk.BOTH, expand=True)
            
            # Gainers column
            gainers_frame = tk.Frame(columns_frame, bg=self.colors['bg'])
            gainers_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 5))
            
            tk.Label(
                gainers_frame,
                text="🟢 Top Gainers",
                font=('Tahoma', 9, 'bold'),
                bg=self.colors['bg'],
                fg=self.colors['positive']
            ).pack(pady=(0, 5))
            
            self.create_stock_list(gainers_frame, data['gainers'], is_gainers=True)
            
            # Losers column
            losers_frame = tk.Frame(columns_frame, bg=self.colors['bg'])
            losers_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(5, 0))
            
            tk.Label(
                losers_frame,
                text="🔴 Top Losers",
                font=('Tahoma', 9, 'bold'),
                bg=self.colors['bg'],
                fg=self.colors['negative']
            ).pack(pady=(0, 5))
            
            self.create_stock_list(losers_frame, data['losers'], is_gainers=False)
        
        except Exception as e:
            # Remove loading indicator if present
            if self.loading_label:
                try:
                    self.loading_label.destroy()
                    self.loading_label = None
                except:
                    pass
            
            # Show error in data frame
            error_label = tk.Label(
                self.data_frame,
                text=f"❌ Error loading stock data: {str(e)}",
                font=('Tahoma', 9),
                bg=self.colors['bg'],
                fg=self.colors['negative']
            )
            error_label.pack(pady=20)
    
    def create_stock_list(self, parent, stocks: list, is_gainers: bool):
        """Create a list of stocks"""
        list_frame = tk.Frame(parent, bg=self.colors['text_bg'], relief=tk.SUNKEN, bd=1)
        list_frame.pack(fill=tk.BOTH, expand=True)
        
        for i, stock in enumerate(stocks):
            bg_color = '#F8F8F8' if i % 2 == 0 else self.colors['text_bg']
            
            row_frame = tk.Frame(list_frame, bg=bg_color)
            row_frame.pack(fill=tk.X, pady=1)
            
            # Symbol
            tk.Label(
                row_frame,
                text=stock['symbol'],
                font=('Tahoma', 8, 'bold'),
                bg=bg_color,
                width=15,
                anchor='w'
            ).pack(side=tk.LEFT, padx=5, pady=3)
            
            # Price
            tk.Label(
                row_frame,
                text=f"₹{stock['price']:.2f}",
                font=('Tahoma', 8),
                bg=bg_color,
                width=12,
                anchor='e'
            ).pack(side=tk.LEFT, padx=5)
            
            # Change
            change_pct = stock['change_pct']
            color = self.colors['positive'] if change_pct >= 0 else self.colors['negative']
            arrow = "▲" if change_pct >= 0 else "▼"
            
            tk.Label(
                row_frame,
                text=f"{arrow} {abs(change_pct):.2f}%",
                font=('Tahoma', 8, 'bold'),
                bg=bg_color,
                fg=color,
                width=12,
                anchor='e'
            ).pack(side=tk.LEFT, padx=5)


class VixGreedSection(BaseSection):
    """VIX Index and Fear/Greed Meter Section"""
    
    def __init__(self, parent, colors, data_fetcher):
        super().__init__(parent, colors, data_fetcher, "😰 Market Sentiment")
    
    def update(self):
        """Update VIX and fear/greed data"""
        # Don't show individual loading - global loader handles this
        try:
            vix_data = self.data_fetcher.get_vix_data()
            greed_data = self.data_fetcher.get_fear_greed_index()
            def build(parent):
                columns_frame = tk.Frame(parent, bg=self.colors['bg'])
                columns_frame.pack(fill=tk.BOTH, expand=True)
                # VIX column
                vix_frame = tk.Frame(columns_frame, bg=self.colors['text_bg'], relief=tk.SUNKEN, bd=2)
                vix_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))
                tk.Label(
                    vix_frame,
                    text="India VIX (Volatility Index)",
                    font=('Tahoma', 10, 'bold'),
                    bg=self.colors['text_bg']
                ).pack(pady=(10, 5))
                if vix_data:
                    tk.Label(
                        vix_frame,
                        text=f"{vix_data['price']:.2f}",
                        font=('Tahoma', 20, 'bold'),
                        bg=self.colors['text_bg']
                    ).pack(pady=10)
                    change = vix_data['change']
                    change_pct = vix_data['change_pct']
                    color = self.colors['negative'] if change >= 0 else self.colors['positive']
                    arrow = "▲" if change >= 0 else "▼"
                    tk.Label(
                        vix_frame,
                        text=f"{arrow} {abs(change):.2f} ({abs(change_pct):.2f}%)",
                        font=('Tahoma', 10),
                        bg=self.colors['text_bg'],
                        fg=color
                    ).pack(pady=(0, 10))
                else:
                    tk.Label(
                        vix_frame,
                        text="Data unavailable",
                        font=('Tahoma', 10),
                        bg=self.colors['text_bg'],
                        fg='#666666'
                    ).pack(pady=20)
                # Fear/Greed meter column
                greed_frame = tk.Frame(columns_frame, bg=self.colors['text_bg'], relief=tk.SUNKEN, bd=2)
                greed_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
                tk.Label(
                    greed_frame,
                    text="Market Greed Meter",
                    font=('Tahoma', 10, 'bold'),
                    bg=self.colors['text_bg']
                ).pack(pady=(10, 5))
                score = greed_data['score']
                if score < 25:
                    meter_color = '#CC0000'
                elif score < 45:
                    meter_color = '#FF6600'
                elif score < 55:
                    meter_color = '#FFD700'
                elif score < 75:
                    meter_color = '#90EE90'
                else:
                    meter_color = '#00AA00'
                tk.Label(
                    greed_frame,
                    text=f"{score:.1f} / 100",
                    font=('Tahoma', 20, 'bold'),
                    bg=self.colors['text_bg'],
                    fg=meter_color
                ).pack(pady=10)
                tk.Label(
                    greed_frame,
                    text=greed_data['status'],
                    font=('Tahoma', 11, 'bold'),
                    bg=self.colors['text_bg'],
                    fg=meter_color
                ).pack(pady=(0, 10))
                legend_text = "0=Extreme Fear  25=Fear  50=Neutral  75=Greed  100=Extreme Greed"
                tk.Label(
                    greed_frame,
                    text=legend_text,
                    font=('Tahoma', 7),
                    bg=self.colors['text_bg'],
                    fg='#666666'
                ).pack(pady=(0, 10))
            self.render_content(build)
        except Exception as e:
            self.show_error(f"Error loading sentiment data: {str(e)}")


class SectoralPerformanceSection(BaseSection):
    """Sectoral Performance Section"""
    
    def __init__(self, parent, colors, data_fetcher):
        super().__init__(parent, colors, data_fetcher, "🏭 Sectoral Performance")
    
    def update(self):
        """Update sectoral performance data"""
        # Don't show individual loading - global loader handles this
        try:
            sectors = self.data_fetcher.get_sectoral_performance()
            if not sectors:
                self.show_error("No sectoral data available")
                return
            def build(parent):
                for i, sector in enumerate(sectors):
                    bg_color = '#F8F8F8' if i % 2 == 0 else self.colors['text_bg']
                    row_frame = tk.Frame(parent, bg=bg_color, relief=tk.FLAT)
                    row_frame.pack(fill=tk.X, pady=2)
                    tk.Label(
                        row_frame,
                        text=sector['sector'],
                        font=('Tahoma', 9, 'bold'),
                        bg=bg_color,
                        width=15,
                        anchor='w'
                    ).pack(side=tk.LEFT, padx=10, pady=5)
                    bar_container = tk.Frame(row_frame, bg=bg_color)
                    bar_container.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=10)
                    change_pct = sector['change_pct']
                    bar_color = self.colors['positive'] if change_pct >= 0 else self.colors['negative']
                    # Integer pixel alignment to avoid anti-aliased edges
                    bar_width = int(round(min(abs(change_pct) * 60, 300)))
                    canvas = tk.Canvas(bar_container, height=20, bg=bg_color, highlightthickness=0)
                    canvas.pack(fill=tk.X, expand=True)
                    center_x = 150  # integer center
                    top_y = 5
                    bottom_y = 15
                    if change_pct >= 0:
                        canvas.create_rectangle(center_x, top_y, center_x + bar_width, bottom_y, fill=bar_color, outline='')
                    else:
                        canvas.create_rectangle(center_x - bar_width, top_y, center_x, bottom_y, fill=bar_color, outline='')
                    canvas.create_line(center_x, 0, center_x, 20, fill='#888888', width=1)
                    arrow = "▲" if change_pct >= 0 else "▼"
                    tk.Label(
                        row_frame,
                        text=f"{arrow} {abs(change_pct):.2f}%",
                        font=('Tahoma', 9, 'bold'),
                        bg=bg_color,
                        fg=bar_color,
                        width=12,
                        anchor='e'
                    ).pack(side=tk.LEFT, padx=10)
            self.render_content(build)
        except Exception as e:
            self.show_error(f"Error loading sectoral data: {str(e)}")

