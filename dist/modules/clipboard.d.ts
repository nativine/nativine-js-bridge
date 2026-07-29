/**
 * Clipboard Module
 *
 * Read from and write to the device clipboard.
 */
/**
 * Copy text to the device clipboard.
 *
 * @param text - The text to copy
 *
 * @example
 * ```js
 * await nativine.clipboard.copy('https://example.com/share/abc123');
 * ```
 */
export declare function copy(text: string): Promise<void>;
/**
 * Read text from the device clipboard.
 *
 * @returns Promise resolving with the clipboard text content
 *
 * @example
 * ```js
 * const text = await nativine.clipboard.read();
 * console.log('Clipboard:', text);
 * ```
 */
export declare function read(): Promise<string>;
