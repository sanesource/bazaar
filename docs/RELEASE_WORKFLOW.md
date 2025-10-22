# Release Workflow Guide

This document explains how to build and release Bazaar using GitHub Actions.

## Overview

The GitHub Actions workflow automatically builds Bazaar for three platforms:

- **Windows**: NSIS installer (.exe) and portable executable
- **macOS**: DMG disk image and ZIP archive
- **Linux**: AppImage and Debian package (.deb)

## How to Create a Release

### Method 1: Tag-based Release (Recommended)

1. Update the version in `package.json`:

   ```json
   {
     "version": "1.0.0"
   }
   ```

2. Commit the version change:

   ```bash
   git add package.json
   git commit -m "Bump version to 1.0.0"
   ```

3. Create and push a version tag:

   ```bash
   git tag v1.0.0
   git push origin main
   git push origin v1.0.0
   ```

4. The workflow will automatically trigger and:
   - Build for all platforms
   - Create a GitHub release
   - Upload all build artifacts

### Method 2: Manual Trigger

1. Go to your repository on GitHub
2. Click on "Actions" tab
3. Select "Build and Release" workflow
4. Click "Run workflow"
5. Enter the version number (e.g., `1.0.0`)
6. Click "Run workflow"

## Build Artifacts

After the workflow completes, the following artifacts will be available:

### Windows

- `Bazaar Setup X.X.X.exe` - NSIS installer
- `Bazaar X.X.X.exe` - Portable executable

### macOS

- `Bazaar-X.X.X.dmg` - Disk image installer
- `Bazaar-X.X.X-mac.zip` - ZIP archive

### Linux

- `Bazaar-X.X.X.AppImage` - Universal Linux package
- `bazaar_X.X.X_amd64.deb` - Debian/Ubuntu package

## Workflow Details

### Jobs

1. **Build Job**: Runs on all three platforms in parallel

   - Installs Node.js and dependencies
   - Runs electron-builder for the specific platform
   - Uploads artifacts for the release job

2. **Release Job**: Creates the GitHub release
   - Downloads all platform artifacts
   - Creates a new release with auto-generated notes
   - Attaches all build artifacts to the release

### Requirements

- Repository must have Actions enabled
- No additional secrets required (uses built-in `GITHUB_TOKEN`)
- For macOS code signing, add signing certificates to secrets (optional)

## Troubleshooting

### Build Fails on macOS

- macOS builds are currently unsigned (`identity: null` in package.json)
- To sign builds, you'll need an Apple Developer account and certificates
- Add signing certificates to GitHub secrets

### Build Fails on Linux

- Ensure all required icon files exist in `assets/` directory
- AppImage requires `icon.png`
- Debian package requires proper icon format

### Build Fails on Windows

- Ensure `icon.ico` exists in `assets/` directory
- NSIS requires proper icon format

## Local Testing

Test builds locally before pushing:

```bash
# Install dependencies
npm install

# Build for current platform
npm run build

# Build for specific platform
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Version Numbering

Follow semantic versioning (semver):

- `v1.0.0` - Major release
- `v1.1.0` - Minor release (new features)
- `v1.0.1` - Patch release (bug fixes)

## Auto-Updates (Future Enhancement)

To enable auto-updates in the app:

1. Add publish configuration to `package.json`:

   ```json
   "publish": {
     "provider": "github",
     "owner": "your-username",
     "repo": "bazaar"
   }
   ```

2. Use electron-updater in your app to check for updates

## Additional Resources

- [electron-builder Documentation](https://www.electron.build/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
