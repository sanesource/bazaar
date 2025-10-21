#!/usr/bin/env python3
"""
Bazaar - Indian Stock Market Information Display
A Windows XP-styled GUI application for real-time Indian stock market data
"""

import tkinter as tk
from tkinter import ttk
import threading
import time
from datetime import datetime
from data_fetcher import DataFetcher
from ui_components import (
    TickerSection,
    GainersLosersSection,
    VixGreedSection,
    SectoralPerformanceSection
)


class BazaarApp:
    """Main application class for the stock market information display"""
    
    def __init__(self, root):
        self.root = root
        self.root.title("Bazaar - Indian Stock Market")
        self.root.geometry("1200x800")
        self.root.minsize(1000, 700)
        
        # Initialize data fetcher
        self.data_fetcher = DataFetcher()
        
        # Apply Windows XP theme
        self.apply_winxp_theme()
        
        # Create UI
        self.create_ui()
        
        # Start auto-refresh
        self.is_running = True
        self.refresh_interval = 60  # seconds
        self.start_auto_refresh()
        
        # Handle window close
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
    
    def apply_winxp_theme(self):
        """Apply Windows XP-style theme colors and fonts"""
        # Windows XP Classic colors
        self.colors = {
            'bg': '#ECE9D8',  # Classic Windows beige
            'fg': '#000000',  # Black text
            'button': '#D4D0C8',  # Button gray
            'button_hover': '#E8E4D8',
            'header': '#0054E3',  # Windows XP blue
            'header_text': '#FFFFFF',
            'border': '#7A96DF',
            'positive': '#00AA00',  # Green for gains
            'negative': '#CC0000',  # Red for losses
            'text_bg': '#FFFFFF',
        }
        
        self.root.configure(bg=self.colors['bg'])
        
        # Configure styles
        style = ttk.Style()
        style.theme_use('clam')  # Base theme closest to Windows XP
        
        # Configure ttk widgets
        style.configure('TFrame', background=self.colors['bg'])
        style.configure('TLabel', background=self.colors['bg'], foreground=self.colors['fg'])
        style.configure('Header.TLabel', background=self.colors['header'], 
                       foreground=self.colors['header_text'], font=('Tahoma', 11, 'bold'))
        style.configure('Title.TLabel', font=('Tahoma', 9, 'bold'))
        style.configure('TButton', background=self.colors['button'], 
                       foreground=self.colors['fg'], font=('Tahoma', 8))
    
    def create_ui(self):
        """Create the main user interface"""
        # Create loading overlay (absolute positioned, hidden by default)
        self.create_loading_overlay()
        
        # Main container with scrollbar
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Canvas for scrolling
        self.canvas = tk.Canvas(main_frame, bg=self.colors['bg'], highlightthickness=0)
        scrollbar = ttk.Scrollbar(main_frame, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = ttk.Frame(self.canvas)
        
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )
        
        # Create window and make it stretch to canvas width
        self.canvas_window = self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=scrollbar.set)
        
        # Bind canvas resize to update scrollable frame width
        def on_canvas_configure(event):
            self.canvas.itemconfig(self.canvas_window, width=event.width)
        self.canvas.bind("<Configure>", on_canvas_configure)
        
        self.canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Enable mouse wheel scrolling (cross-platform)
        def _on_mousewheel(event):
            # Windows and MacOS
            if event.delta:
                self.canvas.yview_scroll(int(-1*(event.delta/120)), "units")
            # Linux
            elif event.num == 4:
                self.canvas.yview_scroll(-1, "units")
            elif event.num == 5:
                self.canvas.yview_scroll(1, "units")
        
        # Bind for Windows/MacOS
        self.canvas.bind_all("<MouseWheel>", _on_mousewheel)
        # Bind for Linux
        self.canvas.bind_all("<Button-4>", _on_mousewheel)
        self.canvas.bind_all("<Button-5>", _on_mousewheel)
        
        # Header
        self.create_header()
        
        # Initialize sections (modular design for easy extension)
        self.sections = []
        
        # 1. Tickers (Nifty50, BankNifty, Sensex30)
        self.ticker_section = TickerSection(
            self.scrollable_frame, self.colors, self.data_fetcher
        )
        self.sections.append(self.ticker_section)
        
        # 2. Top Gainers and Losers
        self.gainers_losers = GainersLosersSection(
            self.scrollable_frame, self.colors, self.data_fetcher
        )
        self.sections.append(self.gainers_losers)
        
        # 3. VIX and Greed Meter
        self.vix_greed = VixGreedSection(
            self.scrollable_frame, self.colors, self.data_fetcher
        )
        self.sections.append(self.vix_greed)
        
        # 4. Sectoral Performance
        self.sectoral_performance = SectoralPerformanceSection(
            self.scrollable_frame, self.colors, self.data_fetcher
        )
        self.sections.append(self.sectoral_performance)
        
        # Footer with last update time
        self.create_footer()
        
        # Initial data load - schedule after UI is fully created
        self.root.after(100, self.refresh_data)
    
    def create_header(self):
        """Create the header section"""
        header_frame = tk.Frame(self.scrollable_frame, bg=self.colors['header'], 
                               relief=tk.RAISED, bd=2)
        header_frame.pack(fill=tk.X, padx=2, pady=2)
        
        # Title on the left
        title_label = tk.Label(
            header_frame, 
            text="🏛️ Bazaar - Indian Stock Market Dashboard",
            font=('Tahoma', 14, 'bold'),
            bg=self.colors['header'],
            fg=self.colors['header_text'],
            pady=10
        )
        title_label.pack(side=tk.LEFT, padx=10)
        
        # Refresh button and status on the right
        right_frame = tk.Frame(header_frame, bg=self.colors['header'])
        right_frame.pack(side=tk.RIGHT, padx=10)
        
        self.status_label = tk.Label(
            right_frame,
            text="Loading...",
            bg=self.colors['header'],
            font=('Tahoma', 8),
            fg=self.colors['header_text']
        )
        self.status_label.pack(side=tk.LEFT, padx=10)
        
        self.refresh_btn = tk.Button(
            right_frame,
            text="🔄 Refresh Now",
            command=self.refresh_data,
            bg=self.colors['button'],
            font=('Tahoma', 8),
            relief=tk.RAISED,
            bd=2,
            padx=10,
            pady=3,
            cursor='hand2',
            activebackground=self.colors['button_hover']
        )
        self.refresh_btn.pack(side=tk.LEFT)
        
        # Add hover effect
        def on_enter(e):
            self.refresh_btn['background'] = self.colors['button_hover']
        
        def on_leave(e):
            self.refresh_btn['background'] = self.colors['button']
        
        self.refresh_btn.bind('<Enter>', on_enter)
        self.refresh_btn.bind('<Leave>', on_leave)
    
    def create_loading_overlay(self):
        """Create an absolute positioned loading overlay that doesn't block scrolling"""
        # Create overlay frame positioned absolutely
        self.loading_overlay = tk.Frame(
            self.root,
            bg='#ECE9D8',  # Match background
            relief=tk.FLAT,
            bd=0
        )
        
        # Loading indicator container with visual feedback
        loading_container = tk.Frame(
            self.loading_overlay,
            bg='#FFFFFF',
            relief=tk.RAISED,
            bd=3,
            highlightbackground='#0054E3',
            highlightthickness=2
        )
        loading_container.place(relx=0.5, rely=0.5, anchor='center')
        
        # Loading spinner/icon
        loading_icon = tk.Label(
            loading_container,
            text="⏳",
            font=('Tahoma', 32),
            bg='#FFFFFF',
            fg='#0054E3'
        )
        loading_icon.pack(padx=30, pady=(20, 10))
        
        # Loading text
        self.loading_text = tk.Label(
            loading_container,
            text="Loading market data...",
            font=('Tahoma', 11, 'bold'),
            bg='#FFFFFF',
            fg='#0054E3'
        )
        self.loading_text.pack(padx=30, pady=(0, 5))
        
        # Subtext
        loading_subtext = tk.Label(
            loading_container,
            text="Please wait while we fetch the latest updates",
            font=('Tahoma', 8),
            bg='#FFFFFF',
            fg='#666666'
        )
        loading_subtext.pack(padx=30, pady=(0, 20))
        
        # Initially hidden
        self.loading_overlay.place_forget()
        
        # Animation state
        self.loading_animation_running = False
    
    def show_loading_overlay(self):
        """Show the loading overlay"""
        # Position overlay to cover the entire window except keep it non-blocking
        self.loading_overlay.place(x=0, y=0, relwidth=1, relheight=1)
        self.loading_overlay.lift()  # Bring to front
        
        # Start animation
        self.loading_animation_running = True
        self.animate_loading()
    
    def hide_loading_overlay(self):
        """Hide the loading overlay"""
        self.loading_animation_running = False
        self.loading_overlay.place_forget()
    
    def animate_loading(self):
        """Animate the loading text with dots"""
        if not self.loading_animation_running:
            return
        
        current_text = self.loading_text.cget('text')
        if current_text.endswith('...'):
            self.loading_text.config(text='Loading market data.')
        elif current_text.endswith('..'):
            self.loading_text.config(text='Loading market data...')
        elif current_text.endswith('.'):
            self.loading_text.config(text='Loading market data..')
        else:
            self.loading_text.config(text='Loading market data.')
        
        # Schedule next animation frame
        self.root.after(500, self.animate_loading)
    
    def create_footer(self):
        """Create the footer section"""
        footer_frame = tk.Frame(self.scrollable_frame, bg=self.colors['bg'], 
                               relief=tk.SUNKEN, bd=1)
        footer_frame.pack(fill=tk.X, side=tk.BOTTOM, padx=2, pady=5)
        
        self.last_update_label = tk.Label(
            footer_frame,
            text="Last Updated: Never",
            bg=self.colors['bg'],
            font=('Tahoma', 8),
            fg='#666666',
            pady=5
        )
        self.last_update_label.pack()
    
    def refresh_data(self):
        """Refresh all data sections"""
        def refresh_thread():
            # Show loading overlay and disable button
            self.root.after(0, self.show_loading_overlay)
            self.root.after(0, lambda: self.status_label.config(text="⏳ Refreshing data..."))
            self.root.after(0, lambda: self.refresh_btn.config(state=tk.DISABLED))
            
            try:
                # Update all sections sequentially
                for section in self.sections:
                    # Update in main thread to prevent visual artifacts
                    self.root.after(0, section.update)
                    time.sleep(0.1)  # Small delay between sections
                
                # Update last refresh time in main thread
                current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                self.root.after(0, lambda: self.last_update_label.config(text=f"Last Updated: {current_time}"))
                self.root.after(0, lambda: self.status_label.config(text="✓ Data refreshed successfully"))
            except Exception as e:
                self.root.after(0, lambda: self.status_label.config(text=f"❌ Error: {str(e)}"))
            finally:
                # Hide loading overlay and re-enable button
                self.root.after(0, self.hide_loading_overlay)
                self.root.after(0, lambda: self.refresh_btn.config(state=tk.NORMAL))
        
        # Run in separate thread to avoid blocking UI
        thread = threading.Thread(target=refresh_thread, daemon=True)
        thread.start()
    
    def start_auto_refresh(self):
        """Start automatic data refresh"""
        def auto_refresh_loop():
            while self.is_running:
                time.sleep(self.refresh_interval)
                if self.is_running:
                    self.refresh_data()
        
        thread = threading.Thread(target=auto_refresh_loop, daemon=True)
        thread.start()
    
    def on_closing(self):
        """Handle application closing"""
        self.is_running = False
        self.root.destroy()


def main():
    """Main entry point"""
    root = tk.Tk()
    # Optional DPI scaling to reduce blurriness on HiDPI displays.
    # Set env var BAZAAR_TK_SCALING to a float like 1.25, 1.5, 2.0
    try:
        import os
        scaling = os.environ.get('BAZAAR_TK_SCALING')
        if scaling:
            root.tk.call('tk', 'scaling', float(scaling))
    except Exception:
        pass
    app = BazaarApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()

