/**
 * seed_home_greetings_full.js
 * Upserts all 120 HomeGreeting items (originally from generate_home_greetings.js static array)
 * into the HomeGreeting MongoDB collection so generate_home_greetings.js can query them.
 *
 * Run once: node src/scripts/seeders/seed_home_greetings_full.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const HomeGreeting = require('../../models/HomeGreeting');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';

// -- Read the extracted static backup --
const rawData = require('../../../data/home_greetings_seed.json');

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    let upserted = 0;
    for (const item of rawData) {
        const { type, text, tags, translations } = item;
        if (!text) continue;

        // Normalize translations from the static array format:
        // original format: { hi: { text: '...' }, mr: { text: '...' }, ... }
        const normalizedTranslations = {};
        for (const [lang, val] of Object.entries(translations || {})) {
            normalizedTranslations[lang] = { text: val?.text || '' };
        }

        await HomeGreeting.findOneAndUpdate(
            { text },
            { $set: { type: type || 'general', text, tags: tags || [], translations: normalizedTranslations, is_active: true } },
            { upsert: true, new: true }
        );
        upserted++;
    }

    console.log(`✅ Seeded ${upserted} HomeGreeting records.`);
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ HomeGreeting seed failed:', err);
    process.exit(1);
});
