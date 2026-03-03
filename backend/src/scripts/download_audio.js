const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const TARGET_DIR = path.join(__dirname, '../../assets/audio');
const API_KEY = process.env.PIXABAY_API_KEY;

// Ensure directory exists
if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Map of slug to search terms and tags that yield good Indian ambient/festival audio
const AUDIO_CATALOG = [
    { slug: 'diwali', term: 'temple bells chants', category: 'ambient' },
    { slug: 'holi', term: 'dhol drum beats', category: 'upbeat' },
    { slug: 'ganesh_chaturthi', term: 'aarti drum', category: 'devotional' },
    { slug: 'navratri', term: 'garba folk dance', category: 'upbeat' },
    { slug: 'eid_ul_fitr', term: 'nasheed arabic', category: 'ambient' },
    { slug: 'christmas', term: 'carol choir', category: 'music' },
    { slug: 'onam', term: 'kerala folk instrumental', category: 'acoustic' },
    { slug: 'dussehra', term: 'epic victorious orchestra', category: 'cinematic' },
    { slug: 'baisakhi', term: 'bhangra joyful Punjabi', category: 'upbeat' },
    { slug: 'raksha_bandhan', term: 'flute soft calm', category: 'acoustic' }
];

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const options = {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) UtsavApp/1.0' }
        };
        https.get(url, options, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => file.close(resolve));
            } else {
                reject(new Error(`Server responded with ${response.statusCode}: ${response.statusMessage}`));
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
};

const searchPixabay = (term, category) => {
    return new Promise((resolve, reject) => {
        const query = encodeURIComponent(term);
        // Add duration filter so we don't get tiny 10s clips or 10 min tracks
        const url = `https://pixabay.com/api/audio/?key=${API_KEY}&q=${query}&category=${category}&order=popular&min_duration=30&max_duration=300`;

        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => data += chunk);
            response.on('end', () => {
                if (response.statusCode !== 200) return reject(new Error(`API Error: ${response.statusCode} - ${data}`));
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.hits && parsed.hits.length > 0) {
                        resolve(parsed.hits[0]); // Take the top result
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
};

const run = async () => {
    let useFallback = false;
    if (!API_KEY) {
        console.warn('⚠️ PIXABAY_API_KEY is missing from backend/.env');
        console.warn('⚠️ Using a fallback public domain ambient track for all festivals to ensure pipeline works.');
        useFallback = true;
    }

    console.log(`Starting audio fetching for ${AUDIO_CATALOG.length} events...`);

    for (const item of AUDIO_CATALOG) {
        const filename = `${item.slug}_ambient.mp3`;
        const dest = path.join(TARGET_DIR, filename);

        // Skip if already downloaded AND it's not a 0-byte corrupt file
        if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
            console.log(`⏭️  Skipping ${filename} (already exists)`);
            continue;
        }

        try {
            if (useFallback) {
                // Fetch a reliable sample MP3 from GitHub as fallback
                const fallbackUrl = 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3';
                await downloadFile(fallbackUrl, dest);
                console.log(`✅ Saved fallback track: ${filename}`);
            } else {
                console.log(`\n🔍 Searching Pixabay for: "${item.term}"...`);
                const track = await searchPixabay(item.term, item.category);

                if (track) {
                    console.log(`⬇️  Found: "${track.name}" (${track.duration}s). Downloading...`);
                    await downloadFile(track.audio, dest);
                    console.log(`✅ Saved: ${filename}`);
                } else {
                    console.log(`⚠️  No results found for "${item.term}". Try manual download.`);
                }

                // Pixabay API rate limit is 100 req/min, sleep 1s between searches just to be safe
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (err) {
            console.error(`❌ Failed to process ${item.slug}:`, err.message);
        }
    }
    console.log('\n🎉 Audio downloading complete!');
};

run();
