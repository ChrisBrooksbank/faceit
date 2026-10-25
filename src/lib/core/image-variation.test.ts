import { describe, expect, it } from 'vitest';
import {
    NO_VARIATION,
    createVariation,
    variationStrengthFor,
    variationFilter,
    variationTransform,
} from './image-variation';

describe('image variation', () => {
    it('returns no change at zero strength', () => {
        expect(createVariation(0)).toEqual(NO_VARIATION);
    });

    it('keeps changes within bounds', () => {
        for (let i = 0; i < 100; i++) {
            const v = createVariation(1);
            expect(Math.abs(v.rotate)).toBeLessThanOrEqual(10);
            expect(v.scale).toBeGreaterThanOrEqual(0.9);
            expect(v.scale).toBeLessThanOrEqual(1.1);
            expect(v.brightness).toBeGreaterThanOrEqual(0.88);
        }
    });

    it('scales variation with difficulty', () => {
        expect(variationStrengthFor(88)).toBe(0);
        expect(variationStrengthFor(50)).toBe(0.5);
        expect(variationStrengthFor(28)).toBe(1);
    });

    it('produces css style strings', () => {
        expect(variationTransform(NO_VARIATION)).toContain('rotate(0.00deg)');
        expect(variationFilter(NO_VARIATION)).toContain('brightness(1.000)');
    });
});
