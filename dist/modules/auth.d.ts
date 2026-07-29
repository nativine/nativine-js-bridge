/**
 * Auth Module
 *
 * Native Google Sign-In integration. Triggers the native Google Sign-In flow
 * and returns user credentials to your web app.
 */
export interface GoogleSignInResult {
    /** User's email address */
    email: string;
    /** User's display name */
    displayName: string;
    /** Google ID token for backend verification */
    idToken: string;
    /** URL of user's profile photo */
    photoUrl: string;
    /** Google account ID */
    id: string;
}
/**
 * Trigger the native Google Sign-In flow.
 * Returns user credentials when the user completes sign-in.
 *
 * @returns Promise resolving with Google user credentials
 *
 * @example
 * ```js
 * try {
 *   const user = await nativine.auth.googleSignIn();
 *   console.log(user.email); // "john@gmail.com"
 *   console.log(user.idToken); // Send to your backend for verification
 * } catch (err) {
 *   console.log('Sign-in cancelled or failed');
 * }
 * ```
 */
export declare function googleSignIn(): Promise<GoogleSignInResult>;
/**
 * Sign out of the current Google account.
 *
 * @example
 * ```js
 * await nativine.auth.googleSignOut();
 * ```
 */
export declare function googleSignOut(): void;
