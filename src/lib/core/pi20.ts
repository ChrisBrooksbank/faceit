/**
 * PI20 (20-Item Prosopagnosia Index) Assessment
 *
 * A validated self-report questionnaire for measuring face recognition difficulties.
 * Reference: Shah et al. (2015) - Royal Society Open Science
 *
 * Scoring:
 * - 20 questions, each scored 1-5 (Strongly Disagree to Strongly Agree)
 * - Items 8 and 9 are reverse-scored
 * - Total range: 20-100
 * - Higher scores indicate greater face recognition difficulty
 */

import type { PI20Question, PI20Response, PI20Result, PI20Severity } from '../types';

/**
 * The complete PI20 questionnaire
 * Items 8 and 9 are reverse-scored (higher agreement = better ability)
 */
export const PI20_QUESTIONS: PI20Question[] = [
    { id: 1, text: 'My face recognition ability is worse than most people.', reverseScored: false },
    { id: 2, text: 'I have always had a bad memory for faces.', reverseScored: false },
    {
        id: 3,
        text: 'I find it notably easier to recognize people who have a distinctive feature (e.g., birthmark, glasses, unusual hair).',
        reverseScored: false,
    },
    {
        id: 4,
        text: 'I sometimes find movies hard to follow because of difficulties recognizing characters.',
        reverseScored: false,
    },
    {
        id: 5,
        text: 'If I met a colleague or classmate out of context (e.g., at the supermarket), I might fail to recognize them.',
        reverseScored: false,
    },
    {
        id: 6,
        text: 'When people change their hairstyle, or wear hats, I have problems recognizing them.',
        reverseScored: false,
    },
    {
        id: 7,
        text: 'I sometimes have to warn new people I meet that I am "bad with faces."',
        reverseScored: false,
    },
    {
        id: 8,
        text: 'I find it easy to picture individual faces in my mind.',
        reverseScored: true,
    },
    {
        id: 9,
        text: 'I am better than most people at putting a "name to a face."',
        reverseScored: true,
    },
    {
        id: 10,
        text: "Without hearing someone's voice, I struggle to recognize them.",
        reverseScored: false,
    },
    {
        id: 11,
        text: 'It is hard for me to recognize familiar people when I am in an unfamiliar place.',
        reverseScored: false,
    },
    {
        id: 12,
        text: 'In the past, I have lost track of a friend in a shopping mall because they have changed their clothes.',
        reverseScored: false,
    },
    {
        id: 13,
        text: 'The first time I meet a new person, I carefully study their face so I can recognize them later.',
        reverseScored: false,
    },
    {
        id: 14,
        text: 'When I was at school, I struggled to recognize my classmates.',
        reverseScored: false,
    },
    {
        id: 15,
        text: 'When my close friends or family change their appearance, I have trouble recognizing them.',
        reverseScored: false,
    },
    {
        id: 16,
        text: 'At family gatherings, I sometimes confuse members of my own family.',
        reverseScored: false,
    },
    {
        id: 17,
        text: 'I have recognized people I have met before, but have mistaken them for someone else.',
        reverseScored: false,
    },
    {
        id: 18,
        text: 'I find it difficult to follow the plot of TV shows because the characters look too similar.',
        reverseScored: false,
    },
    {
        id: 19,
        text: 'I often have to ask people where I have met them before.',
        reverseScored: false,
    },
    {
        id: 20,
        text: 'I have sometimes not recognized close family members when they have unexpectedly approached me.',
        reverseScored: false,
    },
];

/**
 * Score a single PI20 response, applying reverse scoring if needed
 */
export function scorePI20Item(response: PI20Response, reverseScored: boolean): number {
    if (reverseScored) {
        return 6 - response; // Reverse: 1→5, 2→4, 3→3, 4→2, 5→1
    }
    return response;
}

/**
 * Calculate total PI20 score from responses
 *
 * @param responses - Array of 20 responses (1-5 each)
 * @returns Total score (20-100)
 * @throws Error if responses array is invalid
 */
export function calculatePI20Score(responses: PI20Response[]): number {
    if (responses.length !== 20) {
        throw new Error(`Expected 20 responses, got ${responses.length}`);
    }

    let total = 0;

    for (let i = 0; i < 20; i++) {
        const response = responses[i];
        const question = PI20_QUESTIONS[i];

        if (response < 1 || response > 5) {
            throw new Error(`Invalid response at index ${i}: ${response}`);
        }

        total += scorePI20Item(response, question.reverseScored);
    }

    return total;
}

/**
 * Determine severity category from PI20 score
 */
export function getPI20Severity(score: number): PI20Severity {
    if (score < 65) return 'typical';
    if (score < 75) return 'mild';
    if (score < 85) return 'moderate';
    return 'severe';
}

/**
 * Estimate percentile from PI20 score
 * Based on normative data from Shah et al. (2015)
 *
 * Note: This is an approximation. True percentiles require population norms.
 */
export function estimatePI20Percentile(score: number): number {
    // Approximate percentiles based on published data
    // Mean ≈ 39, SD ≈ 13 for typical population
    if (score <= 26) return 5;
    if (score <= 32) return 16;
    if (score <= 39) return 50;
    if (score <= 46) return 84;
    if (score <= 52) return 95;
    if (score <= 65) return 98;
    return 99; // Prosopagnosia range
}

/**
 * Get complete PI20 result with score, severity, and percentile
 */
export function getPI20Result(responses: PI20Response[]): PI20Result {
    const score = calculatePI20Score(responses);

    return {
        score,
        severity: getPI20Severity(score),
        percentile: estimatePI20Percentile(score),
    };
}

/**
 * Get interpretation text for PI20 severity
 */
export function getPI20Interpretation(severity: PI20Severity): string {
    switch (severity) {
        case 'typical':
            return 'Your face recognition ability appears to be in the typical range.';
        case 'mild':
            return 'You may have mild difficulties with face recognition. Training could help improve your skills.';
        case 'moderate':
            return 'You appear to have moderate face recognition difficulties. This is consistent with prosopagnosia.';
        case 'severe':
            return 'You appear to have significant face recognition difficulties. This is consistent with prosopagnosia.';
    }
}
