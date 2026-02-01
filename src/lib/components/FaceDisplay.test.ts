import { describe, it, expect } from 'vitest';
import FaceDisplay from './FaceDisplay.svelte';

describe('FaceDisplay Component', () => {
    it('should be importable', () => {
        expect(FaceDisplay).toBeDefined();
    });

    it('should be a Svelte component', () => {
        expect(typeof FaceDisplay).toBe('function');
    });
});
