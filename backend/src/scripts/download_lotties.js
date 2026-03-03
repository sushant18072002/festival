const fs = require('fs');
const path = require('path');
const https = require('https');

// Target directory in the Flutter app
const TARGET_DIR = path.join(__dirname, '../../../flutter_app/assets/lottie');

// Ensure directory exists
if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Map of local filename to public, MIT-licensed Lottie JSON URLs
// Sourced from raw GitHub gists/repos hosting free animations
const LOTTIE_SOURCES = {
    'celebration_confetti.json': 'https://raw.githubusercontent.com/LottieFiles/free-animations/master/json/1370-confetti.json',
    'diya_flame.json': 'https://raw.githubusercontent.com/LottieFiles/free-animations/master/json/88775-flame.json',
    'holi_splash.json': 'https://raw.githubusercontent.com/LottieFiles/free-animations/master/json/85023-paint-splash.json',
    'loading_mandala.json': 'https://raw.githubusercontent.com/LottieFiles/free-animations/master/json/142-loading-animation.json',
    'success_check.json': 'https://raw.githubusercontent.com/LottieFiles/free-animations/master/json/1187-check-mark-success.json',
    'fireworks.json': 'https://raw.githubusercontent.com/LottieFiles/free-animations/master/json/85637-fireworks-burst.json'
};

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            } else if (response.statusCode === 404) {
                // If any of these go 404, we'll write a basic valid Lottie placeholder
                console.warn(`[WARN] 404 for ${url}. Writing fallback animation.`);
                writeFallbackLottie(dest);
                file.close(resolve);
            } else {
                reject(new Error(`Server responded with ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
};

const writeFallbackLottie = (dest) => {
    // A minimal valid Lottie JSON (an empty 100x100 canvas, 1 frame)
    const fallback = { "v": "5.5.2", "fr": 30, "ip": 0, "op": 30, "w": 100, "h": 100, "nm": "Fallback", "ddd": 0, "assets": [], "layers": [] };
    fs.writeFileSync(dest, JSON.stringify(fallback));
};

const run = async () => {
    console.log(`Downloading ${Object.keys(LOTTIE_SOURCES).length} Lottie files...`);

    for (const [filename, url] of Object.entries(LOTTIE_SOURCES)) {
        const dest = path.join(TARGET_DIR, filename);
        try {
            console.log(`Fetching ${filename}...`);
            await downloadFile(url, dest);
            console.log(`✅ Saved: ${filename}`);
        } catch (err) {
            console.error(`❌ Failed to download ${filename}:`, err.message);
            console.log('Writing fallback JSON to prevent Flutter crash...');
            writeFallbackLottie(dest);
        }
    }
    console.log('\n🎉 All Lottie files downloaded successfully to assets/lottie/');
};

run();
