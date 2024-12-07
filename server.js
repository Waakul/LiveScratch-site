import express from 'express';
import * as webstoreTools from './webstoreTools.js';
const app = express();

const PORT = 4001;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('public/index.html');
});

app.get('/getVersion', async (req, res) => {
    res.json({version: await webstoreTools.scrapeVersion("https://chromewebstore.google.com/detail/livescratch-live-scratch/pfaldlkkohfdnmlcladmhlihpbhlkolm")});
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});