/**
 * Location Module
 *
 * Access the device's GPS location.
 */
export interface LocationResult {
    /** Latitude in degrees */
    latitude: number;
    /** Longitude in degrees */
    longitude: number;
    /** Accuracy in meters */
    accuracy: number;
    /** Altitude in meters (may be null on some devices) */
    altitude?: number;
    /** Speed in m/s (may be null) */
    speed?: number;
}
/**
 * Get the device's current GPS location.
 * Prompts for location permission if not already granted.
 *
 * @returns Promise resolving with location coordinates
 *
 * @example
 * ```js
 * const loc = await nativine.location.getCurrent();
 * console.log(`Lat: ${loc.latitude}, Lng: ${loc.longitude}`);
 * console.log(`Accuracy: ${loc.accuracy}m`);
 * ```
 */
export declare function getCurrent(): Promise<LocationResult>;
