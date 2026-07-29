/**
 * Contacts Module
 *
 * Access the device's native contact list (requires user permission).
 */
export interface Contact {
    /** Contact display name */
    name: string;
    /** Phone number(s) */
    phone: string;
    /** Email address(es) */
    email: string;
}
/**
 * Retrieve the user's contacts from the native contact book.
 * Prompts for permission if not already granted.
 *
 * @returns Promise resolving with an array of contacts
 *
 * @example
 * ```js
 * const contacts = await nativine.contacts.getAll();
 * contacts.forEach(c => {
 *   console.log(`${c.name}: ${c.phone}`);
 * });
 * ```
 */
export declare function getAll(): Promise<Contact[]>;
