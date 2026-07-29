/**
 * Ads Module
 *
 * Control AdMob interstitial and rewarded ad display from your web app.
 */
export interface RewardedAdResult {
    /** Whether the user watched the full ad and earned the reward */
    rewarded: boolean;
    /** Reward amount (if configured in AdMob) */
    amount?: number;
    /** Reward type (if configured in AdMob) */
    type?: string;
}
/**
 * Show a fullscreen interstitial ad.
 * The ad must be pre-loaded by the native app.
 *
 * @example
 * ```js
 * // Show an ad between content transitions
 * nativine.ads.showInterstitial();
 * ```
 */
export declare function showInterstitial(): void;
/**
 * Show a rewarded video ad.
 * Returns a Promise that resolves when the user finishes watching.
 *
 * @returns Promise resolving with the reward result
 *
 * @example
 * ```js
 * const result = await nativine.ads.showRewarded();
 * if (result.rewarded) {
 *   // Grant premium access for 24 hours
 *   unlockPremiumContent();
 * }
 * ```
 */
export declare function showRewarded(): Promise<RewardedAdResult>;
