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
export declare function setProtection(enabled: boolean): void;
