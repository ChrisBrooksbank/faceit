<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
    import type { Snippet } from 'svelte';

    interface BeforeInstallPromptEvent extends Event {
        readonly platforms: string[];
        readonly userChoice: Promise<{
            outcome: 'accepted' | 'dismissed';
            platform: string;
        }>;
        prompt(): Promise<void>;
    }

    interface Props {
        children: Snippet;
        data: {
            isOnboarded: boolean;
        };
    }

    const { children }: Props = $props();
    // data is available but not used in layout currently

    let isInstalled = $state(false);
    let hasUpdate = $state(false);
    let isOfflineReady = $state(false);
    let showInstallHelp = $state(false);
    let installPrompt = $state<BeforeInstallPromptEvent | null>(null);
    let updateServiceWorker = $state<((reloadPage?: boolean) => Promise<void>) | null>(null);
    const canShowInstall = $derived(!isInstalled);
    const installButtonLabel = $derived(installPrompt ? 'Install app' : 'How to install');

    function isAppInstalled(): boolean {
        const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };

        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            Boolean(navigatorWithStandalone.standalone)
        );
    }

    function handleBeforeInstallPrompt(event: Event): void {
        event.preventDefault();
        installPrompt = event as BeforeInstallPromptEvent;
        isInstalled = isAppInstalled();
    }

    function handleAppInstalled(): void {
        installPrompt = null;
        isInstalled = true;
        showInstallHelp = false;
    }

    async function installApp(): Promise<void> {
        if (!installPrompt) {
            showInstallHelp = !showInstallHelp;
            return;
        }

        const prompt = installPrompt;
        installPrompt = null;
        showInstallHelp = false;
        await prompt.prompt();
        const choice = await prompt.userChoice;
        isInstalled = choice.outcome === 'accepted' || isAppInstalled();
    }

    async function updateApp(): Promise<void> {
        if (!updateServiceWorker) {
            return;
        }

        hasUpdate = false;
        await updateServiceWorker(true);
    }

    onMount(() => {
        let isMounted = true;

        isInstalled = isAppInstalled();
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        void import('virtual:pwa-register').then(({ registerSW }) => {
            const updateRegistration = registerSW({
                immediate: true,
                onNeedRefresh() {
                    hasUpdate = true;
                },
                onOfflineReady() {
                    isOfflineReady = true;
                },
            });

            if (isMounted) {
                updateServiceWorker = updateRegistration;
            }
        });

        return (): void => {
            isMounted = false;
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    });
</script>

<svelte:head>
    <title>FaceIt</title>
</svelte:head>

<div class="app">
    <header class="app-header">
        <h1>FaceIt</h1>

        <div class="pwa-actions" aria-live="polite">
            {#if isOfflineReady}
                <span class="offline-status">Offline ready</span>
            {/if}

            {#if canShowInstall}
                <button class="pwa-button" type="button" onclick={installApp}>
                    {installButtonLabel}
                </button>
            {/if}

            {#if hasUpdate}
                <button class="pwa-button update-button" type="button" onclick={updateApp}>
                    Update app
                </button>
            {/if}
        </div>
    </header>

    {#if showInstallHelp && canShowInstall}
        <section class="install-help" aria-label="Install instructions">
            <p>
                Use your browser menu and choose <strong>Install app</strong> or
                <strong>Add to home screen</strong>. Chrome and Edge may also show an install icon
                in the address bar.
            </p>
        </section>
    {/if}

    <main>
        {@render children()}
    </main>

    <footer>
        <p>Train your brain to recognize faces better</p>
    </footer>
</div>

<style>
    .app {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    .app-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-md);
        background: var(--color-primary);
        color: white;
        padding: var(--spacing-md) var(--spacing-xl);
        box-shadow: var(--shadow-md);
    }

    .app-header h1 {
        font-size: var(--font-size-2xl);
        font-weight: 600;
    }

    .pwa-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
        min-height: 2rem;
    }

    .offline-status {
        border: 1px solid rgba(255, 255, 255, 0.48);
        border-radius: var(--radius-full);
        color: white;
        font-size: var(--font-size-sm);
        line-height: 1;
        padding: var(--spacing-xs) var(--spacing-sm);
        white-space: nowrap;
    }

    .pwa-button {
        background: white;
        color: var(--color-primary-dark);
        font-size: var(--font-size-sm);
        font-weight: 600;
        line-height: 1.2;
        min-height: 2rem;
        padding: var(--spacing-xs) var(--spacing-sm);
        white-space: nowrap;
    }

    .pwa-button:hover {
        background: #eff6ff;
    }

    .update-button {
        color: #92400e;
    }

    .install-help {
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        color: var(--color-text);
        padding: var(--spacing-sm) var(--spacing-xl);
    }

    .install-help p {
        font-size: var(--font-size-sm);
        margin: 0 auto;
        max-width: 800px;
    }

    main {
        flex: 1;
        padding: var(--spacing-xl);
        max-width: 800px;
        margin: 0 auto;
        width: 100%;
    }

    footer {
        text-align: center;
        padding: var(--spacing-md);
        color: var(--color-text-muted);
        font-size: var(--font-size-sm);
    }

    @media (max-width: 480px) {
        .app-header {
            align-items: flex-start;
            flex-direction: column;
            padding: var(--spacing-md);
        }

        .pwa-actions {
            justify-content: flex-start;
            width: 100%;
        }

        .install-help {
            padding: var(--spacing-sm) var(--spacing-md);
        }

        main {
            padding: var(--spacing-md);
        }
    }
</style>
