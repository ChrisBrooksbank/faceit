import { describe, it, expect } from 'vitest';
import Button from './Button.svelte';

describe('Button Component', () => {
    it('should be importable', () => {
        expect(Button).toBeDefined();
    });

    it('should be a Svelte component', () => {
        expect(typeof Button).toBe('function');
    });
});
