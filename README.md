<p align="center">
  <img src="https://assets.nativine.com/asset-1784820238974-121251783.png" alt="Nativine" width="120" />
</p>

<h1 align="center">nativine</h1>

<p align="center">
  The most powerful JavaScript bridge ever made for WebViews.<br>
  Access 50+ native device APIs from your web app with TypeScript support.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/nativine"><img src="https://img.shields.io/npm/v/nativine.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/nativine"><img src="https://img.shields.io/npm/dm/nativine.svg" alt="npm downloads" /></a>
  <a href="https://bundlephobia.com/package/nativine"><img src="https://img.shields.io/bundlephobia/minzip/nativine" alt="bundle size" /></a>
  <a href="https://www.npmjs.com/package/nativine"><img src="https://img.shields.io/npm/l/nativine.svg" alt="license" /></a>
</p>

---

## Features

- **50+ native APIs** across 12 namespaces
- **TypeScript-first** with full type declarations
- **Promise-based** async methods (no string callbacks)
- **3 output formats**: ESM, CJS, UMD (CDN-ready)
- **Tree-shakeable** — import only what you need
- **Graceful web fallback** — every method safely no-ops in browsers
- **Event system** — subscribe to `appResume`, `appPause`, `keyboardShow` events
- **Zero dependencies** in production

## Quick Start

### npm / yarn / pnpm

```bash
npm install nativine
```

```javascript
import nativine from 'nativine';

if (nativine.isNativeApp) {
  const info = await nativine.device.getInfo();
  console.log(`Running on ${info.model} (${info.platform})`);
}
```

### CDN / Script Tag

```html
<script src="https://cdn.jsdelivr.net/npm/nativine@latest/dist/nativine.umd.js"></script>
<script>
  if (Nativine.default.isNativeApp) {
    Nativine.default.haptics.vibrate(200);
  }
</script>
```

---

## API Reference

### Detection

```javascript
nativine.isNativeApp  // boolean — true if inside a Nativine app
nativine.platform     // 'android' | 'ios' | 'web'
nativine.isAndroid    // boolean
nativine.isIos        // boolean
nativine.version      // SDK version string
```

---

### 📱 Device

```javascript
const info = await nativine.device.getInfo();
// { model, manufacturer, osVersion, appVersion, appVersionCode,
//   packageName, locale, screenWidth, screenHeight, density, platform }

const insets = await nativine.device.getSafeAreaInsets();
// { top, bottom, left, right }

const version = await nativine.device.getAppVersion();
// "1.2.0"

const id = await nativine.device.getDeviceId();
// "a1b2c3d4-..." (anonymous, per-installation)
```

---

### 🎨 UI

```javascript
nativine.ui.statusBar({ color: '#1a1a2e', style: 'light' });
nativine.ui.navigationBar({ color: '#16213e' });
nativine.ui.hideSplashScreen();
nativine.ui.setOrientation('landscape'); // 'portrait' | 'landscape' | 'auto'
nativine.ui.showNativeComponents();
nativine.ui.hideNativeComponents();
nativine.ui.setPullToRefresh(false);
nativine.ui.setPinchToZoom(true);
```

---

### 🧭 Navigation

```javascript
nativine.navigation.goBack();
nativine.navigation.goForward();
nativine.navigation.navigate('/products');
nativine.navigation.openInBrowser('https://docs.nativine.com');
nativine.navigation.closeApp();
```

---

### 📳 Haptics

```javascript
nativine.haptics.vibrate(200); // duration in ms

nativine.haptics.feedback('light');   // light tap
nativine.haptics.feedback('medium');  // standard tap
nativine.haptics.feedback('heavy');   // strong tap
nativine.haptics.feedback('success'); // double tap pattern
nativine.haptics.feedback('error');   // triple tap pattern
nativine.haptics.feedback('warning');
nativine.haptics.feedback('selection');
```

---

### 💾 Storage (Persistent)

Data stored here survives WebView cache clears (uses SharedPreferences / UserDefaults).

```javascript
nativine.storage.set('auth_token', 'abc123');
const token = nativine.storage.get('auth_token');        // 'abc123'
const user = nativine.storage.get('missing_key', '{}');  // '{}'
nativine.storage.remove('auth_token');
nativine.storage.clear();
```

---

### 📤 Share

```javascript
nativine.share({
  title: 'Check this out!',
  text: 'Amazing content',
  url: 'https://example.com'
});

nativine.shareFile({
  filePath: '/storage/emulated/0/Download/report.pdf',
  mimeType: 'application/pdf'
});
```

