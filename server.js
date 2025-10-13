import express from 'express';
import path from 'path';
const app = express();

import axios from 'axios';

const PORT = 4001;

app.use(express.static('public'));

app.get('/getVersion', async (req, res) => {
    res.json({version: await scrapeVersion("https://api.github.com/repos/Waakul/LiveScratch/releases/latest")});
});

app.get('*', (req, res) => {
    res.status(404).sendFile(path.join(process.cwd(), 'public', '404', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



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
        const version = response.data.tag_name || 'Error Loading Version';

        cachedVersion = version;
        cacheTimestamp = Date.now();

        console.log('Cache updated with new version:', version);
        return version;
    } catch (error) {
        console.error('Error refreshing cache:', error.message);
        return cachedVersion || 'Error fetching version';
    }
}