/**
 * Share Module
 *
 * Trigger the native share sheet to share text, URLs, and files.
 */
export interface ShareOptions {
    /** Title for the share sheet (Android) */
    title?: string;
    /** Text content to share */
    text?: string;
    /** URL to share */
    url?: string;
}
export interface ShareFileOptions {
    /** Absolute file path or content:// URI */
    filePath: string;
    /** MIME type of the file */
    mimeType?: string;
    /** Title for the share sheet */
    title?: string;
}
/**
 * Open the native share sheet with the specified content.
 *
 * @example
 * ```js
 * nativine.share.share({
 *   title: 'Check this out',
 *   text: 'Amazing app!',
 *   url: 'https://example.com'
 * });
 * ```
 */
export declare function share(options: ShareOptions): void;
/**
 * Share a file using the native share sheet.
 *
 * @example
 * ```js
 * nativine.share.shareFile({
 *   filePath: '/storage/emulated/0/Download/report.pdf',
 *   mimeType: 'application/pdf'
 * });
 * ```
 */
export declare function shareFile(options: ShareFileOptions): void;
