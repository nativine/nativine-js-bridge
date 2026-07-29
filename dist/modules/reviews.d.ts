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
export declare function request(): void;
