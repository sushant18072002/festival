const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const connectDB = require('../../config/db');
const HomeGreeting = require('../../models/HomeGreeting');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const LANGUAGES = ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'];

/**
 * generateHomeGreetingsMemory — called by generate_all.js and upload_s3.js
 * Reads from the HomeGreeting MongoDB collection and returns one shared JSON:
 *   { 'home_greetings.json': '<JSON string>' }
 *
 * The Flutter home feed picks the right greetings at runtime by 'type' and 'tags'.
 * A single language-neutral file is produced (text falls back to English if translation missing).
 */
async function generateHomeGreetingsMemory() {
    const items = await HomeGreeting.find({ is_active: true, is_deleted: { $ne: true } }).lean();

    // The legacy format: Flat array of objects
    const greetingsFlat = items.map((item, idx) => ({
        id: item._id ? item._id.toString() : idx + 1,
        type: item.type || 'general',
        text: item.text || '',
        tags: item.tags || [],
        translations: Object.fromEntries(
            LANGUAGES.filter(l => l !== 'en').map(l => [
                l,
                { text: item.translations?.[l]?.text || item.text || '' }
            ])
        )
    }));

    // The modern format: Mapped by language, grouped by time-of-day
    // e.g. "en": { morning: ['Rise and shine'], evening: ['Good evening'] }
    const mappedByLanguage = {};
    for (const lang of LANGUAGES) {
        mappedByLanguage[lang] = { morning: [], afternoon: [], evening: [], night: [], festival: [], general: [] };
        
        for (const hg of items) {
            const type = hg.type || 'general';
            if (!mappedByLanguage[lang][type]) continue;
            
            const text = (lang !== 'en' && hg.translations?.[lang]?.text) ? hg.translations[lang].text : hg.text;
            if (text) mappedByLanguage[lang][type].push(text);
        }
    }

    const output = {
        version: '2.0',
        generated_at: new Date().toISOString(),
        total: greetingsFlat.length,
        // Keep flat array for backwards compat if needed by other web admins
        greetings: greetingsFlat,
        // Expose the new grouped map so Flutter can pluck directly
        grouped_greetings: mappedByLanguage
    };

    console.log(`[RAM Generate] Compiled Home Greetings: ${greetingsFlat.length} items from DB.`);

    return {
        'home/home_greetings.json': JSON.stringify(output)
    };
}

module.exports = { generateHomeGreetingsMemory };

// Standalone execution: node generate_home_greetings.js
if (require.main === module) {
    (async () => {
        await connectDB();
        const outputs = await generateHomeGreetingsMemory();
        for (const [relativePath, jsonString] of Object.entries(outputs)) {
            const fullDst = path.join(__dirname, '../../data/json', relativePath);
            await fs.ensureDir(path.dirname(fullDst));
            await fs.writeFile(fullDst, jsonString);
            console.log(`Written: ${fullDst}`);
        }
        process.exit(0);
    })();
}
