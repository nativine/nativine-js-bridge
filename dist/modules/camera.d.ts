/**
 * Camera / Scanner Module
 *
 * Access the device camera for barcode and QR code scanning.
 */
export interface ScanResult {
    /** The decoded content of the barcode/QR code */
    value: string;
    /** The format of the code (e.g., 'QR_CODE', 'EAN_13', 'CODE_128') */
    format: string;
}
export interface ScanOptions {
    /** Restrict scanning to specific formats */
    formats?: string[];
    /** Prompt text shown on the scanner UI */
    prompt?: string;
}
/**
 * Open the native barcode/QR code scanner.
 *
 * @param options - Scanner configuration
 * @returns Promise resolving with the scanned code data
 *
 * @example
 * ```js
 * try {
 *   const result = await nativine.scanner.scan();
 *   console.log(result.value);  // "https://example.com"
 *   console.log(result.format); // "QR_CODE"
 * } catch (err) {
 *   console.log('Scan cancelled');
 * }
 * ```
 */
export declare function scan(options?: ScanOptions): Promise<ScanResult>;
