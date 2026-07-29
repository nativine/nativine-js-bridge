/**
 * Toast Module
 *
 * Show native Android toast messages.
 */
export type ToastDuration = 'short' | 'long';
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
export declare function showToast(message: string, duration?: ToastDuration): void;