---

### 🔐 Auth

```javascript
// Google Sign-In
const user = await nativine.auth.googleSignIn();
// { email, displayName, idToken, photoUrl, id }

await nativine.auth.googleSignOut();
```

---

### 🔒 Biometrics

```javascript
const { available, biometryType } = await nativine.biometrics.isAvailable();
// { available: true, biometryType: 'fingerprint' | 'face' | 'iris' }

const result = await nativine.biometrics.authenticate({
  reason: 'Verify identity',
  allowFallback: true
});
// { success: true }
```

---

### 👥 Contacts

```javascript
const contacts = await nativine.contacts.getAll();
// [{ name, phone, email }, ...]
```

---

### 📋 Clipboard

```javascript
await nativine.clipboard.copy('Copied text!');
const text = await nativine.clipboard.read();
```

---

### 📥 Downloads

```javascript
nativine.downloads.downloadFile({
  url: 'https://example.com/report.pdf',
  filename: 'monthly-report.pdf',
  openAfterDownload: true
});
```

---

### 📷 Scanner

```javascript
const result = await nativine.scanner.scan();
// { value: 'https://example.com', format: 'QR_CODE' }
```

---

### 📍 Location

```javascript
const loc = await nativine.location.getCurrent();
// { latitude, longitude, accuracy, altitude?, speed? }
```

---

### 🌐 Network

```javascript
const status = await nativine.network.isOnline();
// { online: true, type: 'wifi' | 'cellular' | 'none' }

const unsubscribe = nativine.network.onConnectivityChange((status) => {
  console.log(status.online ? 'Online' : 'Offline');
});

// Later: stop listening
unsubscribe();
```

---

### 🗑️ Cache

```javascript
nativine.cache.clear();
nativine.cache.clearCookies();
```

---

### 🖨️ Print

```javascript
nativine.print();
```

---

### 🛡️ Screenshot Protection

```javascript
nativine.screenshot.setProtection(true);  // Block screenshots
nativine.screenshot.setProtection(false); // Allow screenshots
```

---

### ⭐ Reviews

```javascript
nativine.reviews.request(); // Triggers Google Play / App Store review dialog
```

---

### 🔄 Updates

```javascript
nativine.updates.check(); // Triggers in-app update check (Android)
```

---

### 📺 Ads

```javascript
nativine.ads.showInterstitial();

const reward = await nativine.ads.showRewarded();
if (reward.rewarded) {
  unlockPremiumContent();
}
```

---

### 🔔 OneSignal

```javascript
nativine.onesignal.setExternalUserId('user_123');
nativine.onesignal.sendTag('plan', 'premium');
nativine.onesignal.sendTags({ plan: 'premium', language: 'en' });
const playerId = await nativine.onesignal.getPlayerId();
nativine.onesignal.removeExternalUserId();
```

---

### 🏃 Pedometer / Step Counter

```javascript
// Check availability
const { available } = await nativine.pedometer.isAvailable();

if (available) {
  // Start tracking
  nativine.pedometer.startTracking();
  
  // Listen for real-time updates
  nativine.on('stepUpdate', ({ steps }) => {
    console.log(`Current steps: ${steps}`);
  });
  
  // Or fetch manually
  const { steps } = await nativine.pedometer.getStepCount();
  
  // Stop tracking when done
  nativine.pedometer.stopTracking();
}
```

---

### 💬 Toast

```javascript
nativine.toast('Item added to cart!');
nativine.toast('Processing...', 'long'); // 'short' (~2s) or 'long' (~3.5s)
```

---

### 📡 Events

```javascript
// App lifecycle
nativine.on('appResume', () => fetchLatestData());
nativine.on('appPause', () => saveState());

// Bridge ready
nativine.on('pageReady', () => initializeApp());

// Keyboard
nativine.on('keyboardShow', ({ height }) => adjustLayout(height));
nativine.on('keyboardHide', () => resetLayout());

// Unsubscribe
const unsub = nativine.on('appResume', handler);
unsub(); // Remove this specific listener

// Remove all listeners for an event
nativine.off('appResume');

// Remove ALL listeners
nativine.off();
```

---

## Tree Shaking

Import only the modules you need to minimize bundle size:

```javascript
import { haptics, device, isNativeApp } from 'nativine';

if (isNativeApp) {
  haptics.vibrate(100);
}
```

---

## Requirements

- Nativine app built with template v2.0+
- Android 7.0+ (API 24+)
- iOS 14+ (coming soon)

## License

ISC © [Nativine](https://nativine.com)
