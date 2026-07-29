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
export declare function goBack(): void;
/**
 * Navigate the WebView forward one page in history.
 * No-op if there's no forward history.
 *
 * @example
 * ```js
 * nativine.navigation.goForward();
 * ```
 */
export declare function goForward(): void;
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
export declare function navigate(url: string): void;
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
export declare function openInBrowser(url: string): void;
/**
 * Close the app. On Android, this finishes the Activity.
 *
 * @example
 * ```js
 * nativine.navigation.closeApp();
 * ```
 */
export declare function closeApp(): void;
