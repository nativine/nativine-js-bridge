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
export declare function setExternalUserId(userId: string): void;
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
export declare function sendTag(key: string, value: string): void;
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
export declare function sendTags(tags: Record<string, string>): void;
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
export declare function getPlayerId(): Promise<string>;
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
export declare function removeExternalUserId(): void;
