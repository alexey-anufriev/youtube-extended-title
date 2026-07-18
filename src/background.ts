((): void => {
    const API_URL = "https://returnyoutubedislikeapi.com/votes";
    const CACHE_TTL_MS = 60 * 60 * 1000;

    type DislikeCacheEntry = {
        dislikes: number;
        expiresAt: number;
    };

    const dislikeCache = new Map<string, DislikeCacheEntry>();

    type DislikeRequest = {
        type?: string;
        videoId?: string;
    };

    type VoteResponse = {
        dislikes?: number;
    };

    /** Gets and caches the estimated dislike count for a YouTube video. */
    async function getDislikes(videoId: string): Promise<number | null> {
        const cached = dislikeCache.get(videoId);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.dislikes;
        }

        dislikeCache.delete(videoId);

        const url = new URL(API_URL);
        url.searchParams.set("videoId", videoId);

        const response = await fetch(url, {
            headers: { accept: "application/json" }
        });
        if (!response.ok) {
            return null;
        }

        const data = await response.json() as VoteResponse;
        if (!Number.isFinite(data.dislikes) || data.dislikes! < 0) {
            return null;
        }

        dislikeCache.set(videoId, {
            dislikes: data.dislikes!,
            expiresAt: Date.now() + CACHE_TTL_MS
        });
        return data.dislikes!;
    }

    chrome.runtime.onMessage.addListener((message: DislikeRequest, _sender, sendResponse) => {
        if (message.type !== "getDislikes" || !message.videoId
            || !/^[A-Za-z0-9_-]{11}$/.test(message.videoId)) {
            return false;
        }

        void getDislikes(message.videoId)
            .then((dislikes) => sendResponse({ dislikes }))
            .catch(() => sendResponse({ dislikes: null }));

        return true;
    });
})();
