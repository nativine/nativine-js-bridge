/**
 * Nativine Platform Detection
 *
 * Detects whether the web page is running inside a Nativine-powered native app
 * and identifies the platform (Android, iOS, or Web).
 */
/**
 * Detects the current platform by checking for native bridge objects
 * injected by the Nativine native shell.
 */
function detectPlatform() {
    if (typeof window === 'undefined')
        return 'web';
    // Android: The Kotlin WebView injects `window.nativine` via addJavascriptInterface
    if (window.nativine && typeof window.nativine.vibrate === 'function') {
        return 'android';
    }
    // Android fallback: check for NativineAndroid bridge
    if (window.NativineAndroid && typeof window.NativineAndroid.postMessage === 'function') {
        return 'android';
    }
    // iOS: WebKit message handlers are injected via WKScriptMessageHandler
    if (window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.nativine) {
        return 'ios';
    }
    return 'web';
}
/** The detected platform: `'android'`, `'ios'`, or `'web'` */
const platform = detectPlatform();
/** `true` if the page is running inside a Nativine native app (Android or iOS) */
const isNativeApp = platform !== 'web';
/** `true` if the page is running inside a Nativine Android app */
const isAndroid = platform === 'android';
/** `true` if the page is running inside a Nativine iOS app */
const isIos = platform === 'ios';

/**
 * Nativine Bridge Dispatcher
 *
 * Low-level bridge call mechanism that provides a unified, Promise-based interface
 * for communicating with the native Android/iOS app shell.
 *
 * Architecture:
 * - Android: Calls `window.nativine.<method>(args, callbackId)` via @JavascriptInterface
 * - iOS: Calls `window.webkit.messageHandlers.nativine.postMessage({ method, args, callbackId })`
 * - Web: Returns rejected promises or no-ops gracefully
 *
 * The native side resolves the Promise by calling: `window[callbackId](jsonResult)`
 */
/** Counter for generating unique callback IDs */
let _callbackCounter = 0;
/** Default timeout for bridge calls (10 seconds) */
const DEFAULT_TIMEOUT_MS = 10000;
/**
 * Error thrown when a bridge method is called outside a native app context.
 */
class NativineNotAvailableError extends Error {
    constructor(method) {
        super(`nativine.${method}() is not available — page is not running inside a Nativine app.`);
        this.name = 'NativineNotAvailableError';
    }
}
/**
 * Error thrown when a bridge call times out waiting for native response.
 */
class NativineTimeoutError extends Error {
    constructor(method, timeoutMs) {
        super(`nativine.${method}() timed out after ${timeoutMs}ms waiting for native response.`);
        this.name = 'NativineTimeoutError';
    }
}
/**
 * Makes an async call to the native bridge and returns a Promise that resolves
 * when the native side responds via the callback.
 *
 * @param method - The native method name to call (e.g., 'getDeviceInfo')
 * @param args - Optional arguments to pass to the native method (serialized as JSON string)
 * @param timeoutMs - Timeout in milliseconds (default: 10s)
 * @returns Promise that resolves with the parsed native response
 */
function callNativeAsync(method, args, timeoutMs = DEFAULT_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
        if (!isNativeApp) {
            reject(new NativineNotAvailableError(method));
            return;
        }
        const callbackId = `__nativine_cb_${++_callbackCounter}_${Date.now()}`;
        let settled = false;
        // Timeout guard
        const timer = setTimeout(() => {
            if (!settled) {
                settled = true;
                cleanup();
                reject(new NativineTimeoutError(method, timeoutMs));
            }
        }, timeoutMs);
        const cleanup = () => {
            delete window[callbackId];
            delete window[`${callbackId}_error`];
            clearTimeout(timer);
        };
        // Register success callback
        window[callbackId] = (result) => {
            if (settled)
                return;
            settled = true;
            cleanup();
            try {
                const parsed = typeof result === 'string' ? JSON.parse(result) : result;
                resolve(parsed);
            }
            catch (_a) {
                // If it's not JSON, return raw string
                resolve(result);
            }
        };
        // Register error callback
        window[`${callbackId}_error`] = (error) => {
            if (settled)
                return;
            settled = true;
            cleanup();
            reject(new Error(error || `Native method '${method}' failed`));
        };
        // Dispatch the call to the appropriate native bridge
        try {
            const argsString = args ? JSON.stringify(args) : '';
            if (isAndroid) {
                const bridge = window.nativine;
                if (bridge && typeof bridge[method] === 'function') {
                    bridge[method](argsString, callbackId);
                }
                else {
                    // Fallback: use NativineAndroid.postMessage for methods handled there
                    const androidBridge = window.NativineAndroid;
                    if (androidBridge && typeof androidBridge.postMessage === 'function') {
                        androidBridge.postMessage(JSON.stringify({
                            action: method,
                            payload: args || {},
                            callbackId,
                        }));
                    }
                    else {
                        settled = true;
                        cleanup();
                        reject(new Error(`Native method '${method}' not found on bridge`));
                    }
                }
            }
            else if (isIos) {
                window.webkit.messageHandlers.nativine.postMessage({
                    method,
                    args: args || {},
                    callbackId,
                });
            }
        }
        catch (e) {
            if (!settled) {
                settled = true;
                cleanup();
                reject(e);
            }
        }
    });
}
/**
 * Makes a synchronous (fire-and-forget) call to the native bridge.
 * Used for methods that don't need a return value (e.g., vibrate, statusBar).
 *
 * @param method - The native method name to call
 * @param args - Optional arguments
 */
function callNativeSync(method, args) {
    if (!isNativeApp)
        return; // Silent no-op on web
    try {
        const argsString = args ? JSON.stringify(args) : '';
        if (isAndroid) {
            const bridge = window.nativine;
            if (bridge && typeof bridge[method] === 'function') {
                bridge[method](argsString);
            }
            else {
                // Fallback: postMessage for actions handled in the message handler
                const androidBridge = window.NativineAndroid;
                if (androidBridge && typeof androidBridge.postMessage === 'function') {
                    androidBridge.postMessage(JSON.stringify({
                        action: method,
                        payload: args || {},
                    }));
                }
            }
        }
        else if (isIos) {
            window.webkit.messageHandlers.nativine.postMessage({
                method,
                args: args || {},
            });
        }
    }
    catch (e) {
        // Silent fail on web or if bridge is unavailable
        if (typeof console !== 'undefined') {
            console.warn(`[nativine] Failed to call native method '${method}':`, e);
        }
    }
}

