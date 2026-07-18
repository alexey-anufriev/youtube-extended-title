const WATCHTIME_PREFIX_ENABLED_KEY = "watchtimePrefixEnabled";
const VIEWS_PREFIX_ENABLED_KEY = "viewsPrefixEnabled";
const LIKES_PREFIX_ENABLED_KEY = "likesPrefixEnabled";
const AUTHOR_PREFIX_ENABLED_KEY = "authorPrefixEnabled";
const HIDE_ZERO_VALUE_PREFIXES_KEY = "hideZeroValuePrefixes";

type ToggleElements = {
    watchtimeCheckbox: HTMLInputElement;
    viewsCheckbox: HTMLInputElement;
    likesCheckbox: HTMLInputElement;
    authorCheckbox: HTMLInputElement;
    hideZeroValuePrefixesCheckbox: HTMLInputElement;
};

function getElements(): ToggleElements {
    const watchtimeCheckbox = document.querySelector<HTMLInputElement>("#watchtimePrefixEnabled");
    const viewsCheckbox = document.querySelector<HTMLInputElement>("#viewsPrefixEnabled");
    const likesCheckbox = document.querySelector<HTMLInputElement>("#likesPrefixEnabled");
    const authorCheckbox = document.querySelector<HTMLInputElement>("#authorPrefixEnabled");
    const hideZeroValuePrefixesCheckbox = document.querySelector<HTMLInputElement>("#hideZeroValuePrefixes");

    if (!watchtimeCheckbox || !viewsCheckbox || !likesCheckbox || !authorCheckbox || !hideZeroValuePrefixesCheckbox) {
        throw new Error("Options UI is missing required elements.");
    }

    return { watchtimeCheckbox, viewsCheckbox, likesCheckbox, authorCheckbox, hideZeroValuePrefixesCheckbox };
}

async function initializeOptions(): Promise<void> {
    const {
        watchtimeCheckbox,
        viewsCheckbox,
        likesCheckbox,
        authorCheckbox,
        hideZeroValuePrefixesCheckbox
    } = getElements();
    const stored = await chrome.storage.sync.get([
        WATCHTIME_PREFIX_ENABLED_KEY,
        VIEWS_PREFIX_ENABLED_KEY,
        LIKES_PREFIX_ENABLED_KEY,
        AUTHOR_PREFIX_ENABLED_KEY,
        HIDE_ZERO_VALUE_PREFIXES_KEY
    ]);

    watchtimeCheckbox.checked = stored[WATCHTIME_PREFIX_ENABLED_KEY] !== false;
    viewsCheckbox.checked = stored[VIEWS_PREFIX_ENABLED_KEY] === true;
    likesCheckbox.checked = stored[LIKES_PREFIX_ENABLED_KEY] === true;
    authorCheckbox.checked = stored[AUTHOR_PREFIX_ENABLED_KEY] === true;
    hideZeroValuePrefixesCheckbox.checked = stored[HIDE_ZERO_VALUE_PREFIXES_KEY] === true;

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

    authorCheckbox.addEventListener("change", async () => {
        await chrome.storage.sync.set({
            [AUTHOR_PREFIX_ENABLED_KEY]: authorCheckbox.checked
        });
    });

    hideZeroValuePrefixesCheckbox.addEventListener("change", async () => {
        await chrome.storage.sync.set({
            [HIDE_ZERO_VALUE_PREFIXES_KEY]: hideZeroValuePrefixesCheckbox.checked
        });
    });
}

void initializeOptions();
