/**
 * Biometrics Module
 *
 * Trigger native biometric authentication (fingerprint, face recognition, iris scan).
 */
export type BiometryType = 'fingerprint' | 'face' | 'iris' | 'none';
export interface BiometricAvailability {
    /** Whether biometric authentication is available on this device */
    available: boolean;
    /** The type of biometric sensor available */
    biometryType: BiometryType;
}
export interface BiometricAuthOptions {
    /** Reason displayed to the user for why authentication is needed */
    reason?: string;
    /** Title for the biometric dialog (Android only) */
    title?: string;
    /** Whether to allow device PIN/pattern as fallback */
    allowFallback?: boolean;
}
export interface BiometricAuthResult {
    /** Whether authentication was successful */
    success: boolean;
    /** Error message if authentication failed */
    error?: string;
}
/**
 * Check if biometric authentication is available on this device.
 *
 * @returns Promise resolving with availability info
 *
 * @example
 * ```js
 * const { available, biometryType } = await nativine.biometrics.isAvailable();
 * if (available) {
 *   console.log(`Biometric type: ${biometryType}`); // "fingerprint"
 * }
 * ```
 */
export declare function isAvailable(): Promise<BiometricAvailability>;
/**
 * Trigger biometric authentication.
 *
 * @param options - Configuration for the authentication prompt
 * @returns Promise resolving with the authentication result
 *
 * @example
 * ```js
 * const result = await nativine.biometrics.authenticate({
 *   reason: 'Verify your identity to access settings',
 *   allowFallback: true
 * });
 *
 * if (result.success) {
 *   // User authenticated
 *   showSensitiveContent();
 * }
 * ```
 */
export declare function authenticate(options?: BiometricAuthOptions): Promise<BiometricAuthResult>;
