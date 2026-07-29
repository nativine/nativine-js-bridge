/**
 * Network Module
 *
 * Check connectivity status and listen for network changes.
 */
export interface ConnectivityStatus {
    /** Whether the device is online */
    online: boolean;
    /** Connection type: 'wifi', 'cellular', 'ethernet', 'none', 'unknown' */
    type: 'wifi' | 'cellular' | 'ethernet' | 'none' | 'unknown';
}
type ConnectivityCallback = (status: ConnectivityStatus) => void;
/**
 * Check if the device currently has network connectivity.
 *
 * @returns Promise resolving with connectivity status
 *
 * @example
 * ```js
 * const status = await nativine.network.isOnline();
 * if (!status.online) {
 *   showOfflineBanner();
 * }
 * ```
 */
export declare function isOnline(): Promise<ConnectivityStatus>;
/**
 * Listen for network connectivity changes.
 *
 * @param callback - Function called when connectivity changes
 * @returns Unsubscribe function to stop listening
 *
 * @example
 * ```js
 * const unsubscribe = nativine.network.onConnectivityChange((status) => {
 *   if (!status.online) {
 *     showOfflineBanner();
 *   } else {
 *     hideOfflineBanner();
 *   }
 * });
 *
 * // Later: stop listening
 * unsubscribe();
 * ```
 */
export declare function onConnectivityChange(callback: ConnectivityCallback): () => void;
/**
 * Internal: Called by the native side when connectivity changes.
 * Dispatches to all registered listeners.
 * @internal
 */
export declare function _onConnectivityChanged(status: ConnectivityStatus): void;
export {};
