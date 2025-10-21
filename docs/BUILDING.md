# 🚀 Quick Build Reference

This is a quick reference for building Bazaar executables. For complete documentation, see [BUILD_GUIDE.md](BUILD_GUIDE.md).

---

## Prerequisites

```bash
pip install pyinstaller
```

**Optional: Create application icons**

```bash
# Convert logo.png to .ico (Windows) and .icns (macOS)
python3 create_icons.py
```

This will create `assets/icon.ico` and `assets/icon.icns` from your logo.

---

## Quick Build (All Platforms)

### Option 1: Automated Script (Recommended)

```bash
python build.py
```

This will:

- ✅ Clean old builds
- ✅ Check dependencies
- ✅ Build the executable
- ✅ Show build information

### Option 2: Manual Build

**Windows:**

```cmd
pyinstaller --onefile --windowed --name Bazaar --clean main.py
```

**Linux/Ubuntu:**

```bash
pyinstaller --onefile --windowed --name Bazaar --clean main.py
chmod +x dist/Bazaar
```

**macOS:**

```bash
pyinstaller --onefile --windowed --name Bazaar --osx-bundle-identifier com.bazaar.app --clean main.py
```

---

## Test Your Build

```bash
python test_build.py
```

---

## Output Locations

| Platform    | Output            | Size       |
| ----------- | ----------------- | ---------- |
| **Windows** | `dist/Bazaar.exe` | ~60-90 MB  |
| **Linux**   | `dist/Bazaar`     | ~70-100 MB |
| **macOS**   | `dist/Bazaar.app` | ~70-100 MB |

---

## Common Issues

### "ModuleNotFoundError" when running executable

Add the missing module:

```bash
pyinstaller --onefile --windowed --name Bazaar --hidden-import=missing_module main.py
```

### "Permission denied" on Linux/macOS

```bash
chmod +x dist/Bazaar
```

### "App is damaged" on macOS

```bash
xattr -cr dist/Bazaar.app
```

---

## Distribution

### Windows

- Share `dist/Bazaar.exe` directly
- Or create installer with Inno Setup

### Linux

- Share `dist/Bazaar` directly
- Or create AppImage/deb package

### macOS

- Create DMG:
  ```bash
  hdiutil create -volname Bazaar -srcfolder dist/Bazaar.app -ov -format UDZO Bazaar.dmg
  ```

---

## Need More Help?

See the complete documentation: **[BUILD_GUIDE.md](BUILD_GUIDE.md)**

Topics covered:

- Build optimization
- Size reduction
- Creating installers
- Code signing
- Advanced troubleshooting
- CI/CD integration
