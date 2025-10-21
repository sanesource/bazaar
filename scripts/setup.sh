#!/bin/bash
# Setup script for Bazaar Stock Market Dashboard (Linux/macOS)

echo "🏛️  Bazaar - Indian Stock Market Dashboard Setup"
echo "================================================="
echo ""

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Found Python: $(python3 --version)"
echo ""

# Check pip
if ! python3 -m pip --version &> /dev/null; then
    echo "Installing pip..."
    python3 -m ensurepip --upgrade 2>/dev/null || {
        echo "❌ Could not install pip. Please install pip manually."
        exit 1
    }
fi

echo "✓ Found pip: $(python3 -m pip --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
python3 -m pip install --user -r requirements.txt

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "To run the application:"
    echo "  python3 main.py"
    echo ""
else
    echo "❌ Failed to install dependencies. Please check your internet connection and try again."
    exit 1
fi

