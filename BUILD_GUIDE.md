# 🚀 BUILD EXE INSTALLER - STEP BY STEP GUIDE

## ✅ WHAT I'VE PREPARED FOR YOU:

1. ✅ Updated `package.json` with electron-builder config
2. ✅ Created `electron.js` for production build
3. ✅ Configured Windows installer (NSIS)
4. ✅ Set icon and logo paths

---

## 📋 STEP-BY-STEP INSTRUCTIONS:

### STEP 1: Build the React App
Open Command Prompt in CMS folder:
```bash
cd C:\Users\JICO\Desktop\CMS
npm run build
```
Wait for "Compiled successfully!" message.

---

### STEP 2: Create the EXE
Run this command:
```bash
npm run package
```

This will:
- Build the React app
- Package it with Electron
- Create Windows installer in `dist` folder

**Wait 5-10 minutes** for the build to complete.

---

### STEP 3: Find Your Installer
After build completes, go to:
```
C:\Users\JICO\Desktop\CMS\dist
```

You'll find:
- `Jinja College CMS Setup 1.0.0.exe` - **THIS IS YOUR INSTALLER**

---

## 🎯 WHAT THE INSTALLER DOES:

When you run the installer:
1. Shows installation wizard
2. Lets you choose installation folder
3. Creates desktop shortcut
4. Creates Start Menu shortcut
5. Installs the app

---

## 🔧 IF YOU WANT TO USE PAQUET BUILDER:

### Option A: Use the Unpacked App
Run this command instead:
```bash
npm run package-dir
```

This creates unpacked app in:
```
C:\Users\JICO\Desktop\CMS\dist\win-unpacked
```

Then use Paquet Builder to create installer from that folder.

### Option B: Use the Built EXE
Just use the `Jinja College CMS Setup 1.0.0.exe` file directly.

---

## 📁 IMPORTANT FILES:

### Icon File:
- Current: `public/icon.png`
- To change: Replace `public/icon.png` with your icon (PNG format, 256x256px recommended)

### Logo File:
- Current: `src/assets/logo.jpg`
- This is used inside the app (login page, topbar)
- Already working correctly

---

## 🎨 TO CHANGE ICON:

1. Get your icon file (PNG or ICO format)
2. Rename it to `icon.png`
3. Replace `C:\Users\JICO\Desktop\CMS\public\icon.png`
4. Run `npm run package` again

---

## ⚠️ TROUBLESHOOTING:

### If build fails:
```bash
npm install electron-builder --save-dev
npm run package
```

### If "electron-builder not found":
```bash
npm install
npm run package
```

### If icon doesn't show:
- Make sure `public/icon.png` exists
- Use PNG format (256x256px)
- Rebuild with `npm run package`

---

## 🚀 QUICK START COMMANDS:

```bash
# Build installer (recommended)
npm run package

# Build unpacked app (for Paquet Builder)
npm run package-dir

# Test the app before building
npm start
```

---

## 📦 WHAT YOU GET:

After `npm run package`:
```
dist/
├── Jinja College CMS Setup 1.0.0.exe  ← INSTALLER (Share this!)
├── win-unpacked/                       ← Unpacked app files
└── builder-effective-config.yaml      ← Build config
```

---

## ✅ FINAL CHECKLIST:

- [ ] Run `npm run build` - React app built
- [ ] Run `npm run package` - Installer created
- [ ] Check `dist` folder - Installer exists
- [ ] Test installer - Install and run app
- [ ] App works - Database connects, features work
- [ ] Icon shows - Correct icon in taskbar/desktop
- [ ] Logo shows - Correct logo in app

---

## 🎯 READY TO BUILD!

Just run:
```bash
cd C:\Users\JICO\Desktop\CMS
npm run package
```

Wait 5-10 minutes, then check `dist` folder for your installer!

**The installer will be named: `Jinja College CMS Setup 1.0.0.exe`**

---

## 📞 NOTES:

- The app will connect to your Supabase database (from .env file)
- All features will work exactly as in development
- Icon and logo stay the same
- Desktop shortcut created automatically
- Start Menu shortcut created automatically

**EVERYTHING STAYS AS IT WORKS NOW! ✅**
