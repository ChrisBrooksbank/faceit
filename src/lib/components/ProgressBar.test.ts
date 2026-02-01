import { describe, it, expect } from 'vitest';
import ProgressBar from './ProgressBar.svelte';

describe('ProgressBar Component', () => {
    it('should be importable', () => {
        expect(ProgressBar).toBeDefined();
    });

    it('should be a Svelte component', () => {
        expect(typeof ProgressBar).toBe('function');
    });
});
