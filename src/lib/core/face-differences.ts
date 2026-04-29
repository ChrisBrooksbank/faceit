import faceDifferences from '$lib/data/face-differences.json';

type Region = 'eyes' | 'brows' | 'nose' | 'mouth' | 'jawline';

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

export function getDifferenceCue(selectedFace: string, correctFace: string): string {
    const selectedFaceId = normalizeFaceId(selectedFace);
    const correctFaceId = normalizeFaceId(correctFace);

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
