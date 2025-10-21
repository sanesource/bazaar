#!/usr/bin/env python3
"""
Simple test script to verify dependencies and data connection
Run this before launching the main application
"""

import sys

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    
    try:
        import tkinter
        print("✓ tkinter is available")
    except ImportError:
        print("✗ tkinter is NOT available")
        print("  Install: sudo apt-get install python3-tk (Linux)")
        return False
    
    try:
        import yfinance
        print("✓ yfinance is installed")
    except ImportError:
        print("✗ yfinance is NOT installed")
        print("  Install: pip install yfinance")
        return False
    
    try:
        import pandas
        print("✓ pandas is installed")
    except ImportError:
        print("✗ pandas is NOT installed")
        print("  Install: pip install pandas")
        return False
    
    try:
        import requests
        print("✓ requests is installed")
    except ImportError:
        print("✗ requests is NOT installed")
        print("  Install: pip install requests")
        return False
    
    return True


def test_data_connection():
    """Test if we can fetch data from Yahoo Finance"""
    print("\nTesting data connection...")
    
    try:
        import yfinance as yf
        
        # Try to fetch Nifty50 data
        ticker = yf.Ticker("^NSEI")
        hist = ticker.history(period="1d")
        
        if not hist.empty:
            print("✓ Successfully fetched data from Yahoo Finance")
            print(f"  Nifty50 latest price: {hist['Close'].iloc[-1]:.2f}")
            return True
        else:
            print("✗ No data received (market might be closed)")
            return False
    
    except Exception as e:
        print(f"✗ Error fetching data: {e}")
        print("  Check your internet connection")
        return False


def test_ui():
    """Test if tkinter GUI can be created"""
    print("\nTesting UI capabilities...")
    
    try:
        import tkinter as tk
        
        # Try to create a simple window (don't show it)
        root = tk.Tk()
        root.withdraw()  # Hide the window
        
        # Check if we can create basic widgets
        frame = tk.Frame(root)
        label = tk.Label(frame, text="Test")
        button = tk.Button(frame, text="Test")
        
        print("✓ UI components can be created")
        
        root.destroy()
        return True
    
    except Exception as e:
        print(f"✗ UI test failed: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 50)
    print("Bazaar - System Compatibility Test")
    print("=" * 50)
    print()
    
    # Check Python version
    python_version = sys.version_info
    print(f"Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    if python_version < (3, 8):
        print("✗ Python 3.8 or higher is required")
        return False
    else:
        print("✓ Python version is compatible")
    
    print()
    
    # Run tests
    imports_ok = test_imports()
    data_ok = test_data_connection()
    ui_ok = test_ui()
    
    print()
    print("=" * 50)
    
    if imports_ok and data_ok and ui_ok:
        print("✅ All tests passed! You're ready to run Bazaar.")
        print()
        print("To start the application, run:")
        print("  python3 main.py")
        return True
    else:
        print("❌ Some tests failed. Please fix the issues above.")
        print()
        print("To install missing dependencies:")
        print("  pip install -r requirements.txt")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

