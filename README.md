# YouTube Extended Title

Google Chrome Extension. Extends YouTube tab titles with video metadata.

Example: `[12:34] [👁 1.4M] [👍 10.6K] [👎 2.1K] Channel Name: Video Title`

---

## Features

- Prefixes YouTube tab titles with video metadata
- Supports watchtime, views, likes, estimated dislikes, and channel name as separate title components
- Uses compact emoji prefixes for shorter titles, such as `[👁 1.4M]` and `[👍 10.6K]`
- Includes a settings page with independent toggles for each metadata component
- Supports both `/watch?v=...` and `/live/{videoId}` video URLs
- Works with YouTube navigation (no page reload needed)
- Lightweight and fast (no timers, minimal DOM observers)
- No dependencies

---

## Installation

### From Chrome Web Store

https://chromewebstore.google.com/detail/youtube-extended-title/kckbkmppdmeackehkfdeckpgjddeibmn

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
- Loads estimated dislikes from [Return YouTube Dislike](https://returnyoutubedislike.com/) only when the dislike prefix is enabled; this sends the current video ID to their API
- Observes DOM changes to keep the title in sync
- Prepends enabled metadata components in this order: watchtime, views, likes, dislikes, channel name

---

## Settings

- `Add watchtime prefix`: enabled by default, example `[12:34] Video Title`
- `Add views prefix`: disabled by default, example `[👁 1.4M] Video Title`
- `Add likes prefix`: disabled by default, example `[👍 10.6K] Video Title`
- `Add dislikes prefix`: disabled by default, example `[👎 2.1K] Video Title`; uses the Return YouTube Dislike estimate and requests API access when enabled
- `Add channel prefix`: disabled by default, example `Channel Name: Video Title` with names truncated after 20 characters to `...`
- `Hide zero-value prefixes`: disabled by default; when enabled, omits views, likes, and dislikes prefixes whose value is `0`

---

## License

MIT

---

## Support

Enjoying this extension?

<a href="https://www.buymeacoffee.com/alexey.anufriev" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
