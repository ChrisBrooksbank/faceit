/**
 * Root layout load function
 * Handles app initialization on every page load
 */

import { initApp } from '$lib/init';

export const ssr = false; // Disable SSR for client-side only app
export const prerender = true; // Enable prerendering for static site generation

export async function load(): Promise<{ isOnboarded: boolean }> {
    // Initialize app and load user data
    const { isOnboarded } = await initApp();

    return {
        isOnboarded,
    };
}
