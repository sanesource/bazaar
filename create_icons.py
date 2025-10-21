#!/usr/bin/env python3
"""
Script to convert logo.png to .ico (Windows) and .icns (macOS) formats
Requires Pillow library: pip install Pillow
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌ Pillow library not found!")
    print("   Install it with: pip install Pillow")
    sys.exit(1)


def create_ico(png_path, ico_path):
    """Create Windows .ico file from PNG"""
    print(f"📦 Creating Windows icon: {ico_path}")
    
    img = Image.open(png_path)
    
    # ICO format supports multiple sizes
    # Windows uses: 16, 32, 48, 64, 128, 256
    icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    
    img.save(ico_path, format='ICO', sizes=icon_sizes)
    print(f"   ✅ Created: {ico_path}")


def create_icns_fallback(png_path, icns_path):
    """
    Create a basic .icns file using PIL
    Note: For best results on macOS, use the iconutil method (see below)
    """
    print(f"📦 Creating macOS icon: {icns_path}")
    print("   ⚠️  Note: For best macOS compatibility, use iconutil (see instructions below)")
    
    img = Image.open(png_path)
    
    # Save as PNG in .icns container (basic support)
    # This works but iconutil is preferred for macOS
    img.save(icns_path, format='ICNS')
    print(f"   ✅ Created: {icns_path} (basic format)")


def create_icns_iconset(png_path, output_dir):
    """
    Create iconset directory for macOS iconutil
    Run this, then use: iconutil -c icns assets/Bazaar.iconset
    """
    print(f"📦 Creating macOS iconset: {output_dir}")
    
    img = Image.open(png_path)
    
    # macOS icon sizes
    sizes = [
        (16, 'icon_16x16.png'),
        (32, 'icon_16x16@2x.png'),
        (32, 'icon_32x32.png'),
        (64, 'icon_32x32@2x.png'),
        (128, 'icon_128x128.png'),
        (256, 'icon_128x128@2x.png'),
        (256, 'icon_256x256.png'),
        (512, 'icon_256x256@2x.png'),
        (512, 'icon_512x512.png'),
        (1024, 'icon_512x512@2x.png'),
    ]
    
    # Create iconset directory
    os.makedirs(output_dir, exist_ok=True)
    
    for size, filename in sizes:
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        output_path = os.path.join(output_dir, filename)
        resized.save(output_path, 'PNG')
        print(f"   ✅ Created: {filename}")
    
    print(f"\n   📝 To create .icns file on macOS, run:")
    print(f"      iconutil -c icns {output_dir}")


def main():
    """Main entry point"""
    print("=" * 60)
    print("  Bazaar Icon Creator")
    print("=" * 60)
    print()
    
    # Check if logo exists
    logo_path = Path("assets/logo.png")
    if not logo_path.exists():
        print(f"❌ Logo not found: {logo_path}")
        print("   Make sure you're running this from the project root")
        sys.exit(1)
    
    print(f"✅ Found logo: {logo_path}")
    print()
    
    # Create Windows .ico
    try:
        ico_path = Path("assets/icon.ico")
        create_ico(logo_path, ico_path)
        print()
    except Exception as e:
        print(f"❌ Failed to create .ico: {e}")
    
    # Create macOS icons
    import platform
    if platform.system() == 'Darwin':
        # On macOS, create iconset for iconutil
        try:
            iconset_dir = Path("assets/Bazaar.iconset")
            create_icns_iconset(logo_path, iconset_dir)
            print()
            print("🍎 macOS users: Run this command to create .icns:")
            print(f"   iconutil -c icns assets/Bazaar.iconset")
            print()
        except Exception as e:
            print(f"❌ Failed to create iconset: {e}")
    else:
        # On other platforms, create basic .icns
        try:
            icns_path = Path("assets/icon.icns")
            create_icns_fallback(logo_path, icns_path)
            print()
        except Exception as e:
            print(f"❌ Failed to create .icns: {e}")
            print(f"   You can create it manually using online tools")
    
    print("=" * 60)
    print("  ✅ Icon Creation Complete!")
    print("=" * 60)
    print()
    print("📋 Next steps:")
    print("   1. Icons are in the assets/ folder")
    print("   2. Run: python build.py")
    print("   3. The executable will include your icon!")
    print()
    print("📝 Alternative methods:")
    print("   • Windows: Use IcoFX or online converters")
    print("   • macOS: Use iconutil (see above)")
    print("   • Online: https://convertio.co/png-ico/")
    print("            https://cloudconvert.com/png-to-icns")
    print()


if __name__ == "__main__":
    main()

