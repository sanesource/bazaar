#!/usr/bin/env python3
"""
Test script to verify the built executable
Tests the executable without requiring user interaction
"""
import os
import sys
import platform
import subprocess
import time
from pathlib import Path


def find_executable():
    """Find the built executable"""
    system = platform.system()
    
    if system == "Windows":
        exe_path = Path("dist/Bazaar.exe")
    elif system == "Darwin":
        # For macOS, check both .app and standalone
        app_path = Path("dist/Bazaar.app/Contents/MacOS/Bazaar")
        standalone_path = Path("dist/Bazaar")
        exe_path = app_path if app_path.exists() else standalone_path
    else:
        exe_path = Path("dist/Bazaar")
    
    return exe_path


def test_executable_exists(exe_path):
    """Test if executable exists"""
    print("1️⃣  Testing executable existence...")
    
    if not exe_path.exists():
        print(f"   ❌ Executable not found: {exe_path}")
        return False
    
    print(f"   ✅ Executable found: {exe_path}")
    return True


def test_executable_size(exe_path):
    """Test executable size"""
    print("\n2️⃣  Testing executable size...")
    
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
    print(f"   📦 Size: {size_mb:.2f} MB")
    
    # Check if size is reasonable (should be between 20 MB and 200 MB)
    if size_mb < 20:
        print(f"   ⚠️  Warning: Size is unusually small (< 20 MB)")
        print(f"      The build might be missing dependencies")
    elif size_mb > 200:
        print(f"   ⚠️  Warning: Size is unusually large (> 200 MB)")
        print(f"      Consider optimizing the build (see BUILD_GUIDE.md)")
    else:
        print(f"   ✅ Size is within expected range (20-200 MB)")
    
    return True


def test_executable_permissions(exe_path):
    """Test if executable has proper permissions"""
    print("\n3️⃣  Testing executable permissions...")
    
    system = platform.system()
    
    if system == "Windows":
        # Windows doesn't use Unix-style permissions
        print("   ℹ️  Windows: Permissions check skipped")
        return True
    
    # Check if file is executable
    if exe_path.is_file():
        is_executable = os.access(exe_path, os.X_OK)
    else:
        # For .app bundles, check the actual executable
        if system == "Darwin":
            actual_exe = exe_path / "Contents/MacOS/Bazaar"
            is_executable = os.access(actual_exe, os.X_OK)
        else:
            is_executable = False
    
    if not is_executable:
        print(f"   ❌ File is not executable")
        print(f"      Fix with: chmod +x {exe_path}")
        return False
    
    print(f"   ✅ File has executable permissions")
    return True


def test_launch_executable(exe_path):
    """Test launching the executable"""
    print("\n4️⃣  Testing executable launch...")
    print("   🚀 Attempting to launch application...")
    print("      (The app will run for 3 seconds then close automatically)")
    
    system = platform.system()
    
    try:
        # Determine command
        if system == "Darwin" and exe_path.suffix == ".app":
            # Use 'open' command for .app bundles on macOS
            cmd = ['open', str(exe_path)]
        else:
            cmd = [str(exe_path)]
        
        # Launch the application
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdin=subprocess.PIPE
        )
        
        print(f"   ✅ Application launched successfully")
        print(f"      Process ID: {process.pid}")
        
        # Wait a bit to ensure it starts
        time.sleep(3)
        
        # Check if process is still running
        poll_result = process.poll()
        
        if poll_result is None:
            # Process is still running - good sign!
            print(f"   ✅ Application is running")
            
            # Terminate the process
            print(f"   🛑 Terminating test process...")
            process.terminate()
            
            # Wait for process to terminate
            try:
                process.wait(timeout=5)
                print(f"   ✅ Application terminated cleanly")
            except subprocess.TimeoutExpired:
                print(f"   ⚠️  Process didn't terminate, forcing kill...")
                process.kill()
                process.wait()
            
            return True
        else:
            # Process already terminated
            stdout, stderr = process.communicate()
            print(f"   ❌ Application terminated immediately")
            print(f"      Exit code: {poll_result}")
            
            if stderr:
                print(f"      Error output:")
                print(f"      {stderr.decode('utf-8', errors='ignore')}")
            
            return False
    
    except FileNotFoundError:
        print(f"   ❌ Failed to launch: File not found")
        return False
    except PermissionError:
        print(f"   ❌ Failed to launch: Permission denied")
        print(f"      Fix with: chmod +x {exe_path}")
        return False
    except Exception as e:
        print(f"   ❌ Failed to launch: {e}")
        return False


def test_build():
    """Run all tests"""
    print("=" * 60)
    print("  Bazaar Build Test")
    print("=" * 60)
    print()
    
    # Show environment info
    print(f"🖥️  Platform: {platform.system()} {platform.release()}")
    print(f"🐍 Python: {sys.version.split()[0]}")
    print()
    
    # Find executable
    exe_path = find_executable()
    
    # Run tests
    tests = [
        ("Executable exists", test_executable_exists, exe_path),
        ("Executable size", test_executable_size, exe_path),
        ("Executable permissions", test_executable_permissions, exe_path),
        ("Executable launch", test_launch_executable, exe_path),
    ]
    
    results = []
    
    for test_name, test_func, *args in tests:
        try:
            result = test_func(*args)
            results.append((test_name, result))
        except Exception as e:
            print(f"\n   ❌ Test failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("  Test Summary")
    print("=" * 60)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status}: {test_name}")
    
    # Overall result
    all_passed = all(result for _, result in results)
    
    print("\n" + "=" * 60)
    if all_passed:
        print("  ✅ All Tests Passed!")
        print("  The executable is ready for distribution")
    else:
        print("  ❌ Some Tests Failed!")
        print("  Review the errors above and rebuild")
    print("=" * 60)
    print()
    
    return all_passed


def main():
    """Main entry point"""
    success = test_build()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

