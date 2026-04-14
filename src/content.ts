((): void => {
    /** Prevents scheduling multiple title updates in the same microtask turn. */
    let applyScheduled = false;

    /** Guards the title observer from reacting to this script's own writes. */
    let isWritingTitle = false;

    /** Returns true when the current URL is a YouTube watch page. */
    function isWatchPage(): boolean {
        return location.pathname === "/watch" && new URLSearchParams(location.search).has("v");
    }

    /** Reads and parses duration metadata from YouTube's microformat node. */
    function getMicroformatData(): { duration?: string } | null {
        const el = document.querySelector("#microformat");
        const raw = el?.textContent?.trim();
        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    /** Builds the tab title with a duration prefix when metadata is available. */
    function buildTitle(): string | null {
        if (!isWatchPage()) {
            return null;
        }

        const data = getMicroformatData();
        const duration = data?.duration
            ? parseDuration(data.duration)
            : null;

        if (!duration) {
            return null;
        }

        const baseTitle = stripPrefix(document.title);

        return `[${duration}] ${baseTitle}`;
    }

    /** Applies the computed title if it differs from the current tab title. */
    function applyTitle(): void {
        const next = buildTitle();
        if (!next || document.title === next) {
            return;
        }

        isWritingTitle = true;
        document.title = next;
        isWritingTitle = false;
    }

    /** Queues a single title refresh in a microtask. */
    function scheduleApply(): void {
        if (applyScheduled) {
            return;
        }

        applyScheduled = true;

        queueMicrotask(() => {
            applyScheduled = false;

            if (!isWritingTitle) {
                applyTitle();
            }
        });
    }

    /** Observes tab title changes so the duration prefix can be restored. */
    function observeTitle(): void {
        const el = document.querySelector("title");
        if (!el) {
            return;
        }

        new MutationObserver(() => {
            if (!isWritingTitle) {
                scheduleApply();
            }
        }).observe(el, {
            childList: true
        });
    }

    /** Observes microformat changes so metadata updates are applied. */
    function observeMicroformat(): void {
        const el = document.querySelector("#microformat");
        if (!el) {
            return;
        }

        new MutationObserver(() => {
            scheduleApply();
        }).observe(el, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    /** Starts DOM observers and performs the initial title update. */
    function start(): void {
        observeTitle();
        observeMicroformat();
        applyTitle();
    }

    start();
})();
