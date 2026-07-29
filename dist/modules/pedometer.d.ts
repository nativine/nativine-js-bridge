/**
 * Pedometer / Step Counter Module
 *
 * Access the device's built-in step counter sensor to track steps.
 * Uses Android's TYPE_STEP_COUNTER hardware sensor.
 * Requires ACTIVITY_RECOGNITION permission on Android 10+.
 */
export interface StepCountResult {
    /** Number of steps since tracking started */
    steps: number;
}
export interface PedometerAvailability {
    /** Whether the device has a step counter sensor */
    available: boolean;
}
/**
 * Check if the device has a step counter sensor.
 *
 * @returns Promise resolving with availability info
 *
 * @example
 * ```js
 * const { available } = await nativine.pedometer.isAvailable();
 * if (available) {
 *   nativine.pedometer.startTracking();
 * }
 * ```
 */
export declare function isAvailable(): Promise<PedometerAvailability>;
/**
 * Get the current step count since tracking started.
 * Returns 0 if tracking hasn't been started yet.
 *
 * @returns Promise resolving with the step count
 *
 * @example
 * ```js
 * const { steps } = await nativine.pedometer.getStepCount();
 * console.log(`You've taken ${steps} steps`);
 * ```
 */
export declare function getStepCount(): Promise<StepCountResult>;
/**
 * Start tracking steps. The step count resets to 0 when tracking begins.
 * Step updates are dispatched as 'stepUpdate' events via `nativine.on()`.
 *
 * @example
 * ```js
 * nativine.pedometer.startTracking();
 *
 * // Listen for real-time step updates
 * nativine.on('stepUpdate', ({ steps }) => {
 *   document.getElementById('step-count').textContent = steps;
 * });
 * ```
 */
export declare function startTracking(): void;
/**
 * Stop tracking steps. The sensor listener is unregistered to save battery.
 *
 * @example
 * ```js
 * nativine.pedometer.stopTracking();
 * ```
 */
export declare function stopTracking(): void;
