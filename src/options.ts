const WATCHTIME_PREFIX_ENABLED_KEY = "watchtimePrefixEnabled";
const VIEWS_PREFIX_ENABLED_KEY = "viewsPrefixEnabled";
const LIKES_PREFIX_ENABLED_KEY = "likesPrefixEnabled";

type ToggleElements = {
    watchtimeCheckbox: HTMLInputElement;
    viewsCheckbox: HTMLInputElement;
    likesCheckbox: HTMLInputElement;
};

function getElements(): ToggleElements {
    const watchtimeCheckbox = document.querySelector<HTMLInputElement>("#watchtimePrefixEnabled");
    const viewsCheckbox = document.querySelector<HTMLInputElement>("#viewsPrefixEnabled");
    const likesCheckbox = document.querySelector<HTMLInputElement>("#likesPrefixEnabled");

    if (!watchtimeCheckbox || !viewsCheckbox || !likesCheckbox) {
        throw new Error("Options UI is missing required elements.");
    }

    return { watchtimeCheckbox, viewsCheckbox, likesCheckbox };
}

async function initializeOptions(): Promise<void> {
    const { watchtimeCheckbox, viewsCheckbox, likesCheckbox } = getElements();
    const stored = await chrome.storage.sync.get([
        WATCHTIME_PREFIX_ENABLED_KEY,
        VIEWS_PREFIX_ENABLED_KEY,
        LIKES_PREFIX_ENABLED_KEY
    ]);

    watchtimeCheckbox.checked = stored[WATCHTIME_PREFIX_ENABLED_KEY] !== false;
    viewsCheckbox.checked = stored[VIEWS_PREFIX_ENABLED_KEY] === true;
    likesCheckbox.checked = stored[LIKES_PREFIX_ENABLED_KEY] === true;

    watchtimeCheckbox.addEventListener("change", async () => {
        await chrome.storage.sync.set({
            [WATCHTIME_PREFIX_ENABLED_KEY]: watchtimeCheckbox.checked
        });
    });

    viewsCheckbox.addEventListener("change", async () => {
        await chrome.storage.sync.set({
            [VIEWS_PREFIX_ENABLED_KEY]: viewsCheckbox.checked
        });
    });

    likesCheckbox.addEventListener("change", async () => {
        await chrome.storage.sync.set({
            [LIKES_PREFIX_ENABLED_KEY]: likesCheckbox.checked
        });
    });
}

void initializeOptions();
