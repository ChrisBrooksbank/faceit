/**
 * Configuration Schema
 * Define and validate your app configuration
 */

import { z } from 'zod';

export const ConfigSchema = z.object({
    debug: z.boolean().default(false),
    training: z
        .object({
            defaultTrialsPerSession: z.number().int().min(30).max(100).default(60),
            minMorphLevel: z.number().min(0).max(100).default(28),
            maxMorphLevel: z.number().min(0).max(100).default(88),
            stepSize: z.number().min(1).max(20).default(4),
            targetDisplayMs: z.number().int().positive().default(2000),
            maskDisplayMs: z.number().int().positive().default(500),
            feedbackDisplayMs: z.number().int().positive().default(1000),
        })
        .default({}),
    assessment: z
        .object({
            pi20QuestionCount: z.number().int().default(20),
            perceptionTestTrials: z.number().int().default(6),
        })
        .default({}),
});

export type AppConfig = z.infer<typeof ConfigSchema>;

export class ConfigValidationError extends Error {
    constructor(
        message: string,
        public errors: z.ZodError
    ) {
        super(message);
        this.name = 'ConfigValidationError';
    }
}
