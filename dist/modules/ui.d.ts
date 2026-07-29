/**
 * UI Module
 *
 * Control native UI elements: status bar, navigation bar, splash screen,
 * screen orientation, and native component visibility.
 */
export interface StatusBarOptions {
    /** Hex color for the status bar background (e.g., "#1a1a2e") */
    color?: string;
    /** Content style: 'light' for white icons, 'dark' for dark icons */
    style?: 'light' | 'dark';
    /** Whether the status bar should be visible */
    visible?: boolean;
}
export interface NavigationBarOptions {
    /** Hex color for the navigation bar background (e.g., "#16213e") */
    color?: string;
    /** Icon style: 'light' for white icons, 'dark' for dark icons */
    style?: 'light' | 'dark';
}
/**
 * Configure the native status bar appearance.
 *
 * @example
 * ```js
 * nativine.ui.statusBar({ color: '#1a1a2e', style: 'light' });
 * ```
 */
export declare function statusBar(options: StatusBarOptions): void;
/**
 * Configure the native navigation bar appearance (Android only).
 *
 * @example
 * ```js
 * nativine.ui.navigationBar({ color: '#16213e' });
 * ```
 */
export declare function navigationBar(options: NavigationBarOptions): void;
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
export declare function hideSplashScreen(): void;
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
export declare function setOrientation(mode: 'portrait' | 'landscape' | 'auto'): void;
/**
 * Show native UI components (header, bottom nav, floating button).
 * Reverses the effect of `hideNativeComponents()`.
 *
 * @example
 * ```js
 * nativine.ui.showNativeComponents();
 * ```
 */
export declare function showNativeComponents(): void;
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
export declare function hideNativeComponents(): void;
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
export declare function setPullToRefresh(enabled: boolean): void;
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
export declare function setPinchToZoom(enabled: boolean): void;
