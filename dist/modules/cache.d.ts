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
export declare function clear(): void;
/**
 * Clear all WebView cookies.
 * Useful for logout flows to ensure session data is wiped.
 *
 * @example
 * ```js
 * nativine.cache.clearCookies();
 * ```
 */
export declare function clearCookies(): void;
