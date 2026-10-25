import faceDifferences from '$lib/data/face-differences.json';
import regionBoxes from '$lib/data/region-boxes.json';

export type Region = 'eyes' | 'brows' | 'nose' | 'mouth' | 'jawline';

interface DifferenceComparison {
    topRegions: Region[];
    scores: Record<Region, number>;
}

interface DifferenceData {
    comparisons: Record<string, DifferenceComparison>;
}

const DIFFERENCE_DATA = faceDifferences as DifferenceData;

const REGION_LABELS: Record<Region, string> = {
    eyes: 'eye spacing',
    brows: 'brow line',
    nose: 'nose width',
    mouth: 'mouth shape',
    jawline: 'jawline',
};

export const GENERIC_DIFFERENCE_CUE =
    'Compare stable features: eye spacing, brow line, nose width, mouth shape, and jawline.';

/**
 * Fallback region boxes as fractions of a stimulus image [left, top, right, bottom], used when
 * an image has no landmark-derived boxes. Stimuli are cropped from their landmarks, so
 * features sit in similar places in every image.
 */
export const REGION_BOXES: Record<Region, RegionBox> = {
    brows: [0.12, 0.2, 0.88, 0.31],
    eyes: [0.14, 0.3, 0.86, 0.42],
    nose: [0.34, 0.4, 0.66, 0.62],
    mouth: [0.28, 0.63, 0.72, 0.76],
    jawline: [0.14, 0.78, 0.86, 0.98],
};

type RegionBox = [number, number, number, number];

/** Per-image boxes from scripts/compute-region-boxes.py, keyed by image id */
const IMAGE_REGION_BOXES = regionBoxes as unknown as Record<
    string,
    Partial<Record<Region, RegionBox>>
>;

/** Box for a region on a specific image, falling back to the fixed approximation */
export function getRegionBox(face: string, region: Region): RegionBox {
    return IMAGE_REGION_BOXES[normalizeFaceId(face)]?.[region] ?? REGION_BOXES[region];
}

export function getDifferenceRegions(selectedFace: string, correctFace: string): Region[] {
    const selectedFaceId = differenceFaceId(selectedFace);
    const correctFaceId = differenceFaceId(correctFace);

    if (!selectedFaceId || !correctFaceId || selectedFaceId === correctFaceId) {
        return [];
    }

    return (
        DIFFERENCE_DATA.comparisons[comparisonKey(selectedFaceId, correctFaceId)]?.topRegions ?? []
    );
}

export function getDifferenceCue(selectedFace: string, correctFace: string): string {
    const selectedFaceId = differenceFaceId(selectedFace);
    const correctFaceId = differenceFaceId(correctFace);

    if (!selectedFaceId || !correctFaceId || selectedFaceId === correctFaceId) {
        return GENERIC_DIFFERENCE_CUE;
    }

    const comparison = DIFFERENCE_DATA.comparisons[comparisonKey(selectedFaceId, correctFaceId)];
    const regions = comparison?.topRegions ?? [];

    if (regions.length === 0) {
        return GENERIC_DIFFERENCE_CUE;
    }

    return `Try comparing the ${formatRegionList(regions)}.`;
}

export function normalizeFaceId(face: string): string {
    return face
        .replace(/^\/?faces\//, '')
        .replace(/\.jpg$/, '')
        .trim();
}

/** Difference data is computed on the neutral photos; smiling photos share the framing */
function differenceFaceId(face: string): string {
    return normalizeFaceId(face).replace('_smile', '');
}

export function comparisonKey(faceA: string, faceB: string): string {
    return [faceA, faceB].sort().join('__');
}

function formatRegionList(regions: Region[]): string {
    const labels = regions.map(region => REGION_LABELS[region]);

    if (labels.length === 1) {
        return labels[0];
    }

    return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}
