/**
 * Simulated "different photo" variation.
 *
 * Recognising a person means matching them across changes in viewpoint and lighting,
 * not matching one identical image. We only have one neutral photo per identity, so
 * we approximate those changes with small rotations, scale/position shifts and
 * lighting changes applied to each displayed image.
 */

export interface ImageVariation {
    rotate: number; // degrees
    scale: number;
    shiftX: number; // percent of image width
    shiftY: number;
    brightness: number;
    contrast: number;
}

export const NO_VARIATION: ImageVariation = {
    rotate: 0,
    scale: 1,
    shiftX: 0,
    shiftY: 0,
    brightness: 1,
    contrast: 1,
};

function spread(amount: number, random: () => number): number {
    return (random() * 2 - 1) * amount;
}

/**
 * @param strength 0 (identical image) to 1 (largest change)
 */
export function createVariation(
    strength: number,
    random: () => number = Math.random
): ImageVariation {
    const s = Math.min(Math.max(strength, 0), 1);
    if (s === 0) return NO_VARIATION;

    return {
        rotate: spread(10 * s, random),
        scale: 1 + spread(0.1 * s, random),
        shiftX: spread(5 * s, random),
        shiftY: spread(5 * s, random),
        brightness: 1 + spread(0.12 * s, random),
        contrast: 1 + spread(0.1 * s, random),
    };
}

/**
 * Photo variation strength for a staircase level: none while the task is easy,
 * increasing as the user reaches finer discriminations.
 */
export function variationStrengthFor(difficultyLevel: number): number {
    if (difficultyLevel >= 58) return 0;
    return difficultyLevel >= 43 ? 0.5 : 1;
}

/** Geometry change, applied to the image itself */
export function variationTransform(variation: ImageVariation): string {
    const { rotate, scale, shiftX, shiftY } = variation;
    return (
        `transform: translate(${shiftX.toFixed(2)}%, ${shiftY.toFixed(2)}%) ` +
        `rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)});`
    );
}

/** Lighting change, applied to the whole frame so the background shifts with the face */
export function variationFilter(variation: ImageVariation): string {
    const { brightness, contrast } = variation;
    return `filter: brightness(${brightness.toFixed(3)}) contrast(${contrast.toFixed(3)});`;
}
