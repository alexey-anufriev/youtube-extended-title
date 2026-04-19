((): void => {
    const WATCHTIME_PREFIX_ENABLED_KEY = "watchtimePrefixEnabled";

    /** Prevents scheduling multiple title updates in the same microtask turn. */
    let applyScheduled = false;

    /** Guards the title observer from reacting to this script's own writes. */
    let isWritingTitle = false;

    /** Tracks whether the watchtime prefix is enabled in extension settings. */
    let watchtimePrefixEnabled = true;

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
        if (!watchtimePrefixEnabled) {
            return null;
        }

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

    /** Removes the injected prefix when settings or page state require it. */
    function clearInjectedPrefix(): void {
        const strippedTitle = stripPrefix(document.title);
        if (strippedTitle === document.title) {
            return;
        }

        isWritingTitle = true;
        document.title = strippedTitle;
        isWritingTitle = false;
    }

    /** Applies the computed title if it differs from the current tab title. */
    function applyTitle(): void {
        const next = buildTitle();
        if (!next) {
            clearInjectedPrefix();
            return;
        }

        if (document.title === next) {
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

    /** Loads the current setting from storage before the first title update. */
    async function loadSettings(): Promise<void> {
        const stored = await chrome.storage.sync.get(WATCHTIME_PREFIX_ENABLED_KEY);
        watchtimePrefixEnabled = stored[WATCHTIME_PREFIX_ENABLED_KEY] !== false;
    }

    /** Keeps the current tab title in sync with options page changes. */
    function observeSettings(): void {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== "sync" || !changes[WATCHTIME_PREFIX_ENABLED_KEY]) {
                return;
            }

            watchtimePrefixEnabled = changes[WATCHTIME_PREFIX_ENABLED_KEY].newValue !== false;
            scheduleApply();
        });
    }

    /** Starts DOM observers and performs the initial title update. */
    async function start(): Promise<void> {
        await loadSettings();
        observeTitle();
        observeMicroformat();
        observeSettings();
        applyTitle();
    }

    void start();
})();
