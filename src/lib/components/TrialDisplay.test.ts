import { describe, it, expect } from 'vitest';
import TrialDisplay from './TrialDisplay.svelte';

describe('TrialDisplay Component', () => {
    it('should be importable', () => {
        expect(TrialDisplay).toBeDefined();
    });

    it('should be a Svelte component', () => {
        expect(typeof TrialDisplay).toBe('function');
    });
});
