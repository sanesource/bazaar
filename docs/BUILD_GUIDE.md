# 📦 Building Bazaar - Complete Build Guide

This guide will walk you through creating standalone executable builds of Bazaar for Windows, Ubuntu/Linux, and macOS.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installing PyInstaller](#installing-pyinstaller)
3. [Building for Windows](#building-for-windows)
4. [Building for Ubuntu/Linux](#building-for-ubuntulinux)
5. [Building for macOS](#building-for-macos)
6. [Build Optimization](#build-optimization)
7. [Testing Your Build](#testing-your-build)
8. [Distribution](#distribution)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### For All Platforms

- Python 3.8 or higher installed
- All project dependencies installed: `pip install -r requirements.txt`
- PyInstaller: `pip install pyinstaller`
- Approximately 500 MB of free disk space for build process

### Platform-Specific Requirements

**Windows:**

- No additional requirements

**Ubuntu/Linux:**

- `python3-dev` package: `sudo apt-get install python3-dev`
- `tkinter`: `sudo apt-get install python3-tk`

**macOS:**

- Xcode Command Line Tools: `xcode-select --install`
- Python 3 from python.org (recommended over system Python)

---

## Installing PyInstaller

Install PyInstaller in your project environment:

```bash
# Make sure you're in the project directory
cd /path/to/bazaar

# Install PyInstaller
pip install pyinstaller

# Verify installation
pyinstaller --version
```

Expected output: `6.x.x` or higher

---

## Creating Application Icons

Before building, you can create platform-specific icons from your logo:

### Automated Icon Creation

```bash
# Uses assets/logo.png to create .ico and .icns files
python3 create_icons.py
```

This will create:

- `assets/icon.ico` - Windows icon (multiple sizes: 16x16 to 256x256)
- `assets/icon.icns` - macOS icon

**Requirements:** Pillow library (`pip install Pillow`)

### Manual Icon Creation

If you prefer to create icons manually:

**For Windows (.ico):**

- Use online tools: https://convertio.co/png-ico/
- Or IcoFX software
- Required sizes: 16, 32, 48, 64, 128, 256 pixels

**For macOS (.icns):**

- Use online tools: https://cloudconvert.com/png-to-icns
- Or use macOS iconutil:
  ```bash
  python3 create_icons.py  # Creates iconset
  iconutil -c icns assets/Bazaar.iconset
  ```

**Note:** The build script automatically uses icons if they exist in `assets/` folder.

---

## Building for Windows

### Step 1: Clean Previous Builds

```cmd
# Remove old build artifacts
rmdir /s /q build dist
del /f /q *.spec
```

### Step 2: Basic Build Command

```cmd
pyinstaller --onefile --windowed --name Bazaar main.py
```

### Step 3: Optimized Build with Icon (Recommended)

First, create or obtain a `.ico` file for your application icon. Then:

```cmd
pyinstaller ^
    --onefile ^
    --windowed ^
    --name Bazaar ^
    --icon=assets/icon.ico ^
    --add-data "VERSION;." ^
    --hidden-import=yfinance ^
    --hidden-import=pandas ^
    --hidden-import=requests ^
    --clean ^
    main.py
```

**Parameters Explained:**

- `--onefile`: Creates a single executable file
- `--windowed`: No console window (GUI only)
- `--name Bazaar`: Names the executable "Bazaar.exe"
- `--icon`: Adds application icon
- `--add-data`: Includes VERSION file (format: "source;destination")
- `--hidden-import`: Explicitly includes dependencies
- `--clean`: Cleans PyInstaller cache before building

### Step 4: Locate Your Build

The executable will be in: `dist/Bazaar.exe`

**Expected Size:** 60-90 MB

---

## Building for Ubuntu/Linux

### Step 1: Install Dependencies

```bash
# Install required packages
sudo apt-get update
sudo apt-get install python3-dev python3-tk

# Verify tkinter is working
python3 -c "import tkinter; print('tkinter OK')"
```

### Step 2: Clean Previous Builds

```bash
# Remove old build artifacts
rm -rf build dist
rm -f *.spec
```

### Step 3: Basic Build Command

```bash
pyinstaller --onefile --windowed --name Bazaar main.py
```

### Step 4: Optimized Build (Recommended)

```bash
pyinstaller \
    --onefile \
    --windowed \
    --name Bazaar \
    --add-data "VERSION:." \
    --hidden-import=yfinance \
    --hidden-import=pandas \
    --hidden-import=requests \
    --clean \
    main.py
```

**Note:** On Linux, the `--add-data` separator is `:` (colon), not `;` (semicolon)

### Step 5: Make Executable

```bash
# Make the binary executable
chmod +x dist/Bazaar

# Test it
./dist/Bazaar
```

### Step 6: Locate Your Build

The executable will be in: `dist/Bazaar`

**Expected Size:** 70-100 MB

---

## Building for macOS

### Step 1: Install Dependencies

```bash
# Ensure you have Python from python.org
# NOT from Homebrew for best results
python3 --version

# Install PyInstaller
pip3 install pyinstaller
```

### Step 2: Clean Previous Builds

```bash
# Remove old build artifacts
rm -rf build dist
rm -f *.spec
```

### Step 3: Build as Application Bundle (Recommended)

```bash
pyinstaller \
    --onefile \
    --windowed \
    --name Bazaar \
    --add-data "VERSION:." \
    --hidden-import=yfinance \
    --hidden-import=pandas \
    --hidden-import=requests \
    --osx-bundle-identifier "com.bazaar.app" \
    --clean \
    main.py
```

**macOS-Specific Options:**

- `--osx-bundle-identifier`: Unique bundle ID for the app

### Step 4: Create a Better App Bundle (Optional)

For a proper `.app` bundle with icon:

```bash
pyinstaller \
    --name Bazaar \
    --windowed \
    --onefile \
    --icon=assets/icon.icns \
    --osx-bundle-identifier "com.bazaar.app" \
    --add-data "VERSION:." \
    --hidden-import=yfinance \
    --hidden-import=pandas \
    --hidden-import=requests \
    --clean \
    main.py
```

### Step 5: Code Signing (Optional, for Distribution)

If you're distributing outside the Mac App Store:

```bash
# Sign the application
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" dist/Bazaar.app

# Verify signature
codesign --verify --deep --strict --verbose=2 dist/Bazaar.app

# Notarize (requires Apple Developer account)
xcrun altool --notarize-app --file dist/Bazaar.app
```

### Step 6: Locate Your Build

The application will be in: `dist/Bazaar.app` (or `dist/Bazaar` for --onefile)

**Expected Size:** 70-100 MB

---

## Build Optimization

### Reducing Build Size

#### 1. Exclude Unnecessary Modules

Create a `Bazaar.spec` file and edit the excludes:

```python
# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=[('VERSION', '.')],
    hiddenimports=['yfinance', 'pandas', 'requests'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'matplotlib',
        'scipy',
        'numpy.testing',
        'PIL',
        'IPython',
        'notebook',
        'jupyter',
        'pytest',
        'setuptools',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='Bazaar',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
```

Then build with:

```bash
pyinstaller Bazaar.spec
```

#### 2. Use UPX Compression

Download UPX from https://upx.github.io/

**Windows:**

```cmd
pyinstaller --onefile --windowed --name Bazaar --upx-dir="C:\path\to\upx" main.py
```

**Linux/macOS:**

```bash
pyinstaller --onefile --windowed --name Bazaar --upx-dir=/path/to/upx main.py
```

**Potential size reduction:** 30-50%

#### 3. Strip Debug Symbols (Linux/macOS)

```bash
strip dist/Bazaar
```

---

## Testing Your Build

### Automated Testing Script

Create `test_build.py`:

```python
#!/usr/bin/env python3
"""
Test script to verify the built executable
"""
import os
import sys
import subprocess
import platform

def test_build():
    """Test the built executable"""
    system = platform.system()

    if system == "Windows":
        executable = "dist/Bazaar.exe"
    elif system == "Darwin":
        executable = "dist/Bazaar.app/Contents/MacOS/Bazaar"
    else:
        executable = "dist/Bazaar"

    # Check if executable exists
    if not os.path.exists(executable):
        print(f"❌ Executable not found: {executable}")
        return False

    # Check file size
    size_mb = os.path.getsize(executable) / (1024 * 1024)
    print(f"✅ Executable found: {executable}")
    print(f"📦 Size: {size_mb:.2f} MB")

    # Check if executable is executable
    if system != "Windows" and not os.access(executable, os.X_OK):
        print("❌ File is not executable")
        return False

    print("✅ File is executable")

    # Try to run (will open GUI - close it manually)
    print("\n🚀 Attempting to launch application...")
    print("   (Close the window to complete the test)")

    try:
        process = subprocess.Popen([executable])
        print("✅ Application launched successfully")
        print(f"   Process ID: {process.pid}")
        return True
    except Exception as e:
        print(f"❌ Failed to launch: {e}")
        return False

if __name__ == "__main__":
    success = test_build()
    sys.exit(0 if success else 1)
```

Run the test:

```bash
python3 test_build.py
```

### Manual Testing Checklist

- [ ] Executable starts without errors
- [ ] GUI window appears correctly
- [ ] Data loads successfully (requires internet)
- [ ] Refresh button works
- [ ] Auto-refresh works
- [ ] Window can be resized
- [ ] Scrolling works
- [ ] Application closes cleanly

---

## Distribution

### Creating Distribution Packages

#### Windows - ZIP Archive

```cmd
# Create a distributable folder
mkdir Bazaar-Windows
copy dist\Bazaar.exe Bazaar-Windows\
copy README.md Bazaar-Windows\
copy VERSION Bazaar-Windows\

# Create ZIP
powershell Compress-Archive -Path Bazaar-Windows -DestinationPath Bazaar-Windows-v1.0.0.zip
```

#### Windows - Installer (Optional)

Use **Inno Setup** or **NSIS** to create an installer:

**Inno Setup Example:**

1. Download Inno Setup: https://jrsoftware.org/isinfo.php
2. Create `installer.iss`:

```iss
[Setup]
AppName=Bazaar
AppVersion=1.0.0
DefaultDirName={pf}\Bazaar
DefaultGroupName=Bazaar
OutputDir=output
OutputBaseFilename=Bazaar-Setup-v1.0.0
Compression=lzma
SolidCompression=yes

[Files]
Source: "dist\Bazaar.exe"; DestDir: "{app}"
Source: "README.md"; DestDir: "{app}"
Source: "VERSION"; DestDir: "{app}"

[Icons]
Name: "{group}\Bazaar"; Filename: "{app}\Bazaar.exe"
Name: "{commondesktop}\Bazaar"; Filename: "{app}\Bazaar.exe"
```

3. Compile with Inno Setup

#### Linux - AppImage (Recommended)

Create an AppImage for easy distribution:

```bash
# Install appimagetool
wget https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage
chmod +x appimagetool-x86_64.AppImage

# Create AppDir structure
mkdir -p Bazaar.AppDir/usr/bin
cp dist/Bazaar Bazaar.AppDir/usr/bin/

# Create desktop entry
cat > Bazaar.AppDir/Bazaar.desktop << EOF
[Desktop Entry]
Name=Bazaar
Exec=Bazaar
Icon=bazaar
Type=Application
Categories=Finance;
EOF

# Create AppImage
./appimagetool-x86_64.AppImage Bazaar.AppDir
```

Result: `Bazaar-x86_64.AppImage`

#### Linux - .deb Package (Optional)

```bash
# Create package structure
mkdir -p bazaar_1.0.0_amd64/DEBIAN
mkdir -p bazaar_1.0.0_amd64/usr/local/bin
mkdir -p bazaar_1.0.0_amd64/usr/share/applications

# Copy executable
cp dist/Bazaar bazaar_1.0.0_amd64/usr/local/bin/

# Create control file
cat > bazaar_1.0.0_amd64/DEBIAN/control << EOF
Package: bazaar
Version: 1.0.0
Section: utils
Priority: optional
Architecture: amd64
Maintainer: Your Name <your.email@example.com>
Description: Indian Stock Market Dashboard
 A lightweight GUI application for real-time Indian stock market data
EOF

# Build package
dpkg-deb --build bazaar_1.0.0_amd64
```

#### macOS - DMG Image

```bash
# Create DMG
hdiutil create -volname Bazaar -srcfolder dist/Bazaar.app -ov -format UDZO Bazaar-macOS-v1.0.0.dmg
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "ModuleNotFoundError" when running executable

**Solution:** Add missing modules with `--hidden-import`:

```bash
pyinstaller --onefile --windowed --name Bazaar \
    --hidden-import=missing_module_name \
    main.py
```

#### Issue: "Failed to execute script" on Windows

**Solution:**

1. Try without `--windowed` flag to see console errors:
   ```cmd
   pyinstaller --onefile --name Bazaar main.py
   ```
2. Run the executable from command prompt to see error messages

#### Issue: Large executable size (>150 MB)

**Solution:**

1. Use `--exclude-module` to remove unnecessary packages
2. Enable UPX compression
3. Use virtual environment with only required packages

#### Issue: "Permission denied" on Linux/macOS

**Solution:**

```bash
chmod +x dist/Bazaar
```

#### Issue: "App is damaged and can't be opened" on macOS

**Solution:**

```bash
# Remove quarantine attribute
xattr -cr dist/Bazaar.app

# Or, allow apps from anywhere (temporarily)
sudo spctl --master-disable
```

#### Issue: Antivirus flags the executable

**Solution:**

- This is common with PyInstaller executables
- Sign the executable (Windows/macOS)
- Report as false positive to antivirus vendor
- Consider using code signing certificate

#### Issue: Application starts but UI doesn't render

**Solution:**

1. Verify tkinter is included: `--hidden-import=tkinter`
2. Test with a simpler UI first
3. Check system DPI scaling settings

### Debug Build

Create a debug build that shows console output:

```bash
# Remove --windowed flag
pyinstaller --onefile --name Bazaar-Debug main.py
```

Run the debug build and check console output for errors.

---

## Build Scripts

### Automated Build Script for All Platforms

Create `build.py`:

```python
#!/usr/bin/env python3
"""
Automated build script for Bazaar
"""
import os
import sys
import shutil
import platform
import subprocess

def clean_build():
    """Remove old build artifacts"""
    print("🧹 Cleaning old builds...")
    for item in ['build', 'dist', '*.spec']:
        if os.path.exists(item):
            if os.path.isdir(item):
                shutil.rmtree(item)
            else:
                os.remove(item)
    print("✅ Clean complete\n")

def build_executable():
    """Build the executable"""
    system = platform.system()
    print(f"🔨 Building for {system}...\n")

    # Common arguments
    base_args = [
        'pyinstaller',
        '--onefile',
        '--windowed',
        '--name', 'Bazaar',
        '--add-data', f'VERSION{os.pathsep}.',
        '--hidden-import', 'yfinance',
        '--hidden-import', 'pandas',
        '--hidden-import', 'requests',
        '--clean',
        'main.py'
    ]

    # Platform-specific arguments
    if system == 'Darwin':  # macOS
        base_args.extend([
            '--osx-bundle-identifier', 'com.bazaar.app'
        ])

    # Run PyInstaller
    try:
        subprocess.run(base_args, check=True)
        print("\n✅ Build successful!")

        # Show output location
        if system == "Windows":
            print(f"\n📦 Executable: dist\\Bazaar.exe")
        elif system == "Darwin":
            print(f"\n📦 Application: dist/Bazaar.app")
        else:
            print(f"\n📦 Executable: dist/Bazaar")

        # Show size
        if system == "Windows":
            exe_path = "dist/Bazaar.exe"
        elif system == "Darwin":
            exe_path = "dist/Bazaar.app"
        else:
            exe_path = "dist/Bazaar"

        if os.path.exists(exe_path):
            size_mb = os.path.getsize(exe_path) / (1024 * 1024)
            print(f"📏 Size: {size_mb:.2f} MB")

        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Build failed: {e}")
        return False

def main():
    """Main entry point"""
    print("=" * 60)
    print("  Bazaar Build Script")
    print("=" * 60)
    print()

    # Check if PyInstaller is installed
    try:
        subprocess.run(['pyinstaller', '--version'],
                      capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ PyInstaller not found!")
        print("   Install it with: pip install pyinstaller")
        sys.exit(1)

    # Clean and build
    clean_build()
    success = build_executable()

    print("\n" + "=" * 60)
    if success:
        print("  ✅ Build Complete!")
    else:
        print("  ❌ Build Failed!")
    print("=" * 60)

    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
```

Make it executable and run:

```bash
# Linux/macOS
chmod +x build.py
./build.py

# Windows
python build.py
```

---

## Quick Reference

### One-Command Builds

**Windows:**

```cmd
pyinstaller --onefile --windowed --name Bazaar --clean main.py
```

**Linux:**

```bash
pyinstaller --onefile --windowed --name Bazaar --clean main.py && chmod +x dist/Bazaar
```

**macOS:**

```bash
pyinstaller --onefile --windowed --name Bazaar --osx-bundle-identifier com.bazaar.app --clean main.py
```

### Build + Test

```bash
python build.py && python test_build.py
```

---

## Additional Resources

- **PyInstaller Documentation:** https://pyinstaller.org/en/stable/
- **PyInstaller GitHub:** https://github.com/pyinstaller/pyinstaller
- **Icon Converters:**
  - PNG to ICO: https://convertio.co/png-ico/
  - PNG to ICNS: https://cloudconvert.com/png-to-icns
- **Code Signing:**
  - Windows: https://learn.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools
  - macOS: https://developer.apple.com/support/code-signing/

---

## Next Steps

After building:

1. **Test thoroughly** on a clean machine (without Python installed)
2. **Create distribution package** (ZIP, DMG, AppImage, etc.)
3. **Write installation instructions** for end users
4. **Set up version control** for releases
5. **Consider automated builds** with CI/CD (GitHub Actions, etc.)

---

## Summary

| Platform    | Command                                                                                         | Output            | Size       |
| ----------- | ----------------------------------------------------------------------------------------------- | ----------------- | ---------- |
| **Windows** | `pyinstaller --onefile --windowed --name Bazaar main.py`                                        | `dist/Bazaar.exe` | ~60-90 MB  |
| **Linux**   | `pyinstaller --onefile --windowed --name Bazaar main.py`                                        | `dist/Bazaar`     | ~70-100 MB |
| **macOS**   | `pyinstaller --onefile --windowed --name Bazaar --osx-bundle-identifier com.bazaar.app main.py` | `dist/Bazaar.app` | ~70-100 MB |

---

**Happy Building! 🎉**

For questions or issues, refer to the [Troubleshooting](#troubleshooting) section or check the PyInstaller documentation.
