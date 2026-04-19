const WATCHTIME_PREFIX_ENABLED_KEY = "watchtimePrefixEnabled";

type ToggleElements = {
    checkbox: HTMLInputElement;
};

function getElements(): ToggleElements {
    const checkbox = document.querySelector<HTMLInputElement>("#watchtimePrefixEnabled");

    if (!checkbox) {
        throw new Error("Options UI is missing required elements.");
    }

    return { checkbox };
}

async function initializeOptions(): Promise<void> {
    const { checkbox } = getElements();
    const stored = await chrome.storage.sync.get(WATCHTIME_PREFIX_ENABLED_KEY);
    const enabled = stored[WATCHTIME_PREFIX_ENABLED_KEY] !== false;

    checkbox.checked = enabled;

    checkbox.addEventListener("change", async () => {
        const nextValue = checkbox.checked;

        await chrome.storage.sync.set({
            [WATCHTIME_PREFIX_ENABLED_KEY]: nextValue
        });
    });
}

void initializeOptions();