/**
 * Device Module
 *
 * Access device hardware/software information, safe area insets,
 * app version, and anonymous device identifiers.
 */
/**
 * Get comprehensive device information.
 *
 * @example
 * ```js
 * const info = await nativine.device.getInfo();
 * console.log(info.model); // "Pixel 8"
 * console.log(info.appVersion); // "1.2.0"
 * ```
 */
async function getInfo() {
    if (!isNativeApp) {
        return {
            model: navigator.userAgent,
            manufacturer: 'unknown',
            osVersion: 'unknown',
            appVersion: '0.0.0',
            appVersionCode: 0,
            packageName: 'web',
            locale: navigator.language || 'en',
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            density: window.devicePixelRatio || 1,
            platform,
        };
    }
    return callNativeAsync('getDeviceInfo');
}
/**
 * Get the current safe area insets.
 * Useful for positioning UI elements to avoid notches and system bars.
 *
 * @example
 * ```js
 * const insets = await nativine.device.getSafeAreaInsets();
 * element.style.paddingTop = `${insets.top}px`;
 * ```
 */
async function getSafeAreaInsets() {
    if (!isNativeApp) {
        return { top: 0, bottom: 0, left: 0, right: 0 };
    }
    return callNativeAsync('getSafeAreaInsets');
}
/**
 * Get the app's version name string (e.g., "1.2.0").
 *
 * @example
 * ```js
 * const version = await nativine.device.getAppVersion();
 * // "1.2.0"
 * ```
 */
async function getAppVersion() {
    if (!isNativeApp)
        return '0.0.0';
    const info = await callNativeAsync('getDeviceInfo');
    return info.appVersion;
}
/**
 * Get an anonymous, persistent device identifier.
 * This ID is unique per app installation (not a hardware ID).
 * Resets when the app is reinstalled.
 *
 * @example
 * ```js
 * const id = await nativine.device.getDeviceId();
 * // "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 * ```
 */
async function getDeviceId() {
    if (!isNativeApp)
        return 'web-' + Math.random().toString(36).slice(2);
    return callNativeAsync('getDeviceId');
}

var device = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getAppVersion: getAppVersion,
    getDeviceId: getDeviceId,
    getInfo: getInfo,
    getSafeAreaInsets: getSafeAreaInsets
});

/**
 * UI Module
 *
 * Control native UI elements: status bar, navigation bar, splash screen,
 * screen orientation, and native component visibility.
 */
/**
 * Configure the native status bar appearance.
 *
 * @example
 * ```js
 * nativine.ui.statusBar({ color: '#1a1a2e', style: 'light' });
 * ```
 */
function statusBar(options) {
    callNativeSync('setStatusBar', options);
}
/**
 * Configure the native navigation bar appearance (Android only).
 *
 * @example
 * ```js
 * nativine.ui.navigationBar({ color: '#16213e' });
 * ```
 */
function navigationBar(options) {
    callNativeSync('setNavigationBar', options);
}
/**
 * Programmatically hide the splash screen.
 * Useful when your web app needs time to load data before revealing the UI.
 *
 * @example
 * ```js
 * await fetchInitialData();
 * nativine.ui.hideSplashScreen();
 * ```
 */
function hideSplashScreen() {
    callNativeSync('hideSplashScreen');
}
/**
 * Lock the screen to a specific orientation.
 *
 * @param mode - 'portrait' | 'landscape' | 'auto'
 *
 * @example
 * ```js
 * // Lock to landscape for a video player
 * nativine.ui.setOrientation('landscape');
 *
 * // Unlock when done
 * nativine.ui.setOrientation('auto');
 * ```
 */
function setOrientation(mode) {
    callNativeSync('setOrientation', { mode });
}
/**
 * Show native UI components (header, bottom nav, floating button).
 * Reverses the effect of `hideNativeComponents()`.
 *
 * @example
 * ```js
 * nativine.ui.showNativeComponents();
 * ```
 */
function showNativeComponents() {
    callNativeSync('showNativeComponents');
}
/**
 * Hide all native UI components (header, bottom nav, floating button).
 * Useful for fullscreen content like videos or immersive experiences.
 *
 * @example
 * ```js
 * // Enter fullscreen mode
 * nativine.ui.hideNativeComponents();
 * ```
 */
function hideNativeComponents() {
    callNativeSync('hideNativeComponents');
}
/**
 * Toggle pull-to-refresh behavior.
 *
 * @param enabled - Whether pull-to-refresh should be enabled
 *
 * @example
 * ```js
 * // Disable on a page with custom scroll behavior
 * nativine.ui.setPullToRefresh(false);
 * ```
 */
function setPullToRefresh(enabled) {
    callNativeSync('setPullToRefresh', { enabled });
}
/**
 * Toggle pinch-to-zoom behavior.
 *
 * @param enabled - Whether pinch-to-zoom should be enabled
 *
 * @example
 * ```js
 * // Enable for an image gallery
 * nativine.ui.setPinchToZoom(true);
 * ```
 */
function setPinchToZoom(enabled) {
    callNativeSync('setPinchToZoom', { enabled });
}

var ui = /*#__PURE__*/Object.freeze({
    __proto__: null,
    hideNativeComponents: hideNativeComponents,
    hideSplashScreen: hideSplashScreen,
    navigationBar: navigationBar,
    setOrientation: setOrientation,
    setPinchToZoom: setPinchToZoom,
    setPullToRefresh: setPullToRefresh,
    showNativeComponents: showNativeComponents,
    statusBar: statusBar
});

/**
 * Navigation Module
 *
 * Control in-app navigation: go back, go forward, navigate to URLs,
 * open external browser, and close the app.
 */
/**
 * Navigate the WebView back one page in history.
 * No-op if there's no back history.
 *
 * @example
 * ```js
 * nativine.navigation.goBack();
 * ```
 */
