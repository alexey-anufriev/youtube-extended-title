# YouTube Title Watchtime

Adds video duration to YouTube tab titles.

Example: [12:34] Video Title | Channel

---

## Features

- Prefixes YouTube tab titles with video duration
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
7. Select the project folder

---

## How it works

- Reads video duration from YouTube `#microformat`
- Observes DOM changes to keep the title in sync
- Prepends [mm:ss] (or [hh:mm:ss]) to the existing title

---

## License

MIT

---

## Support

Enjoying this extension?

<a href="https://www.buymeacoffee.com/alexey.anufriev" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
