/**
 * Device Module
 *
 * Access device hardware/software information, safe area insets,
 * app version, and anonymous device identifiers.
 */
export interface DeviceInfo {
    /** Device model name (e.g., "Pixel 8", "iPhone 15") */
    model: string;
    /** Device manufacturer (e.g., "Google", "Apple") */
    manufacturer: string;
    /** Operating system version (e.g., "14", "17.2") */
    osVersion: string;
    /** Nativine app version name (e.g., "1.2.0") */
    appVersion: string;
    /** Nativine app version code (e.g., 12) */
    appVersionCode: number;
    /** App package name (e.g., "com.example.myapp") */
    packageName: string;
    /** Device locale (e.g., "en-US") */
    locale: string;
    /** Screen width in dp */
    screenWidth: number;
    /** Screen height in dp */
    screenHeight: number;
    /** Screen pixel density */
    density: number;
    /** Platform: 'android' or 'ios' */
    platform: string;
}
export interface SafeAreaInsets {
    /** Top safe area inset in px (e.g., status bar height) */
    top: number;
    /** Bottom safe area inset in px (e.g., navigation bar / home indicator) */
    bottom: number;
    /** Left safe area inset in px */
    left: number;
    /** Right safe area inset in px */
    right: number;
}
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
export declare function getInfo(): Promise<DeviceInfo>;
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
export declare function getSafeAreaInsets(): Promise<SafeAreaInsets>;
/**
 * Get the app's version name string (e.g., "1.2.0").
 *
 * @example
 * ```js
 * const version = await nativine.device.getAppVersion();
 * // "1.2.0"
 * ```
 */
export declare function getAppVersion(): Promise<string>;
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
export declare function getDeviceId(): Promise<string>;