function goBack() {
    if (!isNativeApp) {
        window.history.back();
        return;
    }
    callNativeSync('goBack');
}
/**
 * Navigate the WebView forward one page in history.
 * No-op if there's no forward history.
 *
 * @example
 * ```js
 * nativine.navigation.goForward();
 * ```
 */
function goForward() {
    if (!isNativeApp) {
        window.history.forward();
        return;
    }
    callNativeSync('goForward');
}
/**
 * Navigate the WebView to a specific URL.
 * Supports both absolute URLs and relative paths.
 *
 * @param url - The URL or path to navigate to
 *
 * @example
 * ```js
 * nativine.navigation.navigate('/products');
 * nativine.navigation.navigate('https://example.com/page');
 * ```
 */
function navigate(url) {
    if (!isNativeApp) {
        window.location.href = url;
        return;
    }
    callNativeSync('navigate', { url });
}
/**
 * Open a URL in the device's default external browser.
 * The user leaves the app temporarily.
 *
 * @param url - The URL to open externally
 *
 * @example
 * ```js
 * nativine.navigation.openInBrowser('https://docs.nativine.com');
 * ```
 */
function openInBrowser(url) {
    if (!isNativeApp) {
        window.open(url, '_blank');
        return;
    }
    callNativeSync('openInBrowser', { url });
}
/**
 * Close the app. On Android, this finishes the Activity.
 *
 * @example
 * ```js
 * nativine.navigation.closeApp();
 * ```
 */
function closeApp() {
    callNativeSync('closeApp');
}

var navigation = /*#__PURE__*/Object.freeze({
    __proto__: null,
    closeApp: closeApp,
    goBack: goBack,
    goForward: goForward,
    navigate: navigate,
    openInBrowser: openInBrowser
});

/**
 * Haptics Module
 *
 * Trigger device vibrations and haptic feedback patterns.
 */
/**
 * Vibrate the device for a specified duration.
 *
 * @param durationMs - Duration in milliseconds (default: 100ms)
 *
 * @example
 * ```js
 * nativine.haptics.vibrate(200);
 * ```
 */
function vibrate(durationMs = 100) {
    if (!isNativeApp) {
        // Web Vibration API fallback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(durationMs);
        }
        return;
    }
    callNativeSync('vibrate', { duration: durationMs });
}
/**
 * Trigger a predefined haptic feedback pattern.
 *
 * @param type - The type of haptic feedback
 *
 * Feedback types:
 * - `'light'` — Subtle tap (e.g., toggle switch)
 * - `'medium'` — Standard tap (e.g., button press)
 * - `'heavy'` — Strong tap (e.g., action confirmation)
 * - `'success'` — Success pattern (double tap)
 * - `'error'` — Error pattern (triple tap)
 * - `'warning'` — Warning pattern
 * - `'selection'` — Selection change (lightest)
 *
 * @example
 * ```js
 * // On button click
 * nativine.haptics.feedback('medium');
 *
 * // On form validation error
 * nativine.haptics.feedback('error');
 *
 * // On successful payment
 * nativine.haptics.feedback('success');
 * ```
 */
function feedback(type = 'medium') {
    if (!isNativeApp) {
        // Web fallback: simple vibration pattern
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            const patterns = {
                light: 10,
                medium: 30,
                heavy: 50,
                success: [30, 50, 30],
                error: [30, 30, 30, 30, 30],
                warning: [30, 50, 50],
                selection: 5,
            };
            navigator.vibrate(patterns[type] || 30);
        }
        return;
    }
    callNativeSync('hapticFeedback', { type });
}

var haptics = /*#__PURE__*/Object.freeze({
    __proto__: null,
    feedback: feedback,
    vibrate: vibrate
});

/**
 * Storage Module
 *
 * Persistent key-value storage that survives WebView cache clears.
 * Data is stored in Android SharedPreferences / iOS UserDefaults,
 * not in the WebView's localStorage.
 */
/**
 * Store a value persistently in native storage.
 * This data persists even when the WebView cache is cleared.
 *
 * @param key - The storage key
 * @param value - The value to store (will be serialized to string)
 *
 * @example
 * ```js
 * await nativine.storage.set('auth_token', 'abc123');
 * await nativine.storage.set('user', JSON.stringify({ name: 'John' }));
 * ```
 */
function set(key, value) {
    if (!isNativeApp) {
        try {
            localStorage.setItem(`nativine_${key}`, value);
        }
        catch (e) { /* quota exceeded */ }
        return;
    }
    if (isAndroid) {
        // Direct call — AppJsBridge.setLocalData() is synchronous
        const bridge = window.nativine;
        if (bridge && typeof bridge.setLocalData === 'function') {
            bridge.setLocalData(key, value);
            return;
        }
    }
    callNativeSync('setLocalData', { key, value });
}
/**
 * Retrieve a value from native persistent storage.
 *
 * @param key - The storage key
 * @param defaultValue - Value to return if key doesn't exist (default: '')
 * @returns The stored value, or defaultValue if not found
 *
 * @example
 * ```js
 * const token = nativine.storage.get('auth_token');
 * const user = JSON.parse(nativine.storage.get('user', '{}'));
 * ```
 */
function get(key, defaultValue = '') {
    if (!isNativeApp) {
        try {
            return localStorage.getItem(`nativine_${key}`) || defaultValue;
        }
        catch (_a) {
            return defaultValue;
        }
    }
    if (isAndroid) {
        // Direct synchronous return via @JavascriptInterface
        const bridge = window.nativine;
        if (bridge && typeof bridge.getLocalData === 'function') {
            return bridge.getLocalData(key, defaultValue);
        }
    }
    return defaultValue;
}
/**
 * Remove a specific key from native persistent storage.
 *
 * @param key - The storage key to remove
 *
 * @example
 * ```js
 * nativine.storage.remove('auth_token');
 * ```
 */
function remove(key) {
    if (!isNativeApp) {
        try {
            localStorage.removeItem(`nativine_${key}`);
        }
        catch ( /* ignore */_a) { /* ignore */ }
        return;
    }
    if (isAndroid) {
        const bridge = window.nativine;
        if (bridge && typeof bridge.removeLocalData === 'function') {
            bridge.removeLocalData(key);
            return;
        }
    }
    callNativeSync('removeLocalData', { key });
}
/**
 * Clear all data from native persistent storage.
 *
 * @example
 * ```js
 * // On logout
 * nativine.storage.clear();
 * ```
 */
