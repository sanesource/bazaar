#!/usr/bin/env python3
"""
Automated build script for Bazaar
Builds standalone executables for Windows, macOS, and Linux
"""
import os
import sys
import shutil
import platform
import subprocess
from pathlib import Path


def clean_build():
    """Remove old build artifacts"""
    print("🧹 Cleaning old builds...")
    items_to_clean = ['build', 'dist']
    
    for item in items_to_clean:
        if os.path.exists(item):
            shutil.rmtree(item)
            print(f"   Removed: {item}/")
    
    # Remove .spec files
    for spec_file in Path('.').glob('*.spec'):
        spec_file.unlink()
        print(f"   Removed: {spec_file}")
    
    print("✅ Clean complete\n")


def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    # Check PyInstaller
    try:
        result = subprocess.run(
            ['pyinstaller', '--version'],
            capture_output=True,
            text=True,
            check=True
        )
        version = result.stdout.strip()
        print(f"   ✅ PyInstaller: {version}")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("   ❌ PyInstaller not found!")
        print("      Install it with: pip install pyinstaller")
        return False
    
    # Check project dependencies
    required_modules = ['yfinance', 'pandas', 'requests']
    for module in required_modules:
        try:
            __import__(module)
            print(f"   ✅ {module}: installed")
        except ImportError:
            print(f"   ❌ {module}: not found!")
            print("      Install dependencies with: pip install -r requirements.txt")
            return False
    
    print("✅ All dependencies satisfied\n")
    return True


def build_executable():
    """Build the executable"""
    system = platform.system()
    print(f"🔨 Building for {system}...\n")
    
    # Determine path separator for --add-data
    separator = ';' if system == 'Windows' else ':'
    
    # Common arguments
    base_args = [
        'pyinstaller',
        '--onefile',
        '--windowed',
        '--name', 'Bazaar',
        '--hidden-import', 'yfinance',
        '--hidden-import', 'pandas',
        '--hidden-import', 'requests',
        '--clean',
    ]
    
    # Add icon if it exists
    if system == 'Windows' and os.path.exists('assets/icon.ico'):
        base_args.extend(['--icon', 'assets/icon.ico'])
        print("   📱 Using Windows icon: assets/icon.ico")
    elif system == 'Darwin' and os.path.exists('assets/icon.icns'):
        base_args.extend(['--icon', 'assets/icon.icns'])
        print("   📱 Using macOS icon: assets/icon.icns")
    elif os.path.exists('assets/logo.png'):
        print("   ℹ️  Icon files not found. Run 'python create_icons.py' to create them.")
    
    # Add VERSION file if it exists
    if os.path.exists('VERSION'):
        base_args.extend(['--add-data', f'VERSION{separator}.'])
    
    # Platform-specific arguments
    if system == 'Darwin':  # macOS
        base_args.extend([
            '--osx-bundle-identifier', 'com.bazaar.app'
        ])
    
    # Add main.py as the last argument
    base_args.append('main.py')
    
    # Run PyInstaller
    print("   Running PyInstaller...")
    print(f"   Command: {' '.join(base_args)}\n")
    
    try:
        subprocess.run(base_args, check=True)
        print("\n✅ Build successful!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Build failed with error code {e.returncode}")
        return False


def show_build_info():
    """Show information about the built executable"""
    system = platform.system()
    
    print("\n" + "=" * 60)
    print("  Build Information")
    print("=" * 60)
    
    # Determine executable path
    if system == "Windows":
        exe_name = "Bazaar.exe"
        exe_path = Path("dist") / exe_name
    elif system == "Darwin":
        exe_name = "Bazaar.app"
        exe_path = Path("dist") / exe_name
    else:
        exe_name = "Bazaar"
        exe_path = Path("dist") / exe_name
    
    print(f"\n📦 Executable: {exe_path}")
    
    # Show size
    if exe_path.exists():
        if exe_path.is_file():
            size_bytes = exe_path.stat().st_size
        else:
            # For .app bundles, calculate total size
            size_bytes = sum(
                f.stat().st_size 
                for f in exe_path.rglob('*') 
                if f.is_file()
            )
        
        size_mb = size_bytes / (1024 * 1024)
        print(f"📏 Size: {size_mb:.2f} MB")
        
        # Show full path
        print(f"📂 Full path: {exe_path.absolute()}")
        
        # Platform-specific instructions
        print(f"\n📋 Next steps:")
        if system == "Windows":
            print(f"   • Test: .\\dist\\{exe_name}")
            print(f"   • Distribute: Share the dist\\{exe_name} file")
        elif system == "Darwin":
            print(f"   • Test: open dist/{exe_name}")
            print(f"   • Distribute: Create DMG with:")
            print(f"     hdiutil create -volname Bazaar -srcfolder dist/{exe_name} -ov -format UDZO Bazaar.dmg")
        else:
            print(f"   • Test: ./dist/{exe_name}")
            print(f"   • Make executable: chmod +x dist/{exe_name}")
            print(f"   • Distribute: Create AppImage or .deb package (see BUILD_GUIDE.md)")
    else:
        print("❌ Executable not found! Build may have failed.")


def main():
    """Main entry point"""
    print("=" * 60)
    print("  Bazaar Build Script")
    print("  Version 1.0.0")
    print("=" * 60)
    print()
    
    # Show current environment
    print(f"🖥️  Platform: {platform.system()} {platform.release()}")
    print(f"🐍 Python: {sys.version.split()[0]}")
    print(f"📁 Working directory: {os.getcwd()}")
    print()
    
    # Check if main.py exists
    if not os.path.exists('main.py'):
        print("❌ Error: main.py not found!")
        print("   Make sure you're running this script from the project root directory.")
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Clean old builds
    clean_build()
    
    # Build executable
    success = build_executable()
    
    if success:
        show_build_info()
    
    print("\n" + "=" * 60)
    if success:
        print("  ✅ Build Complete!")
        print("  See docs/BUILD_GUIDE.md for distribution instructions")
    else:
        print("  ❌ Build Failed!")
        print("  Check the error messages above")
    print("=" * 60 + "\n")
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

