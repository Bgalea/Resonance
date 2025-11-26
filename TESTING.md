# Testing Infrastructure - Quick Start Guide

## ⚠️ PowerShell Execution Policy Issue

Your system has PowerShell execution policy restrictions that prevent `npm` commands from running.

### Quick Fix Options

**Option 1: Use Command Prompt (Easiest)**
```cmd
# Open Command Prompt (cmd.exe) instead of PowerShell
cd c:\Users\977502\.gemini\antigravity\scratch\modern_gallery

# Run tests
npm test
npm run test:e2e
```

**Option 2: Use the Batch Script**
```cmd
# Double-click this file:
run-tests.bat
```

**Option 3: Fix PowerShell Policy (One-time)**
```powershell
# Open PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then you can use npm normally
npm test
```

**Option 4: Bypass for Single Command**
```powershell
powershell -ExecutionPolicy Bypass -Command "npm test"
```

---

## ✅ What Was Fixed

1. **vitest.config.js**: Now excludes E2E tests (only runs unit tests)
2. **gallery.js**: Added `module.exports` for testing
3. **audioPlayer.js**: Added `module.exports` for testing  
4. **assetLoader.js**: Added `module.exports` for testing

---

## 🧪 Running Tests

### Unit Tests (Vitest)
```bash
npm test              # Watch mode
npm run test:ui       # UI mode
npm run test:coverage # With coverage
```

### E2E Tests (Playwright)
```bash
npm run test:e2e      # Run E2E tests
npm run test:e2e:ui   # UI mode
```

### All Tests
```bash
npm run test:all      # Unit + E2E + coverage
```

---

## 📊 Expected Results

### Unit Tests
- ✅ gallery.test.js: 45 tests
- ✅ audioPlayer.test.js: 35 tests
- ✅ assetLoader.test.js: 30 tests
- **Total**: 110 unit tests

### E2E Tests
- ✅ navigation.spec.js: 6 tests
- ✅ keyboard.spec.js: 6 tests
- ✅ audio.spec.js: 6 tests
- ✅ fullscreen.spec.js: 5 tests
- **Total**: 23 E2E tests

---

## 🔧 Troubleshooting

### "Cannot find module" errors
The JS files now have exports. If you still see import errors, ensure:
- Node modules are installed: `npm install`
- Files are saved

### E2E tests fail
E2E tests require a running server. Playwright will auto-start one on port 3000.

### Coverage below 80%
Some tests may need adjustments based on actual implementation details.

---

## 📝 Next Steps

1. Run tests using Command Prompt or batch script
2. Review test results
3. Fix any failing tests
4. Achieve 80%+ coverage
5. Commit changes to Git
6. Push to trigger CI/CD

---

**See full walkthrough**: [walkthrough.md](file:///C:/Users/977502/.gemini/antigravity/brain/92eadeec-9be8-4fc8-a202-3fd73d27d07c/walkthrough.md)