function clear$1() {
    if (!isNativeApp) {
        try {
            const keys = Object.keys(localStorage).filter(k => k.startsWith('nativine_'));
            keys.forEach(k => localStorage.removeItem(k));
        }
        catch ( /* ignore */_a) { /* ignore */ }
        return;
    }
    if (isAndroid) {
        const bridge = window.nativine;
        if (bridge && typeof bridge.clearLocalData === 'function') {
            bridge.clearLocalData();
            return;
        }
    }
    callNativeSync('clearLocalData');
}

var storage = /*#__PURE__*/Object.freeze({
    __proto__: null,
    clear: clear$1,
    get: get,
    remove: remove,
    set: set
});

/**
 * Share Module
 *
 * Trigger the native share sheet to share text, URLs, and files.
 */
/**
 * Open the native share sheet with the specified content.
 *
 * @example
 * ```js
 * nativine.share.share({
 *   title: 'Check this out',
 *   text: 'Amazing app!',
 *   url: 'https://example.com'
 * });
 * ```
 */
function share(options) {
    if (!isNativeApp) {
        // Web Share API fallback
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share(options).catch(() => { });
        }
        return;
    }
    callNativeSync('share', options);
}
/**
 * Share a file using the native share sheet.
 *
 * @example
 * ```js
 * nativine.share.shareFile({
 *   filePath: '/storage/emulated/0/Download/report.pdf',
 *   mimeType: 'application/pdf'
 * });
 * ```
 */
function shareFile(options) {
    callNativeSync('shareFile', options);
}

/**
 * Auth Module
 *
 * Native Google Sign-In integration. Triggers the native Google Sign-In flow
 * and returns user credentials to your web app.
 */
/**
 * Trigger the native Google Sign-In flow.
 * Returns user credentials when the user completes sign-in.
 *
 * @returns Promise resolving with Google user credentials
 *
 * @example
 * ```js
 * try {
 *   const user = await nativine.auth.googleSignIn();
 *   console.log(user.email); // "john@gmail.com"
 *   console.log(user.idToken); // Send to your backend for verification
 * } catch (err) {
 *   console.log('Sign-in cancelled or failed');
 * }
 * ```
 */
async function googleSignIn() {
    if (!isNativeApp) {
        throw new Error('nativine.auth.googleSignIn() is only available inside a Nativine app.');
    }
    return callNativeAsync('googleSignIn');
}
/**
 * Sign out of the current Google account.
 *
 * @example
 * ```js
 * await nativine.auth.googleSignOut();
 * ```
 */
function googleSignOut() {
    if (!isNativeApp)
        return;
    if (isAndroid) {
        const bridge = window.NativineAndroid;
        if (bridge && typeof bridge.postMessage === 'function') {
            bridge.postMessage(JSON.stringify({ action: 'google_signout' }));
            return;
        }
    }
    callNativeSync('googleSignOut');
}

var auth = /*#__PURE__*/Object.freeze({
    __proto__: null,
    googleSignIn: googleSignIn,
    googleSignOut: googleSignOut
});

/**
 * Biometrics Module
 *
 * Trigger native biometric authentication (fingerprint, face recognition, iris scan).
 */
/**
 * Check if biometric authentication is available on this device.
 *
 * @returns Promise resolving with availability info
 *
 * @example
 * ```js
 * const { available, biometryType } = await nativine.biometrics.isAvailable();
 * if (available) {
 *   console.log(`Biometric type: ${biometryType}`); // "fingerprint"
 * }
 * ```
 */
async function isAvailable$1() {
    if (!isNativeApp) {
        return { available: false, biometryType: 'none' };
    }
    return callNativeAsync('isBiometricAvailable');
}
/**
 * Trigger biometric authentication.
 *
 * @param options - Configuration for the authentication prompt
 * @returns Promise resolving with the authentication result
 *
 * @example
 * ```js
 * const result = await nativine.biometrics.authenticate({
 *   reason: 'Verify your identity to access settings',
 *   allowFallback: true
 * });
 *
 * if (result.success) {
 *   // User authenticated
 *   showSensitiveContent();
 * }
 * ```
 */
async function authenticate(options = {}) {
    if (!isNativeApp) {
        throw new Error('nativine.biometrics.authenticate() is only available inside a Nativine app.');
    }
    return callNativeAsync('authenticateBiometric', options);
}

var biometrics = /*#__PURE__*/Object.freeze({
    __proto__: null,
    authenticate: authenticate,
    isAvailable: isAvailable$1
});

/**
 * Contacts Module
 *
 * Access the device's native contact list (requires user permission).
 */
/**
 * Retrieve the user's contacts from the native contact book.
 * Prompts for permission if not already granted.
 *
 * @returns Promise resolving with an array of contacts
 *
 * @example
 * ```js
 * const contacts = await nativine.contacts.getAll();
 * contacts.forEach(c => {
 *   console.log(`${c.name}: ${c.phone}`);
 * });
 * ```
 */
async function getAll() {
    if (!isNativeApp) {
        // Web Contacts API fallback (if available)
        if ('contacts' in navigator && 'ContactsManager' in window) {
            try {
                const props = ['name', 'tel', 'email'];
                const contacts = await navigator.contacts.select(props, { multiple: true });
                return contacts.map((c) => {
                    var _a, _b, _c;
                    return ({
                        name: ((_a = c.name) === null || _a === void 0 ? void 0 : _a[0]) || '',
                        phone: ((_b = c.tel) === null || _b === void 0 ? void 0 : _b[0]) || '',
                        email: ((_c = c.email) === null || _c === void 0 ? void 0 : _c[0]) || '',
                    });
                });
            }
            catch (_a) {
                return [];
            }
        }
        return [];
    }
    return callNativeAsync('getContacts');
}

var contacts = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getAll: getAll
});

/**
 * Clipboard Module
 *
 * Read from and write to the device clipboard.
 */
/**
 * Copy text to the device clipboard.
 *
 * @param text - The text to copy
 *
 * @example
 * ```js
 * await nativine.clipboard.copy('https://example.com/share/abc123');
 * ```
 */
