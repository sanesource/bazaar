# macOS Installation Guide

## "App is Damaged" Error Fix

If you see the error **"Bazaar" is damaged and can't be opened. You should move it to the Bin.** when trying to install Bazaar on macOS, this is due to macOS Gatekeeper security. Here's how to fix it:

### Quick Fix (Recommended)

1. **Download the DMG or ZIP file** from the GitHub releases page

2. **Open Terminal** (Press `Cmd + Space`, type "Terminal", press Enter)

3. **Remove the quarantine attribute** by running one of these commands:

   **If you downloaded a DMG file:**

   ```bash
   # First, mount the DMG and copy the app to Applications
   # Then run:
   xattr -cr /Applications/Bazaar.app
   ```

   **If you downloaded a ZIP file:**

   ```bash
   # Navigate to where you extracted the ZIP
   cd ~/Downloads  # or wherever you extracted it
   xattr -cr Bazaar.app
   ```

4. **Open the app** - You should now be able to open Bazaar normally

### Alternative Method: Right-Click Open

1. **Right-click** (or Control+Click) on the Bazaar.app file
2. Select **"Open"** from the context menu
3. Click **"Open"** in the security dialog that appears
4. The app will be added to your security exceptions and will open normally in the future

### Why This Happens

macOS Gatekeeper blocks unsigned applications by default. When you download an app from the internet, macOS adds a "quarantine" attribute to prevent it from running until you explicitly allow it.

The `xattr -cr` command removes this quarantine attribute, allowing the app to run.

### For Developers: Code Signing

To avoid this issue for end users, the app needs to be:

1. **Code signed** with an Apple Developer certificate
2. **Notarized** by Apple

If you're a developer and want to set up code signing, see the [Code Signing Setup Guide](#code-signing-setup) below.

---

## Code Signing Setup (For Developers)

To sign and notarize macOS builds, you need:

1. **Apple Developer Account** ($99/year)
2. **Developer ID Application Certificate**
3. **App-specific password** for notarization

### Step 1: Get Your Certificates

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create a **Developer ID Application** certificate
4. Download the certificate and export it as a `.p12` file

### Step 2: Configure GitHub Secrets

Add these secrets to your GitHub repository:

- `APPLE_ID`: Your Apple ID email
- `APPLE_ID_PASS`: App-specific password (create at [appleid.apple.com](https://appleid.apple.com))
- `APPLE_TEAM_ID`: Your Team ID (found in Apple Developer Portal)
- `APPLE_CERTIFICATE`: Base64-encoded `.p12` certificate file
- `APPLE_CERTIFICATE_PASSWORD`: Password for the `.p12` file
- `APPLE_KEYCHAIN_PASSWORD`: Temporary password for the keychain (can be any secure password)

### Step 3: Encode Certificate

To encode your certificate:

```bash
base64 -i YourCertificate.p12 -o certificate_base64.txt
```

Copy the contents of `certificate_base64.txt` and paste it into the `APPLE_CERTIFICATE` secret.

### Step 4: Update package.json

The build configuration already supports code signing. When the secrets are configured, the build will automatically sign and notarize the app.

### Step 5: Build

Push a tag or trigger the workflow manually. The build will:

- Sign the app with your certificate
- Notarize it with Apple
- Create a properly signed DMG/ZIP that users can install without issues

---

## Troubleshooting

### Still Getting "Damaged" Error After Removing Quarantine?

1. Make sure you ran `xattr -cr` on the actual `.app` file, not the DMG
2. Try moving the app to `/Applications` first, then run the command
3. Check if macOS is blocking it in System Preferences > Security & Privacy

### Can't Find the App After Downloading?

- DMG files need to be **mounted** (double-click the DMG)
- Then **drag** Bazaar.app to your Applications folder
- ZIP files need to be **extracted** first (double-click the ZIP)

### App Won't Open Even After Removing Quarantine?

1. Check System Preferences > Security & Privacy for any blocked apps
2. Try right-clicking and selecting "Open" instead
3. Make sure you're running macOS 10.13 or later

---

## Security Note

The "damaged" error is macOS protecting you from potentially unsafe software. Only download Bazaar from the official GitHub releases page: https://github.com/akulsr0/bazaar/releases
