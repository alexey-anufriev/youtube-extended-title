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

/** Removes a leading duration prefix previously added to the tab title. */
function stripPrefix(title: string): string {
    const match = title.match(/^\[(\d{1,2}:)?\d{1,2}:\d{2}\]\s+/);
    if (!match) {
        return title;
    }

    return title.slice(match[0].length);
}