async function copy(text) {
    if (!isNativeApp) {
        // Web Clipboard API fallback
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        }
        else {
            // Legacy fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        return;
    }
    callNativeSync('copyToClipboard', { text });
}
/**
 * Read text from the device clipboard.
 *
 * @returns Promise resolving with the clipboard text content
 *
 * @example
 * ```js
 * const text = await nativine.clipboard.read();
 * console.log('Clipboard:', text);
 * ```
 */
async function read() {
    if (!isNativeApp) {
        // Web Clipboard API fallback
        if (navigator.clipboard && navigator.clipboard.readText) {
            return navigator.clipboard.readText();
        }
        return '';
    }
    return callNativeAsync('readClipboard');
}

var clipboard = /*#__PURE__*/Object.freeze({
    __proto__: null,
    copy: copy,
    read: read
});

/**
 * Downloads Module
 *
 * Trigger native file downloads using the device's download manager.
 */
/**
 * Download a file using the native download manager.
 * Shows a notification with download progress on Android.
 *
 * @param options - Download configuration
 *
 * @example
 * ```js
 * nativine.downloads.downloadFile({
 *   url: 'https://example.com/report.pdf',
 *   filename: 'monthly-report.pdf',
 *   openAfterDownload: true
 * });
 * ```
 */
function downloadFile(options) {
    if (!isNativeApp) {
        // Web fallback: trigger download via anchor tag
        const a = document.createElement('a');
        a.href = options.url;
        a.download = options.filename || '';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
    }
    callNativeSync('downloadFile', options);
}

var downloads = /*#__PURE__*/Object.freeze({
    __proto__: null,
    downloadFile: downloadFile
});

/**
 * Camera / Scanner Module
 *
 * Access the device camera for barcode and QR code scanning.
 */
/**
 * Open the native barcode/QR code scanner.
 *
 * @param options - Scanner configuration
 * @returns Promise resolving with the scanned code data
 *
 * @example
 * ```js
 * try {
 *   const result = await nativine.scanner.scan();
 *   console.log(result.value);  // "https://example.com"
 *   console.log(result.format); // "QR_CODE"
 * } catch (err) {
 *   console.log('Scan cancelled');
 * }
 * ```
 */
async function scan(options = {}) {
    if (!isNativeApp) {
        throw new Error('nativine.scanner.scan() is only available inside a Nativine app.');
    }
    return callNativeAsync('scanBarcode', options);
}

var camera = /*#__PURE__*/Object.freeze({
    __proto__: null,
    scan: scan
});

/**
 * Location Module
 *
 * Access the device's GPS location.
 */
/**
 * Get the device's current GPS location.
 * Prompts for location permission if not already granted.
 *
 * @returns Promise resolving with location coordinates
 *
 * @example
 * ```js
 * const loc = await nativine.location.getCurrent();
 * console.log(`Lat: ${loc.latitude}, Lng: ${loc.longitude}`);
 * console.log(`Accuracy: ${loc.accuracy}m`);
 * ```
 */
async function getCurrent() {
    if (!isNativeApp) {
        // Web Geolocation API fallback
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported in this browser'));
                return;
            }
            navigator.geolocation.getCurrentPosition((pos) => resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                altitude: pos.coords.altitude || undefined,
                speed: pos.coords.speed || undefined,
            }), (err) => reject(new Error(err.message)), { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
        });
    }
    return callNativeAsync('getCurrentLocation');
}

var location = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getCurrent: getCurrent
});

/**
 * Network Module
 *
 * Check connectivity status and listen for network changes.
 */
const _listeners = [];
/**
 * Check if the device currently has network connectivity.
 *
 * @returns Promise resolving with connectivity status
 *
 * @example
 * ```js
 * const status = await nativine.network.isOnline();
 * if (!status.online) {
 *   showOfflineBanner();
 * }
 * ```
 */
async function isOnline() {
    if (!isNativeApp) {
        return {
            online: typeof navigator !== 'undefined' ? navigator.onLine : true,
            type: 'unknown',
        };
    }
    return callNativeAsync('getConnectivityStatus');
}
/**
 * Listen for network connectivity changes.
 *
 * @param callback - Function called when connectivity changes
 * @returns Unsubscribe function to stop listening
 *
 * @example
 * ```js
 * const unsubscribe = nativine.network.onConnectivityChange((status) => {
 *   if (!status.online) {
 *     showOfflineBanner();
 *   } else {
 *     hideOfflineBanner();
 *   }
 * });
 *
 * // Later: stop listening
 * unsubscribe();
 * ```
 */
function onConnectivityChange(callback) {
    _listeners.push(callback);
    // Set up web fallback listener
    if (!isNativeApp) {
        const onlineHandler = () => callback({ online: true, type: 'unknown' });
        const offlineHandler = () => callback({ online: false, type: 'none' });
        window.addEventListener('online', onlineHandler);
        window.addEventListener('offline', offlineHandler);
        return () => {
            const idx = _listeners.indexOf(callback);
            if (idx !== -1)
                _listeners.splice(idx, 1);
            window.removeEventListener('online', onlineHandler);
            window.removeEventListener('offline', offlineHandler);
        };
    }
    // Register native listener
    callNativeSync('registerConnectivityListener');
    return () => {
        const idx = _listeners.indexOf(callback);
        if (idx !== -1)
            _listeners.splice(idx, 1);
        if (_listeners.length === 0) {
            callNativeSync('unregisterConnectivityListener');
        }
    };
}
/**
 * Internal: Called by the native side when connectivity changes.
 * Dispatches to all registered listeners.
 * @internal
 */
function _onConnectivityChanged(status) {
    _listeners.forEach(cb => {
        try {
            cb(status);
        }
        catch (e) {
            console.error('[nativine] Connectivity listener error:', e);
        }
    });
}
// Register global handler for native callbacks
if (typeof window !== 'undefined') {
    window.__nativine_onConnectivityChanged = (json) => {
        try {
            const status = typeof json === 'string' ? JSON.parse(json) : json;
            _onConnectivityChanged(status);
        }
        catch (e) { /* ignore */ }
    };
}

var network = /*#__PURE__*/Object.freeze({
    __proto__: null,
    _onConnectivityChanged: _onConnectivityChanged,
    isOnline: isOnline,
    onConnectivityChange: onConnectivityChange
});

