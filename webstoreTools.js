import puppeteer from 'puppeteer';

let cachedVersion = null;
let cacheTimestamp = null;
const CACHE_TTL = 12 * (60 * (60 * (1000)));

export async function scrapeVersion(url) {
  const now = Date.now();

  // Serve the cached version immediately, if available, even if expired
  if (cachedVersion) {
    console.log('Serving cached version:', cachedVersion);

    // If cache is expired, trigger a background refresh
    if (!cacheTimestamp || now - cacheTimestamp >= CACHE_TTL) {
      console.log('Cache expired, refreshing in the background...');
      refreshCache(url); // Trigger background refresh
    }

    return cachedVersion; // Return the current cached version
  }

  // If no cache is available, fetch and return immediately
  return await refreshCache(url);
}

// Background cache refresh function
async function refreshCache(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('.N3EXSc', { timeout: 5000 });

    const version = await page.evaluate(() => {
      const element = document.querySelectorAll('.N3EXSc')[0];
      return element ? element.textContent : 'Unknown';
    });

    // Update cache
    cachedVersion = version;
    cacheTimestamp = Date.now();

    console.log('Cache updated with new version:', version);
    return version;
  } catch (error) {
    console.error('Error refreshing cache:', error.message);
    return cachedVersion || 'Error fetching version'; // Fallback to existing cache if available
  } finally {
    await browser.close();
  }
}