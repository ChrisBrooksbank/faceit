import { describe, expect, it } from 'vitest';
import {
    comparisonKey,
    GENERIC_DIFFERENCE_CUE,
    getDifferenceCue,
    normalizeFaceId,
} from './face-differences';

describe('face difference feedback', () => {
    it('normalizes face urls and ids', () => {
        expect(normalizeFaceId('/faces/face1_face2_64.jpg')).toBe('face1_face2_64');
        expect(normalizeFaceId('faces/face1_face2_64.jpg')).toBe('face1_face2_64');
        expect(normalizeFaceId('face1_face2_64')).toBe('face1_face2_64');
    });

    it('builds order-insensitive comparison keys', () => {
        expect(comparisonKey('face1_face2_40', 'face1_face2_28')).toBe(
            'face1_face2_28__face1_face2_40'
        );
    });

    it('returns a region-aware cue for known comparisons', () => {
        const cue = getDifferenceCue('/faces/face1_face2_28.jpg', '/faces/face1_face2_40.jpg');

        expect(cue).toMatch(/^Try comparing the /);
        expect(cue).not.toBe(GENERIC_DIFFERENCE_CUE);
    });

    it('returns the generic cue when comparison data is unavailable', () => {
        expect(getDifferenceCue('missing_face_28', 'missing_face_40')).toBe(GENERIC_DIFFERENCE_CUE);
    });
});