/**
 * Cache Module
 *
 * Clear WebView cache and cookies.
 */
/**
 * Clear the WebView cache (CSS, JS, images, etc.).
 * Shows a confirmation dialog to the user.
 *
 * @example
 * ```js
 * nativine.cache.clear();
 * ```
 */
function clear() {
    if (!isNativeApp)
        return;
    callNativeSync('clear_cache');
}
/**
 * Clear all WebView cookies.
 * Useful for logout flows to ensure session data is wiped.
 *
 * @example
 * ```js
 * nativine.cache.clearCookies();
 * ```
 */
function clearCookies() {
    if (!isNativeApp) {
        // Web fallback: clear cookies via document.cookie
        document.cookie.split(';').forEach(cookie => {
            const name = cookie.split('=')[0].trim();
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
        return;
    }
    callNativeSync('clearCookies');
}

var cache = /*#__PURE__*/Object.freeze({
    __proto__: null,
    clear: clear,
    clearCookies: clearCookies
});

/**
 * Print Module
 *
 * Trigger native print dialog for the current page.
 */
/**
 * Open the native print dialog for the current WebView content.
 *
 * @example
 * ```js
 * nativine.print();
 * ```
 */
function printPage() {
    if (!isNativeApp) {
        window.print();
        return;
    }
    callNativeSync('printPage');
}

/**
 * Screenshot Module
 *
 * Control screenshot protection (prevent screenshots of sensitive screens).
 */
/**
 * Enable or disable screenshot/screen recording protection.
 * When enabled, the app content appears black in screenshots and screen recordings.
 *
 * @param enabled - Whether to enable screenshot protection
 *
 * @example
 * ```js
 * // Protect a banking page
 * nativine.screenshot.setProtection(true);
 *
 * // Remove protection when leaving
 * nativine.screenshot.setProtection(false);
 * ```
 */
function setProtection(enabled) {
    if (!isNativeApp)
        return;
    callNativeSync('setScreenshotProtection', { enabled });
}

var screenshot = /*#__PURE__*/Object.freeze({
    __proto__: null,
    setProtection: setProtection
});

/**
 * Reviews Module
 *
 * Trigger the native in-app review dialog (Google Play / App Store).
 */
/**
 * Request an in-app review from the user.
 * Uses Google Play In-App Review API (Android) or StoreKit (iOS).
 *
 * Note: The system may not show the dialog if the user has already reviewed
 * or if the request is too frequent. This is controlled by the platform.
 *
 * @example
 * ```js
 * // After a positive user interaction
 * nativine.reviews.request();
 * ```
 */
function request() {
    if (!isNativeApp)
        return;
    callNativeSync('requestAppReview');
}

var reviews = /*#__PURE__*/Object.freeze({
    __proto__: null,
    request: request
});

/**
 * Updates Module
 *
 * Check for and trigger in-app updates (Android only).
 */
/**
 * Check for available app updates using the Android In-App Update API.
 * If an update is available, a native update UI will be shown.
 *
 * @example
 * ```js
 * nativine.updates.check();
 * ```
 */
function check() {
    if (!isNativeApp)
        return;
    callNativeSync('checkForUpdates');
}

var updates = /*#__PURE__*/Object.freeze({
    __proto__: null,
    check: check
});

/**
 * Ads Module
 *
 * Control AdMob interstitial and rewarded ad display from your web app.
 */
/**
 * Show a fullscreen interstitial ad.
 * The ad must be pre-loaded by the native app.
 *
 * @example
 * ```js
 * // Show an ad between content transitions
 * nativine.ads.showInterstitial();
 * ```
 */
function showInterstitial() {
    if (!isNativeApp)
        return;
    callNativeSync('showInterstitialAd');
}
/**
 * Show a rewarded video ad.
 * Returns a Promise that resolves when the user finishes watching.
 *
 * @returns Promise resolving with the reward result
 *
 * @example
 * ```js
 * const result = await nativine.ads.showRewarded();
 * if (result.rewarded) {
 *   // Grant premium access for 24 hours
 *   unlockPremiumContent();
 * }
 * ```
 */
async function showRewarded() {
    if (!isNativeApp) {
        return { rewarded: false };
    }
    return callNativeAsync('showRewardedAd');
}

var ads = /*#__PURE__*/Object.freeze({
    __proto__: null,
    showInterstitial: showInterstitial,
    showRewarded: showRewarded
});

/**
 * OneSignal Module
 *
 * Interact with OneSignal push notification service from your web app.
 * Requires the OneSignal addon to be enabled in your Nativine app.
 */
/**
 * Set the OneSignal external user ID.
 * Links the device's push subscription to your backend user ID.
 *
 * @param userId - Your app's user identifier
 *
 * @example
 * ```js
 * // After user logs in
 * nativine.onesignal.setExternalUserId('user_12345');
 * ```
 */
function setExternalUserId(userId) {
    if (!isNativeApp)
        return;
    callNativeSync('onesignalSetExternalUserId', { userId });
}
/**
 * Send a tag (key-value pair) to OneSignal for audience segmentation.
 *
 * @param key - Tag key
 * @param value - Tag value
 *
 * @example
 * ```js
 * nativine.onesignal.sendTag('plan', 'premium');
 * nativine.onesignal.sendTag('language', 'en');
 * ```
 */
function sendTag(key, value) {
    if (!isNativeApp)
        return;
    callNativeSync('onesignalSendTag', { key, value });
}
/**
 * Send multiple tags at once to OneSignal.
 *
 * @param tags - Object with tag key-value pairs
 *
 * @example
 * ```js
 * nativine.onesignal.sendTags({
 *   plan: 'premium',
 *   language: 'en',
 *   onboarded: 'true'
 * });
 * ```
 */
function sendTags(tags) {
    if (!isNativeApp)
        return;
    callNativeSync('onesignalSendTags', { tags });
}
/**
 * Get the OneSignal Player ID (push subscription ID) for this device.
 *
 * @returns Promise resolving with the player ID string
 *
 * @example
 * ```js
 * const playerId = await nativine.onesignal.getPlayerId();
 * // Send to your backend for targeted push notifications
 * ```
 */
async function getPlayerId() {
    if (!isNativeApp)
        return '';
    return callNativeAsync('onesignalGetPlayerId');
}
/**
 * Remove the external user ID association.
 * Call this when the user logs out.
 *
 * @example
 * ```js
 * // On logout
 * nativine.onesignal.removeExternalUserId();
 * ```
 */
function removeExternalUserId() {
    if (!isNativeApp)
        return;
    callNativeSync('onesignalRemoveExternalUserId');
}

var onesignal = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getPlayerId: getPlayerId,
    removeExternalUserId: removeExternalUserId,
    sendTag: sendTag,
    sendTags: sendTags,
    setExternalUserId: setExternalUserId
});

