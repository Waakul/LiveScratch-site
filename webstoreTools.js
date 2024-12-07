import axios from 'axios';

let cachedVersion = null;
let cacheTimestamp = null;
const CACHE_TTL = 12 * 60 * 60 * 1000;

export async function scrapeVersion(url) {
    const now = Date.now();

    if (cachedVersion) {
        console.log('Serving cached version:', cachedVersion);

        if (!cacheTimestamp || now - cacheTimestamp >= CACHE_TTL) {
            console.log('Cache expired, refreshing in the background...');
            refreshCache(url);
        }

        return cachedVersion;
    }

    return await refreshCache(url);
}

async function refreshCache(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;

        const versionMatch = html.match(/<div class="N3EXSc">([^<]+)<\/div>/);
        const version = versionMatch ? versionMatch[1] : 'Unknown';

        cachedVersion = version;
        cacheTimestamp = Date.now();

        console.log('Cache updated with new version:', version);
        return version;
    } catch (error) {
        console.error('Error refreshing cache:', error.message);
        return cachedVersion || 'Error fetching version';
    }
}