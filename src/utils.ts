/** Converts an ISO 8601 YouTube duration into mm:ss or hh:mm:ss. */
function parseDuration(input: string): string | null {
    if (!input.startsWith("PT")) {
        return null;
    }

    let total = 0;
    let current = "";

    for (let i = 2; i < input.length; i++) {
        const c = input[i];

        if (c >= "0" && c <= "9") {
            current += c;
            continue;
        }

        if (!current) {
            continue;
        }

        const value = Number(current);
        current = "";

        if (c === "H") {
            total += value * 3600;
        }
        else if (c === "M") {
            total += value * 60;
        }
        else if (c === "S") {
            total += value;
        }
    }

    if (total <= 0) {
        return null;
    }

    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    return h > 0
        ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        : `${m}:${String(s).padStart(2, "0")}`;
}

/** Formats large counts into compact K/M/B strings for shorter tab titles. */
function formatCompactCount(input: string): string | null {
    const numericValue = Number(input);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
        return null;
    }

    return new Intl.NumberFormat("en", {
        maximumFractionDigits: 1,
        notation: "compact"
    }).format(numericValue);
}

/** Removes leading metadata prefixes previously added to the tab title. */
function stripPrefix(title: string): string {
    let strippedTitle = title;

    while (true) {
        const match = strippedTitle.match(/^(?:\[(\d{1,2}:)?\d{1,2}:\d{2}\]|\[(?:👁|👍)\s[^\]]+\])\s+/);
        if (!match) {
            return strippedTitle;
        }

        strippedTitle = strippedTitle.slice(match[0].length);
    }
}