/**
 * Toast Module
 *
 * Show native Android toast messages.
 */
/**
 * Show a native toast message.
 *
 * @param message - The text to display
 * @param duration - 'short' (~2s) or 'long' (~3.5s)
 *
 * @example
 * ```js
 * nativine.toast('Item added to cart!');
 * nativine.toast('Processing payment...', 'long');
 * ```
 */
function showToast(message, duration = 'short') {
    if (!isNativeApp) {
        // Web fallback: show a temporary notification-style element
        const el = document.createElement('div');
        el.textContent = message;
        Object.assign(el.style, {
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: '24px',
            fontSize: '14px',
            zIndex: '999999',
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease',
            opacity: '0',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        });
        document.body.appendChild(el);
        // Fade in
        requestAnimationFrame(() => { el.style.opacity = '1'; });
        // Remove after duration
        const ms = duration === 'long' ? 3500 : 2000;
        setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => {
                if (el.parentNode)
                    el.parentNode.removeChild(el);
            }, 300);
        }, ms);
        return;
    }
    callNativeSync('showToast', { message, duration });
}

/**
 * Pedometer / Step Counter Module
 *
 * Access the device's built-in step counter sensor to track steps.
 * Uses Android's TYPE_STEP_COUNTER hardware sensor.
 * Requires ACTIVITY_RECOGNITION permission on Android 10+.
 */
/**
 * Check if the device has a step counter sensor.
 *
 * @returns Promise resolving with availability info
 *
 * @example
 * ```js
 * const { available } = await nativine.pedometer.isAvailable();
 * if (available) {
 *   nativine.pedometer.startTracking();
 * }
 * ```
 */
async function isAvailable() {
    if (!isNativeApp) {
        return { available: false };
    }
    return callNativeAsync('isPedometerAvailable');
}
/**
 * Get the current step count since tracking started.
 * Returns 0 if tracking hasn't been started yet.
 *
 * @returns Promise resolving with the step count
 *
 * @example
 * ```js
 * const { steps } = await nativine.pedometer.getStepCount();
 * console.log(`You've taken ${steps} steps`);
 * ```
 */
async function getStepCount() {
    if (!isNativeApp) {
        return { steps: 0 };
    }
    return callNativeAsync('getStepCount');
}
/**
 * Start tracking steps. The step count resets to 0 when tracking begins.
 * Step updates are dispatched as 'stepUpdate' events via `nativine.on()`.
 *
 * @example
 * ```js
 * nativine.pedometer.startTracking();
 *
 * // Listen for real-time step updates
 * nativine.on('stepUpdate', ({ steps }) => {
 *   document.getElementById('step-count').textContent = steps;
 * });
 * ```
 */
function startTracking() {
    if (!isNativeApp)
        return;
    callNativeSync('startStepTracking');
}
/**
 * Stop tracking steps. The sensor listener is unregistered to save battery.
 *
 * @example
 * ```js
 * nativine.pedometer.stopTracking();
 * ```
 */
function stopTracking() {
    if (!isNativeApp)
        return;
    callNativeSync('stopStepTracking');
}

var pedometer = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getStepCount: getStepCount,
    isAvailable: isAvailable,
    startTracking: startTracking,
    stopTracking: stopTracking
});

/**
 * Events Module
 *
 * Subscribe to native app lifecycle events.
 * The native side dispatches events by calling global handler functions.
 */
const _eventListeners = new Map();
/**
 * Subscribe to a native app lifecycle event.
 *
 * Available events:
 * - `'appResume'` — App returned to foreground
 * - `'appPause'` — App went to background
 * - `'pageReady'` — Bridge is fully initialized and ready
 * - `'keyboardShow'` — Software keyboard appeared (with height data)
 * - `'keyboardHide'` — Software keyboard dismissed
 *
 * @param event - The event name to listen for
 * @param callback - Function called when the event fires
 * @returns Unsubscribe function
 *
 * @example
 * ```js
 * // Refresh data when user returns to app
 * const unsubscribe = nativine.on('appResume', () => {
 *   fetchLatestData();
 * });
 *
 * // Listen for keyboard visibility
 * nativine.on('keyboardShow', ({ height }) => {
 *   adjustLayoutForKeyboard(height);
 * });
 *
 * // Cleanup
 * unsubscribe();
 * ```
 */
function on(event, callback) {
    if (!_eventListeners.has(event)) {
        _eventListeners.set(event, []);
    }
    _eventListeners.get(event).push(callback);
    return () => {
        const listeners = _eventListeners.get(event);
        if (listeners) {
            const idx = listeners.indexOf(callback);
            if (idx !== -1)
                listeners.splice(idx, 1);
        }
    };
}
/**
 * Unsubscribe all listeners for a specific event, or all events.
 *
 * @param event - The event to clear listeners for (or omit to clear all)
 *
 * @example
 * ```js
 * // Remove all appResume listeners
 * nativine.off('appResume');
 *
 * // Remove ALL event listeners
 * nativine.off();
 * ```
 */
function off(event) {
    if (event) {
        _eventListeners.delete(event);
    }
    else {
        _eventListeners.clear();
    }
}
/**
 * Internal: Dispatch an event to all registered listeners.
 * Called by the native side via global window functions.
 * @internal
 */
