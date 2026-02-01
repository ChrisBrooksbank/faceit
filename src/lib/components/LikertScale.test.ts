import { describe, it, expect } from 'vitest';
import LikertScale from './LikertScale.svelte';

describe('LikertScale Component', () => {
    it('should be importable', () => {
        expect(LikertScale).toBeDefined();
    });

    it('should be a Svelte component', () => {
        expect(typeof LikertScale).toBe('function');
    });
});
