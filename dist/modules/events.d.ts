/**
 * Events Module
 *
 * Subscribe to native app lifecycle events.
 * The native side dispatches events by calling global handler functions.
 */
export type NativineEvent = 'appResume' | 'appPause' | 'pageReady' | 'keyboardShow' | 'keyboardHide' | 'stepUpdate';
type EventCallback = (data?: any) => void;
/**
 * Subscribe to a native app lifecycle event.
 *
 * Available events:
 * - `'appResume'` — App returned to foreground
 * - `'appPause'` — App went to background
 * - `'pageReady'` — Bridge is fully initialized and ready
 * - `'keyboardShow'` — Software keyboard appeared (with height data)
 * - `'keyboardHide'` — Software keyboard dismissed
 *
 * @param event - The event name to listen for
 * @param callback - Function called when the event fires
 * @returns Unsubscribe function
 *
 * @example
 * ```js
 * // Refresh data when user returns to app
 * const unsubscribe = nativine.on('appResume', () => {
 *   fetchLatestData();
 * });
 *
 * // Listen for keyboard visibility
 * nativine.on('keyboardShow', ({ height }) => {
 *   adjustLayoutForKeyboard(height);
 * });
 *
 * // Cleanup
 * unsubscribe();
 * ```
 */
export declare function on(event: NativineEvent, callback: EventCallback): () => void;
/**
 * Unsubscribe all listeners for a specific event, or all events.
 *
 * @param event - The event to clear listeners for (or omit to clear all)
 *
 * @example
 * ```js
 * // Remove all appResume listeners
 * nativine.off('appResume');
 *
 * // Remove ALL event listeners
 * nativine.off();
 * ```
 */
export declare function off(event?: NativineEvent): void;
export {};
