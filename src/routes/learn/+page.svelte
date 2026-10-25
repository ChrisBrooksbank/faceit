<script lang="ts">
    /**
     * Identity learning: meet a few people by name, then recall who is who
     * from a different photo. The same people repeat for a week.
     */

    import { Button, Card, FaceDisplay } from '$lib/components';
    import {
        buildRecallTrials,
        identitiesForWeek,
        weekIndexFor,
        type RecallTrial,
    } from '$lib/core/identity-learning';

    type Phase = 'learn' | 'recall' | 'done';

    const identities = identitiesForWeek(weekIndexFor(new Date()));

    let phase = $state<Phase>('learn');
    let trials = $state<RecallTrial[]>([]);
    let trialIndex = $state(0);
    let selected = $state<number | null>(null);
    let score = $state(0);

    const trial = $derived(trials[trialIndex]);
    const answered = $derived(selected !== null);

    function startRecall(): void {
        trials = buildRecallTrials(identities);
        trialIndex = 0;
        score = 0;
        selected = null;
        phase = 'recall';
    }

    function choose(index: number): void {
        if (answered) return;
        selected = index;
        if (index === trial.correct) score++;
    }

    function next(): void {
        if (trialIndex + 1 >= trials.length) {
            phase = 'done';
            return;
        }
        trialIndex++;
        selected = null;
    }
</script>

<svelte:head>
    <title>Learn Faces - FaceIt</title>
</svelte:head>

<div class="learn">
    {#if phase === 'learn'}
        <Card>
            <h2>Meet these people</h2>
            <p>Take your time. Look at each face and remember the name.</p>
            <div class="people">
                {#each identities as person (person.name)}
                    <figure>
                        <FaceDisplay
                            faceId={person.learnFaceId}
                            size="medium"
                            ariaLabel="Photo of {person.name}"
                        />
                        <figcaption>{person.name}</figcaption>
                    </figure>
                {/each}
            </div>
            <Button variant="primary" fullWidth={true} onclick={startRecall}>I'm ready</Button>
        </Card>
    {:else if phase === 'recall' && trial}
        <Card>
            <h2>Who is this?</h2>
            <p>
                Person {trialIndex + 1} of {trials.length}. This is a different photo.
            </p>
            <div class="center">
                <FaceDisplay faceId={trial.faceId} size="large" ariaLabel="Person to name" />
            </div>
            <div class="names">
                {#each trial.names as name, index (name)}
                    <Button
                        variant={answered && index === trial.correct ? 'primary' : 'secondary'}
                        disabled={answered}
                        onclick={(): void => choose(index)}
                    >
                        {name}
                    </Button>
                {/each}
            </div>
            {#if answered}
                <p class="feedback" role="status">
                    {selected === trial.correct
                        ? 'Correct!'
                        : `This is ${trial.names[trial.correct]}.`}
                </p>
                <Button variant="primary" fullWidth={true} onclick={next}>Continue</Button>
            {/if}
        </Card>
    {:else}
        <Card>
            <h2>
                {score} of {trials.length} correct
            </h2>
            <p>The same people will appear all week, so come back and see if they feel familiar.</p>
            <div class="actions">
                <Button
                    variant="secondary"
                    fullWidth={true}
                    onclick={(): void => {
                        phase = 'learn';
                    }}
                >
                    Review the faces
                </Button>
                <Button variant="primary" fullWidth={true} onclick={startRecall}>Try again</Button>
                <a href="/" class="link">Back to dashboard</a>
            </div>
        </Card>
    {/if}
</div>

<style>
    .learn {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }

    h2 {
        font-size: var(--font-size-2xl);
        margin-bottom: var(--spacing-sm);
        color: var(--color-text);
    }

    p {
        color: var(--color-text-muted);
        line-height: 1.6;
        margin-bottom: var(--spacing-md);
    }

    .people {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
        justify-items: center;
    }

    figure {
        text-align: center;
        margin: 0;
    }

    figcaption {
        margin-top: var(--spacing-xs);
        font-weight: 600;
        color: var(--color-text);
    }

    .center {
        display: flex;
        justify-content: center;
        margin-bottom: var(--spacing-md);
    }

    .names,
    .actions {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-md);
    }

    .feedback {
        font-weight: 600;
        color: var(--color-text);
    }

    .link {
        text-align: center;
        color: var(--color-primary);
        font-weight: 500;
    }
</style>
