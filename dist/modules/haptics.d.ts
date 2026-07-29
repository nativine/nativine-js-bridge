/**
 * Haptics Module
 *
 * Trigger device vibrations and haptic feedback patterns.
 */
export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection';
/**
 * Vibrate the device for a specified duration.
 *
 * @param durationMs - Duration in milliseconds (default: 100ms)
 *
 * @example
 * ```js
 * nativine.haptics.vibrate(200);
 * ```
 */
export declare function vibrate(durationMs?: number): void;
/**
 * Trigger a predefined haptic feedback pattern.
 *
 * @param type - The type of haptic feedback
 *
 * Feedback types:
 * - `'light'` — Subtle tap (e.g., toggle switch)
 * - `'medium'` — Standard tap (e.g., button press)
 * - `'heavy'` — Strong tap (e.g., action confirmation)
 * - `'success'` — Success pattern (double tap)
 * - `'error'` — Error pattern (triple tap)
 * - `'warning'` — Warning pattern
 * - `'selection'` — Selection change (lightest)
 *
 * @example
 * ```js
 * // On button click
 * nativine.haptics.feedback('medium');
 *
 * // On form validation error
 * nativine.haptics.feedback('error');
 *
 * // On successful payment
 * nativine.haptics.feedback('success');
 * ```
 */
export declare function feedback(type?: HapticFeedbackType): void;
