# YouTube Extended Title

Extends YouTube tab titles with video metadata.

Example: `[12:34] [👁 1.4M] [👍 10.6K] Channel Name: Video Title`

---

## Features

- Prefixes YouTube tab titles with video metadata
- Supports watchtime, views, likes, and channel name as separate title components
- Uses compact emoji prefixes for shorter titles, such as `[👁 1.4M]` and `[👍 10.6K]`
- Includes a settings page with independent toggles for each metadata component
- Works with YouTube navigation (no page reload needed)
- Lightweight and fast (no timers, minimal DOM observers)
- No dependencies

---

## Installation

### From source

1. Clone the repository
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Open Chrome `→` `chrome://extensions`
5. Enable Developer mode
6. Click "Load unpacked"
7. Select the `dist` folder

---

## How it works

- Reads duration, watch count, and likes from YouTube `#microformat`
- Observes DOM changes to keep the title in sync
- Prepends enabled metadata components in this order: watchtime, views, likes, channel name

---

## Settings

- `Add watchtime prefix`: enabled by default, example `[12:34] Video Title`
- `Add views prefix`: disabled by default, example `[👁 1.4M] Video Title`
- `Add likes prefix`: disabled by default, example `[👍 10.6K] Video Title`
- `Add channel prefix`: disabled by default, example `Channel Name: Video Title` with names truncated after 20 characters to `...`

---

## License

MIT

---

## Support

Enjoying this extension?

<a href="https://www.buymeacoffee.com/alexey.anufriev" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
