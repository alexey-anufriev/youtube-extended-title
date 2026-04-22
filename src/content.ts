((): void => {
    const WATCHTIME_PREFIX_ENABLED_KEY = "watchtimePrefixEnabled";
    const VIEWS_PREFIX_ENABLED_KEY = "viewsPrefixEnabled";
    const LIKES_PREFIX_ENABLED_KEY = "likesPrefixEnabled";
    const AUTHOR_PREFIX_ENABLED_KEY = "authorPrefixEnabled";

    /** Prevents scheduling multiple title updates in the same microtask turn. */
    let applyScheduled = false;

    /** Guards the title observer from reacting to this script's own writes. */
    let isWritingTitle = false;

    /** Tracks whether the watchtime prefix is enabled in extension settings. */
    let watchtimePrefixEnabled = true;

    /** Tracks whether the views prefix is enabled in extension settings. */
    let viewsPrefixEnabled = false;

    /** Tracks whether the likes prefix is enabled in extension settings. */
    let likesPrefixEnabled = false;

    /** Tracks whether the author prefix is enabled in extension settings. */
    let authorPrefixEnabled = false;

    /** Returns true when the current URL is a YouTube watch page. */
    function isWatchPage(): boolean {
        return location.pathname === "/watch" && new URLSearchParams(location.search).has("v");
    }

    type InteractionCounter = {
        interactionType?: string;
        userInteractionCount?: string;
    };

    type MicroformatData = {
        author?: string;
        duration?: string;
        interactionStatistic?: InteractionCounter[];
    };

    /** Reads and parses duration and interaction metadata from YouTube's microformat node. */
    function getMicroformatData(): MicroformatData | null {
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

    /** Reads a specific interaction count from YouTube's metadata block. */
    function getInteractionCount(data: MicroformatData | null, actionName: "WatchAction" | "LikeAction"): string | null {
        const stats = data?.interactionStatistic;
        if (!stats) {
            return null;
        }

        for (const entry of stats) {
            if (!entry.interactionType?.endsWith(`/${actionName}`)) {
                continue;
            }

            return entry.userInteractionCount
                ? formatCompactCount(entry.userInteractionCount)
                : null;
        }

        return null;
    }

    /** Returns the channel name label from the current metadata when available. */
    function getAuthorLabel(data: MicroformatData | null): string | null {
        const author = data?.author?.trim();
        if (!author) {
            return null;
        }

        return truncateLabel(author, 20);
    }

    /** Returns the channel name prefix when the setting is enabled and metadata is present. */
    function getAuthorPrefix(data: MicroformatData | null): string | null {
        if (!authorPrefixEnabled) {
            return null;
        }

        const authorLabel = getAuthorLabel(data);
        if (!authorLabel) {
            return null;
        }

        return `${authorLabel}:`;
    }

    /** Removes the injected author prefix using the current metadata value. */
    function stripAuthorPrefix(title: string, data: MicroformatData | null): string {
        const authorLabel = getAuthorLabel(data);
        if (!authorLabel) {
            return title;
        }

        const authorPrefix = `${authorLabel}:`;
        if (!authorPrefix || !title.startsWith(`${authorPrefix} `)) {
            return title;
        }

        return title.slice(authorPrefix.length + 1);
    }

    /** Removes all extension-managed prefixes from the current tab title. */
    function getBaseTitle(data: MicroformatData | null): string {
        return stripAuthorPrefix(stripPrefix(document.title), data);
    }

    /** Builds the tab title with enabled metadata prefixes when available. */
    function buildTitle(): string | null {
        if (!isWatchPage()) {
            return null;
        }

        if (!watchtimePrefixEnabled && !viewsPrefixEnabled && !likesPrefixEnabled && !authorPrefixEnabled) {
            return null;
        }

        const data = getMicroformatData();
        const baseTitle = getBaseTitle(data);
        const prefixes: string[] = [];
        const authorPrefix = getAuthorPrefix(data);

        if (watchtimePrefixEnabled) {
            const duration = data?.duration
                ? parseDuration(data.duration)
                : null;

            if (duration) {
                prefixes.push(`[${duration}]`);
            }
        }

        if (viewsPrefixEnabled) {
            const viewsCount = getInteractionCount(data, "WatchAction");
            if (viewsCount) {
                prefixes.push(`[👁 ${viewsCount}]`);
            }
        }

        if (likesPrefixEnabled) {
            const likesCount = getInteractionCount(data, "LikeAction");
            if (likesCount) {
                prefixes.push(`[👍 ${likesCount}]`);
            }
        }

        if (prefixes.length === 0 && !authorPrefix) {
            return null;
        }

        const prefixText = prefixes.join(" ");
        if (authorPrefix && prefixText) {
            return `${prefixText} ${authorPrefix} ${baseTitle}`;
        }

        if (authorPrefix) {
            return `${authorPrefix} ${baseTitle}`;
        }

        return `${prefixText} ${baseTitle}`;
    }

    /** Removes the injected prefix when settings or page state require it. */
    function clearInjectedPrefix(): void {
        const data = getMicroformatData();
        const strippedTitle = getBaseTitle(data);
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
        const stored = await chrome.storage.sync.get([
            WATCHTIME_PREFIX_ENABLED_KEY,
            VIEWS_PREFIX_ENABLED_KEY,
            LIKES_PREFIX_ENABLED_KEY,
            AUTHOR_PREFIX_ENABLED_KEY
        ]);
        watchtimePrefixEnabled = stored[WATCHTIME_PREFIX_ENABLED_KEY] !== false;
        viewsPrefixEnabled = stored[VIEWS_PREFIX_ENABLED_KEY] === true;
        likesPrefixEnabled = stored[LIKES_PREFIX_ENABLED_KEY] === true;
        authorPrefixEnabled = stored[AUTHOR_PREFIX_ENABLED_KEY] === true;
    }

    /** Keeps the current tab title in sync with options page changes. */
    function observeSettings(): void {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== "sync") {
                return;
            }

            if (changes[WATCHTIME_PREFIX_ENABLED_KEY]) {
                watchtimePrefixEnabled = changes[WATCHTIME_PREFIX_ENABLED_KEY].newValue !== false;
            }

            if (changes[VIEWS_PREFIX_ENABLED_KEY]) {
                viewsPrefixEnabled = changes[VIEWS_PREFIX_ENABLED_KEY].newValue === true;
            }

            if (changes[LIKES_PREFIX_ENABLED_KEY]) {
                likesPrefixEnabled = changes[LIKES_PREFIX_ENABLED_KEY].newValue === true;
            }

            if (changes[AUTHOR_PREFIX_ENABLED_KEY]) {
                authorPrefixEnabled = changes[AUTHOR_PREFIX_ENABLED_KEY].newValue === true;
            }

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
