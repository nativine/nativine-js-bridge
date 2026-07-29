/**
 * Nativine Bridge Dispatcher
 *
 * Low-level bridge call mechanism that provides a unified, Promise-based interface
 * for communicating with the native Android/iOS app shell.
 *
 * Architecture:
 * - Android: Calls `window.nativine.<method>(args, callbackId)` via @JavascriptInterface
 * - iOS: Calls `window.webkit.messageHandlers.nativine.postMessage({ method, args, callbackId })`
 * - Web: Returns rejected promises or no-ops gracefully
 *
 * The native side resolves the Promise by calling: `window[callbackId](jsonResult)`
 */
/**
 * Error thrown when a bridge method is called outside a native app context.
 */
export declare class NativineNotAvailableError extends Error {
    constructor(method: string);
}
/**
 * Error thrown when a bridge call times out waiting for native response.
 */
export declare class NativineTimeoutError extends Error {
    constructor(method: string, timeoutMs: number);
}
/**
 * Makes an async call to the native bridge and returns a Promise that resolves
 * when the native side responds via the callback.
 *
 * @param method - The native method name to call (e.g., 'getDeviceInfo')
 * @param args - Optional arguments to pass to the native method (serialized as JSON string)
 * @param timeoutMs - Timeout in milliseconds (default: 10s)
 * @returns Promise that resolves with the parsed native response
 */
export declare function callNativeAsync<T = any>(method: string, args?: Record<string, any>, timeoutMs?: number): Promise<T>;
/**
 * Makes a synchronous (fire-and-forget) call to the native bridge.
 * Used for methods that don't need a return value (e.g., vibrate, statusBar).
 *
 * @param method - The native method name to call
 * @param args - Optional arguments
 */
export declare function callNativeSync(method: string, args?: Record<string, any>): void;
/**
 * Calls a native method that returns a synchronous value via @JavascriptInterface.
 * Only works on Android where @JavascriptInterface methods can return values directly.
 *
 * @param method - The native method name
 * @param args - Arguments to pass
 * @returns The return value from the native method, or undefined
 */
export declare function callNativeDirect<T = any>(method: string, ...args: any[]): T | undefined;
