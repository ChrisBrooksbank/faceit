<script lang="ts">
    /**
     * Training Session Screen
     * Conducts perceptual discrimination training trials with adaptive difficulty
     */

    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { Button, Card, ProgressBar, TrialDisplay } from '$lib/components';
    import { userProfile, setCurrentSession, setProgressMetrics } from '$lib/stores';
    import { createStaircaseState, updateStaircase, calculateThreshold } from '$lib/core/staircase';
    import { updateProgressMetrics as recalculateProgressMetrics } from '$lib/core/progress';
    import { saveSession } from '$lib/db';
    import { logger } from '$lib/utils/logger';
    import type { Trial, TrainingSession, StaircaseState } from '$lib/types';

    // ============================================
    // Constants
    // ============================================

    const FACE_PAIRS = 20; // 20 unique face pairs (face1-face40)
    const MORPH_LEVELS = [28, 40, 52, 64, 76, 88];

    // ============================================
    // State
    // ============================================

    let sessionStartTime = $state<number>(0);
    let trialStartTime = $state<number>(0);
    let currentTrialNumber = $state<number>(0);
    const trials = $state<Trial[]>([]);
    let staircaseState = $state<StaircaseState | null>(null);
    let showPauseMenu = $state<boolean>(false);
    let showExitConfirm = $state<boolean>(false);

    // Current trial faces
    let targetFaceId = $state<string>('');
    let choiceFaceIds = $state<string[]>([]);
    let correctPosition = $state<number>(0);

    // Session configuration
    let trialsTotal = $state<number>(60);
    let sessionId = $state<string>('');

    // ============================================
    // Derived values
    // ============================================

    const progressPercent = $derived((currentTrialNumber / trialsTotal) * 100);

    // ============================================
    // Initialization
    // ============================================

    onMount(() => {
        // Check if user is onboarded
        const profile = $userProfile;
        if (!profile || !profile.onboardingComplete) {
            logger.warn('User not onboarded, redirecting to onboarding');
            goto('/onboarding');
            return;
        }

        // Initialize session
        trialsTotal = profile.settings.trialsPerSession;
        sessionId = crypto.randomUUID();
        sessionStartTime = Date.now();
        staircaseState = createStaircaseState();

        logger.info('Training session started', { sessionId, trialsTotal });

        // Start first trial
        startNextTrial();
    });

    // ============================================
    // Trial Management
    // ============================================

    function startNextTrial(): void {
        currentTrialNumber++;
        trialStartTime = Date.now();

        if (!staircaseState) {
            logger.error('Staircase state not initialized');
            return;
        }

        // Generate trial at current difficulty
        const morphLevel = findClosestMorphLevel(staircaseState.currentMorphLevel);
        const { target, choices, correct } = generateTrialFaces(morphLevel);

        targetFaceId = target;
        choiceFaceIds = choices;
        correctPosition = correct;

        logger.debug('Trial started', {
            trialNumber: currentTrialNumber,
            morphLevel,
            targetFaceId,
        });
    }

    function handleTrialResponse(position: number, correct: boolean): void {
        if (!staircaseState) return;

        const responseTime = Date.now() - trialStartTime;
        const morphLevel = findClosestMorphLevel(staircaseState.currentMorphLevel);

        // Record trial
        const trial: Trial = {
            trialNumber: currentTrialNumber,
            targetFaceId,
            distractorFaceIds: choiceFaceIds.filter((_, i) => i !== correctPosition),
            morphLevel,
            responseTime,
            correct,
            selectedPosition: position,
            correctPosition,
        };

        trials.push(trial);

        // Update staircase
        staircaseState = updateStaircase(staircaseState, correct);

        logger.debug('Trial completed', {
            trialNumber: currentTrialNumber,
            correct,
            newMorphLevel: staircaseState.currentMorphLevel,
            reversals: staircaseState.reversals.length,
        });

        // Check if session complete
        if (currentTrialNumber >= trialsTotal) {
            completeSession();
        } else {
            // Small delay before next trial for feedback
            setTimeout(() => {
                startNextTrial();
            }, 1000);
        }
    }

    // ============================================
    // Face Generation
    // ============================================

    /**
     * Find the closest available morph level to the target
     */
    function findClosestMorphLevel(target: number): number {
        return MORPH_LEVELS.reduce((prev, curr) =>
            Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
        );
    }

    /**
     * Generate faces for a trial at the given morph level
     * Returns target face, 3 choice faces, and correct position
     */
    function generateTrialFaces(morphLevel: number): {
        target: string;
        choices: string[];
        correct: number;
    } {
        // Select random face pair
        const pairIndex = Math.floor(Math.random() * FACE_PAIRS);
        const faceA = pairIndex * 2 + 1;
        const faceB = faceA + 1;

        // Morph filename
        const morphFaceId = `face${faceA}_face${faceB}_${morphLevel}`;

        // Select random distractor pair (different from target pair)
        let distractorPairIndex = Math.floor(Math.random() * (FACE_PAIRS - 1));
        if (distractorPairIndex >= pairIndex) {
            distractorPairIndex++;
        }

        const distractorA = distractorPairIndex * 2 + 1;
        const distractorB = distractorA + 1;

        // Use two different morph levels for distractors to add variety
        const distractorMorph1 = MORPH_LEVELS[Math.floor(Math.random() * MORPH_LEVELS.length)];
        const distractorMorph2 = MORPH_LEVELS[Math.floor(Math.random() * MORPH_LEVELS.length)];

        let distractor2PairIndex = Math.floor(Math.random() * (FACE_PAIRS - 2));
        const excludedPairs = [pairIndex, distractorPairIndex].sort((a, b) => a - b);
        for (const excludedPair of excludedPairs) {
            if (distractor2PairIndex >= excludedPair) {
                distractor2PairIndex++;
            }
        }

        const distractor2A = distractor2PairIndex * 2 + 1;
        const distractor2B = distractor2A + 1;

        const distractor1 = `face${distractorA}_face${distractorB}_${distractorMorph1}`;
        const distractor2 = `face${distractor2A}_face${distractor2B}_${distractorMorph2}`;

        // Randomize position of correct answer
        const correctPos = Math.floor(Math.random() * 3);
        const distractors = [distractor1, distractor2];
        const choices = Array.from({ length: 3 }, (_, index) =>
            index === correctPos ? morphFaceId : (distractors.shift() ?? distractor1)
        );

        return {
            target: morphFaceId,
            choices,
            correct: correctPos,
        };
    }

    function serializeTrial(trial: Trial): Trial {
        return {
            ...trial,
            distractorFaceIds: [...trial.distractorFaceIds],
        };
    }

    // ============================================
    // Session Completion
    // ============================================

    async function completeSession(): Promise<void> {
        if (!staircaseState) return;

        const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
        const correctTrials = trials.filter(t => t.correct).length;
        const accuracy = (correctTrials / trials.length) * 100;
        const thresholdLevel =
            calculateThreshold(staircaseState) ?? staircaseState.currentMorphLevel;

        const completedTrials = trials.map(serializeTrial);
        const session: TrainingSession = {
            id: sessionId,
            date: new Date(),
            duration,
            trialsCompleted: completedTrials.length,
            trialsTotal,
            accuracy,
            thresholdLevel,
            thresholdHistory: [...staircaseState.reversals],
            trials: completedTrials,
            completed: true,
        };

        try {
            // Save session
            await saveSession(session);
            setCurrentSession(session);

            // Update progress metrics
            const profile = $userProfile;
            if (profile) {
                try {
                    const updatedMetrics = await recalculateProgressMetrics(profile.id);
                    setProgressMetrics(updatedMetrics);
                } catch (error) {
                    logger.error('Failed to update progress metrics', error);
                }
            }

            logger.info('Training session completed', {
                sessionId,
                accuracy,
                thresholdLevel,
                duration,
            });

            // Navigate to summary
            goto('/training/summary');
        } catch (error) {
            logger.error('Failed to save session', error);
        }
    }

    // ============================================
    // Pause & Exit
    // ============================================

    function handlePause(): void {
        showPauseMenu = true;
    }

    function handleResume(): void {
        showPauseMenu = false;
    }

    function handleExitRequest(): void {
        showPauseMenu = false;
        showExitConfirm = true;
    }

    function handleCancelExit(): void {
        showExitConfirm = false;
        showPauseMenu = false;
    }

    async function handleConfirmExit(): Promise<void> {
        // Save partial session
        if (trials.length > 0 && staircaseState) {
            const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
            const correctTrials = trials.filter(t => t.correct).length;
            const accuracy = (correctTrials / trials.length) * 100;
            const thresholdLevel =
                calculateThreshold(staircaseState) ?? staircaseState.currentMorphLevel;

            const partialTrials = trials.map(serializeTrial);
            const session: TrainingSession = {
                id: sessionId,
                date: new Date(),
                duration,
                trialsCompleted: partialTrials.length,
                trialsTotal,
                accuracy,
                thresholdLevel,
                thresholdHistory: [...staircaseState.reversals],
                trials: partialTrials,
                completed: false,
            };

            try {
                await saveSession(session);
                logger.info('Partial session saved', { sessionId, trialsCompleted: trials.length });
            } catch (error) {
                logger.error('Failed to save partial session', error);
            }
        }

        goto('/');
    }
