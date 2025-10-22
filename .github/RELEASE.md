# Quick Release Guide

## Create a New Release

### Option 1: Tag-based (Recommended)

```bash
# 1. Update version in package.json
# 2. Commit changes
git add package.json
git commit -m "Bump version to 1.0.0"

# 3. Create and push tag
git tag v1.0.0
git push origin main
git push origin v1.0.0
```

### Option 2: Manual Trigger

1. Go to GitHub → Actions → "Build and Release"
2. Click "Run workflow"
3. Enter version number
4. Click "Run workflow"

## What Gets Built

- **Windows**: `.exe` installer + portable
- **macOS**: `.dmg` + `.zip`
- **Linux**: `.AppImage` + `.deb`

## Testing Locally

```bash
npm run build          # Current platform
npm run build:win      # Windows
npm run build:mac      # macOS
npm run build:linux    # Linux
```

For detailed documentation, see [RELEASE_WORKFLOW.md](../docs/RELEASE_WORKFLOW.md)
