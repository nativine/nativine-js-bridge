/**
 * Storage Module
 *
 * Persistent key-value storage that survives WebView cache clears.
 * Data is stored in Android SharedPreferences / iOS UserDefaults,
 * not in the WebView's localStorage.
 */
/**
 * Store a value persistently in native storage.
 * This data persists even when the WebView cache is cleared.
 *
 * @param key - The storage key
 * @param value - The value to store (will be serialized to string)
 *
 * @example
 * ```js
 * await nativine.storage.set('auth_token', 'abc123');
 * await nativine.storage.set('user', JSON.stringify({ name: 'John' }));
 * ```
 */
export declare function set(key: string, value: string): void;
/**
 * Retrieve a value from native persistent storage.
 *
 * @param key - The storage key
 * @param defaultValue - Value to return if key doesn't exist (default: '')
 * @returns The stored value, or defaultValue if not found
 *
 * @example
 * ```js
 * const token = nativine.storage.get('auth_token');
 * const user = JSON.parse(nativine.storage.get('user', '{}'));
 * ```
 */
export declare function get(key: string, defaultValue?: string): string;
/**
 * Remove a specific key from native persistent storage.
 *
 * @param key - The storage key to remove
 *
 * @example
 * ```js
 * nativine.storage.remove('auth_token');
 * ```
 */
export declare function remove(key: string): void;
/**
 * Clear all data from native persistent storage.
 *
 * @example
 * ```js
 * // On logout
 * nativine.storage.clear();
 * ```
 */
export declare function clear(): void;