</script>

<div class="training-session">
    {#if showPauseMenu}
        <!-- Pause Menu Overlay -->
        <div class="overlay">
            <Card>
                <div class="pause-menu">
                    <h2>Paused</h2>
                    <p>Take a break, then resume when ready.</p>
                    <div class="button-group">
                        <Button onclick={handleResume}>Resume</Button>
                        <Button variant="secondary" onclick={handleExitRequest}>Exit Session</Button
                        >
                    </div>
                </div>
            </Card>
        </div>
    {:else if showExitConfirm}
        <!-- Exit Confirmation Overlay -->
        <div class="overlay">
            <Card>
                <div class="exit-confirm">
                    <h2>Exit Session?</h2>
                    <p>
                        Your progress will be saved, but this session won't count toward your
                        streak.
                    </p>
                    <div class="button-group">
                        <Button variant="secondary" onclick={handleCancelExit}>Cancel</Button>
                        <Button onclick={handleConfirmExit}>Exit</Button>
                    </div>
                </div>
            </Card>
        </div>
    {:else}
        <!-- Training Session Content -->
        <div class="session-header">
            <div class="progress-section">
                <div class="progress-text">
                    Trial {currentTrialNumber} of {trialsTotal}
                </div>
                <ProgressBar value={progressPercent} />
            </div>
            <Button variant="secondary" onclick={handlePause}>Pause</Button>
        </div>

        <div class="trial-container">
            {#if targetFaceId && choiceFaceIds.length > 0}
                <TrialDisplay
                    faces={{ targetFaceId, choiceFaceIds, correctPosition }}
                    onSelect={handleTrialResponse}
                    size="large"
                />
            {/if}
        </div>
    {/if}
</div>

<style>
    .training-session {
        min-height: 100vh;
        padding: var(--spacing-lg);
        background-color: var(--color-background);
    }

    .session-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-xl);
        flex-wrap: wrap;
    }

    .progress-section {
        flex: 1;
        min-width: 200px;
    }

    .progress-text {
        font-size: var(--font-size-md);
        font-weight: 500;
        color: var(--color-text);
        margin-bottom: var(--spacing-sm);
    }

    .trial-container {
        max-width: 800px;
        margin: 0 auto;
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: var(--spacing-lg);
    }

    .pause-menu,
    .exit-confirm {
        text-align: center;
    }

    .pause-menu h2,
    .exit-confirm h2 {
        font-size: var(--font-size-xl);
        font-weight: 600;
        color: var(--color-text);
        margin-bottom: var(--spacing-md);
    }

    .pause-menu p,
    .exit-confirm p {
        font-size: var(--font-size-md);
        color: var(--color-text-secondary);
        margin-bottom: var(--spacing-lg);
    }

    .button-group {
        display: flex;
        gap: var(--spacing-md);
        justify-content: center;
        flex-wrap: wrap;
    }

    @media (max-width: 640px) {
        .training-session {
            padding: var(--spacing-md);
        }

        .session-header {
            flex-direction: column;
            align-items: stretch;
        }

        .button-group {
            flex-direction: column;
        }
    }
</style>
