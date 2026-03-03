const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// The raw downloaded audio from Pixabay
const AUDIO_DIR = path.join(__dirname, '../../assets/audio');
// The final destination in the Flutter app
const OUTPUT_DIR = path.join(__dirname, '../../../flutter_app/assets/audio');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Ensure source directory exists
if (!fs.existsSync(AUDIO_DIR)) {
    console.error('❌ Raw audio directory not found. Please run download_audio.js first.');
    process.exit(1);
}

let hasFfmpeg = true;
try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
} catch (e) {
    console.warn('⚠️ FFmpeg is not installed. Falling back to copying raw MP3s without AAC optimization.');
    hasFfmpeg = false;
}

const files = fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3') || f.endsWith('.wav'));

if (files.length === 0) {
    console.log('⚠️ No audio files found to optimize in backend/assets/audio/');
    process.exit(0);
}

console.log(`Optimizing ${files.length} audio files to AAC 128kbps...`);

for (const file of files) {
    const src = path.join(AUDIO_DIR, file);
    // Output path depends on FFmpeg availability
    const dest = path.join(OUTPUT_DIR, hasFfmpeg ? file.replace(/\.(mp3|wav)$/, '.m4a') : file);

    try {
        if (hasFfmpeg) {
            console.log(`\n⚙️  Optimizing ${file} -> ${path.basename(dest)}...`);
            execSync(`ffmpeg -y -i "${src}" -c:a aac -b:a 128k "${dest}"`, { stdio: 'inherit' });
        } else {
            console.log(`\n📋 Copying ${file} -> ${path.basename(dest)}...`);
            fs.copyFileSync(src, dest);
        }
        console.log(`✅ Success`);
    } catch (e) {
        console.error(`❌ Failed to process ${file}`);
    }
}
console.log('\n🎉 Audio optimization complete! The app can now use these assets.');
