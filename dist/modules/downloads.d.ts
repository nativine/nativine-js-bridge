/**
 * Downloads Module
 *
 * Trigger native file downloads using the device's download manager.
 */
export interface DownloadFileOptions {
    /** The URL of the file to download */
    url: string;
    /** Custom filename (optional, auto-detected from URL if not provided) */
    filename?: string;
    /** MIME type of the file */
    mimeType?: string;
    /** Whether to open the file after download completes */
    openAfterDownload?: boolean;
}
/**
 * Download a file using the native download manager.
 * Shows a notification with download progress on Android.
 *
 * @param options - Download configuration
 *
 * @example
 * ```js
 * nativine.downloads.downloadFile({
 *   url: 'https://example.com/report.pdf',
 *   filename: 'monthly-report.pdf',
 *   openAfterDownload: true
 * });
 * ```
 */
export declare function downloadFile(options: DownloadFileOptions): void;
