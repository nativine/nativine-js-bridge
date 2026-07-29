/**
 * Nativine Platform Detection
 *
 * Detects whether the web page is running inside a Nativine-powered native app
 * and identifies the platform (Android, iOS, or Web).
 */
export type Platform = 'android' | 'ios' | 'web';
/** The detected platform: `'android'`, `'ios'`, or `'web'` */
export declare const platform: Platform;
/** `true` if the page is running inside a Nativine native app (Android or iOS) */
export declare const isNativeApp: boolean;
/** `true` if the page is running inside a Nativine Android app */
export declare const isAndroid: boolean;
/** `true` if the page is running inside a Nativine iOS app */
export declare const isIos: boolean;
