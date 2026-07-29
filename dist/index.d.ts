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
import { platform, isNativeApp, isAndroid, isIos } from './core/platform';
import type { Platform } from './core/platform';
import * as device from './modules/device';
import * as ui from './modules/ui';
import * as navigation from './modules/navigation';
import * as haptics from './modules/haptics';
import * as storage from './modules/storage';
import * as shareModule from './modules/share';
import * as auth from './modules/auth';
import * as biometrics from './modules/biometrics';
import * as contacts from './modules/contacts';
import * as clipboard from './modules/clipboard';
import * as downloads from './modules/downloads';
import * as scanner from './modules/camera';
import * as location from './modules/location';
import * as network from './modules/network';
import * as cache from './modules/cache';
import * as printModule from './modules/print';
import * as screenshot from './modules/screenshot';
import * as reviews from './modules/reviews';
import * as updates from './modules/updates';
import * as ads from './modules/ads';
import * as onesignal from './modules/onesignal';
import * as toastModule from './modules/toast';
import * as pedometer from './modules/pedometer';
import { on, off } from './modules/events';
declare const nativine: {
    /** The detected platform: `'android'`, `'ios'`, or `'web'` */
    platform: Platform;
    /** `true` if running inside a Nativine native app */
    isNativeApp: boolean;
    /** `true` if running inside a Nativine Android app */
    isAndroid: boolean;
    /** `true` if running inside a Nativine iOS app */
    isIos: boolean;
    /** The version of this SDK */
    version: string;
    device: {
        getInfo: typeof device.getInfo;
        getSafeAreaInsets: typeof device.getSafeAreaInsets;
        getAppVersion: typeof device.getAppVersion;
        getDeviceId: typeof device.getDeviceId;
    };
    ui: {
        statusBar: typeof ui.statusBar;
        navigationBar: typeof ui.navigationBar;
        hideSplashScreen: typeof ui.hideSplashScreen;
        setOrientation: typeof ui.setOrientation;
        showNativeComponents: typeof ui.showNativeComponents;
        hideNativeComponents: typeof ui.hideNativeComponents;
        setPullToRefresh: typeof ui.setPullToRefresh;
        setPinchToZoom: typeof ui.setPinchToZoom;
    };
    navigation: {
        goBack: typeof navigation.goBack;
        goForward: typeof navigation.goForward;
        navigate: typeof navigation.navigate;
        openInBrowser: typeof navigation.openInBrowser;
        closeApp: typeof navigation.closeApp;
    };
    haptics: {
        vibrate: typeof haptics.vibrate;
        feedback: typeof haptics.feedback;
    };
    storage: {
        set: typeof storage.set;
        get: typeof storage.get;
        remove: typeof storage.remove;
        clear: typeof storage.clear;
    };
    share: typeof shareModule.share;
    shareFile: typeof shareModule.shareFile;
    auth: {
        googleSignIn: typeof auth.googleSignIn;
        googleSignOut: typeof auth.googleSignOut;
    };
    biometrics: {
        isAvailable: typeof biometrics.isAvailable;
        authenticate: typeof biometrics.authenticate;
    };
    contacts: {
        getAll: typeof contacts.getAll;
    };
    clipboard: {
        copy: typeof clipboard.copy;
        read: typeof clipboard.read;
    };
    downloads: {
        downloadFile: typeof downloads.downloadFile;
    };
    scanner: {
        scan: typeof scanner.scan;
    };
    location: {
        getCurrent: typeof location.getCurrent;
    };
    network: {
        isOnline: typeof network.isOnline;
        onConnectivityChange: typeof network.onConnectivityChange;
    };
    cache: {
        clear: typeof cache.clear;
        clearCookies: typeof cache.clearCookies;
    };
    print: typeof printModule.printPage;
    screenshot: {
        setProtection: typeof screenshot.setProtection;
    };
    reviews: {
        request: typeof reviews.request;
    };
    updates: {
        check: typeof updates.check;
    };
    ads: {
        showInterstitial: typeof ads.showInterstitial;
        showRewarded: typeof ads.showRewarded;
    };
    onesignal: {
        setExternalUserId: typeof onesignal.setExternalUserId;
        removeExternalUserId: typeof onesignal.removeExternalUserId;
        sendTag: typeof onesignal.sendTag;
        sendTags: typeof onesignal.sendTags;
        getPlayerId: typeof onesignal.getPlayerId;
    };
    toast: typeof toastModule.showToast;
    pedometer: {
        isAvailable: typeof pedometer.isAvailable;
        getStepCount: typeof pedometer.getStepCount;
        startTracking: typeof pedometer.startTracking;
        stopTracking: typeof pedometer.stopTracking;
    };
    on: typeof on;
    off: typeof off;
};
export default nativine;
export { platform, isNativeApp, isAndroid, isIos, device, ui, navigation, haptics, storage, auth, biometrics, contacts, clipboard, downloads, scanner, location, network, cache, screenshot, reviews, updates, ads, onesignal, pedometer, on, off, };
export type { Platform } from './core/platform';
export type { NativineEvent } from './modules/events';
export type { DeviceInfo, SafeAreaInsets } from './modules/device';
export type { StatusBarOptions, NavigationBarOptions } from './modules/ui';
export type { HapticFeedbackType } from './modules/haptics';
export type { ShareOptions, ShareFileOptions } from './modules/share';
export type { GoogleSignInResult } from './modules/auth';
export type { BiometricAvailability, BiometricAuthOptions, BiometricAuthResult, BiometryType } from './modules/biometrics';
export type { Contact } from './modules/contacts';
export type { DownloadFileOptions } from './modules/downloads';
export type { ScanResult, ScanOptions } from './modules/camera';
export type { LocationResult } from './modules/location';
export type { ConnectivityStatus } from './modules/network';
export type { ToastDuration } from './modules/toast';
export type { RewardedAdResult } from './modules/ads';
export type { StepCountResult, PedometerAvailability } from './modules/pedometer';
