((): void => {
    let applyScheduled = false;
    let isWritingTitle = false;

    function isWatchPage(): boolean {
        return location.pathname === "/watch" && new URLSearchParams(location.search).has("v");
    }

    function getMicroformatData(): { duration?: string } | null {
        const el = document.querySelector("#microformat");
        const raw = el?.textContent?.trim();
        if (!raw) return null;

        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    function parseISO8601Duration(input: string): string | null {
        if (!input.startsWith("PT")) return null;

        let total = 0;
        let current = "";

        for (let i = 2; i < input.length; i++) {
            const c = input[i];

            if (c >= "0" && c <= "9") {
                current += c;
                continue;
            }

            if (!current) continue;

            const value = Number(current);
            current = "";

            if (c === "H") total += value * 3600;
            else if (c === "M") total += value * 60;
            else if (c === "S") total += value;
        }

        if (total <= 0) return null;

        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;

        return h > 0
            ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
            : `${m}:${String(s).padStart(2, "0")}`;
    }

    function stripPrefix(title: string): string {
        if (!title.startsWith("[")) {
            return title;
        }

        const closing = title.indexOf("]");
        if (closing === -1) {
            return title;
        }

        return title.slice(closing + 2);
    }

    function buildTitle(): string | null {
        if (!isWatchPage()) {
            return null;
        }

        const data = getMicroformatData();
        const duration = data?.duration
            ? parseISO8601Duration(data.duration)
            : null;

        if (!duration) {
            return null;
        }

        const baseTitle = stripPrefix(document.title);

        return `[${duration}] ${baseTitle}`;
    }

    function applyTitle(): void {
        const next = buildTitle();
        if (!next || document.title === next) {
            return;
        }

        isWritingTitle = true;
        document.title = next;
        isWritingTitle = false;
    }

    function scheduleApply(): void {
        if (applyScheduled) return;

        applyScheduled = true;

        queueMicrotask(() => {
            applyScheduled = false;

            if (!isWritingTitle) {
                applyTitle();
            }
        });
    }

    function observeTitle(): void {
        const el = document.querySelector("title");
        if (!el) return;

        new MutationObserver(() => {
            if (!isWritingTitle) {
                scheduleApply();
            }
        }).observe(el, {
            childList: true
        });
    }

    function observeMicroformat(): void {
        const el = document.querySelector("#microformat");
        if (!el) return;

        new MutationObserver(() => {
            scheduleApply();
        }).observe(el, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    function start(): void {
        observeTitle();
        observeMicroformat();
        applyTitle();
    }

    start();
})();