function _dispatchEvent(event, data) {
    const listeners = _eventListeners.get(event);
    if (listeners) {
        listeners.forEach(cb => {
            try {
                cb(data);
            }
            catch (e) {
                console.error(`[nativine] Event '${event}' listener error:`, e);
            }
        });
    }
}
// Register global handlers for native-side event dispatching
if (typeof window !== 'undefined') {
    window.__nativine_event = (eventName, jsonData) => {
        try {
            const data = jsonData ? (typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData) : undefined;
            _dispatchEvent(eventName, data);
        }
        catch (e) { /* ignore parse errors */ }
    };
    // Convenience aliases for common events
    window.__nativine_onAppResume = () => _dispatchEvent('appResume');
    window.__nativine_onAppPause = () => _dispatchEvent('appPause');
    window.__nativine_onKeyboardShow = (json) => {
        try {
            _dispatchEvent('keyboardShow', JSON.parse(json));
        }
        catch (_a) {
            _dispatchEvent('keyboardShow');
        }
    };
    window.__nativine_onKeyboardHide = () => _dispatchEvent('keyboardHide');
    // Fire 'pageReady' event after bridge initialization
    if (document.readyState === 'complete') {
        setTimeout(() => _dispatchEvent('pageReady'), 0);
    }
    else {
        window.addEventListener('load', () => {
            setTimeout(() => _dispatchEvent('pageReady'), 0);
        });
    }
}

/**
 * Nativine JavaScript Bridge
 *
 * Enterprise-grade bridge for communicating between web apps and Nativine native shells.
 * Provides 50+ APIs across 12 namespaces with full TypeScript support, Promise-based
 * async methods, and graceful web fallbacks.
 *
 * @example ESM (recommended)
 * ```js
 * import nativine from 'nativine';
 *
 * if (nativine.isNativeApp) {
 *   const info = await nativine.device.getInfo();
 *   nativine.haptics.vibrate(200);
 * }
 * ```
 *
 * @example CDN / Script tag
 * ```html
 * <script src="https://cdn.jsdelivr.net/npm/nativine@latest/dist/nativine.umd.js"></script>
 * <script>
 *   if (Nativine.isNativeApp) {
 *     Nativine.haptics.vibrate(200);
 *   }
 * </script>
 * ```
 *
 * @packageDocumentation
 */
// ─── Core ────────────────────────────────────────────────────
// ─── Bridge API ──────────────────────────────────────────────
const nativine = {
    // ── Detection ──────────────────────────────────
    /** The detected platform: `'android'`, `'ios'`, or `'web'` */
    platform,
    /** `true` if running inside a Nativine native app */
    isNativeApp,
    /** `true` if running inside a Nativine Android app */
    isAndroid,
    /** `true` if running inside a Nativine iOS app */
    isIos,
    // ── SDK Version ────────────────────────────────
    /** The version of this SDK */
    version: '1.0.0',
    // ── Device ─────────────────────────────────────
    device: {
        getInfo: getInfo,
        getSafeAreaInsets: getSafeAreaInsets,
        getAppVersion: getAppVersion,
        getDeviceId: getDeviceId,
    },
    // ── UI ──────────────────────────────────────────
    ui: {
        statusBar: statusBar,
        navigationBar: navigationBar,
        hideSplashScreen: hideSplashScreen,
        setOrientation: setOrientation,
        showNativeComponents: showNativeComponents,
        hideNativeComponents: hideNativeComponents,
        setPullToRefresh: setPullToRefresh,
        setPinchToZoom: setPinchToZoom,
    },
    // ── Navigation ──────────────────────────────────
    navigation: {
        goBack: goBack,
        goForward: goForward,
        navigate: navigate,
        openInBrowser: openInBrowser,
        closeApp: closeApp,
    },
    // ── Haptics ─────────────────────────────────────
    haptics: {
        vibrate: vibrate,
        feedback: feedback,
    },
    // ── Storage ─────────────────────────────────────
    storage: {
        set: set,
        get: get,
        remove: remove,
        clear: clear$1,
    },
    // ── Share ───────────────────────────────────────
    share: share,
    shareFile: shareFile,
    // ── Auth ────────────────────────────────────────
    auth: {
        googleSignIn: googleSignIn,
        googleSignOut: googleSignOut,
    },
    // ── Biometrics ──────────────────────────────────
    biometrics: {
        isAvailable: isAvailable$1,
        authenticate: authenticate,
    },
    // ── Contacts ────────────────────────────────────
    contacts: {
        getAll: getAll,
    },
    // ── Clipboard ───────────────────────────────────
    clipboard: {
        copy: copy,
        read: read,
    },
    // ── Downloads ───────────────────────────────────
    downloads: {
        downloadFile: downloadFile,
    },
    // ── Scanner ─────────────────────────────────────
    scanner: {
        scan: scan,
    },
    // ── Location ────────────────────────────────────
    location: {
        getCurrent: getCurrent,
    },
    // ── Network ─────────────────────────────────────
    network: {
        isOnline: isOnline,
        onConnectivityChange: onConnectivityChange,
    },
    // ── Cache ───────────────────────────────────────
    cache: {
        clear: clear,
        clearCookies: clearCookies,
    },
    // ── Print ───────────────────────────────────────
    print: printPage,
    // ── Screenshot ──────────────────────────────────
    screenshot: {
        setProtection: setProtection,
    },
    // ── Reviews ─────────────────────────────────────
    reviews: {
        request: request,
    },
    // ── Updates ─────────────────────────────────────
    updates: {
        check: check,
    },
    // ── Ads ─────────────────────────────────────────
    ads: {
        showInterstitial: showInterstitial,
        showRewarded: showRewarded,
    },
    // ── OneSignal ───────────────────────────────────
    onesignal: {
        setExternalUserId: setExternalUserId,
        removeExternalUserId: removeExternalUserId,
        sendTag: sendTag,
        sendTags: sendTags,
        getPlayerId: getPlayerId,
    },
    // ── Toast ───────────────────────────────────────
    toast: showToast,
    // ── Pedometer / Step Counter ────────────────
    pedometer: {
        isAvailable: isAvailable,
        getStepCount: getStepCount,
        startTracking: startTracking,
        stopTracking: stopTracking,
    },
    // ── Events ──────────────────────────────────────
    on,
    off,
};

export { ads, auth, biometrics, cache, clipboard, contacts, nativine as default, device, downloads, haptics, isAndroid, isIos, isNativeApp, location, navigation, network, off, on, onesignal, pedometer, platform, reviews, camera as scanner, screenshot, storage, ui, updates };
//# sourceMappingURL=nativine.esm.js.map
