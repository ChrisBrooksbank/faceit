import { describe, it, expect } from 'vitest';
import Card from './Card.svelte';

describe('Card Component', () => {
    it('should be importable', () => {
        expect(Card).toBeDefined();
    });

    it('should be a Svelte component', () => {
        expect(typeof Card).toBe('function');
    });
});
