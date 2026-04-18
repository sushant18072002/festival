/**
 * generate_all.js — Unified Manifest Export Pipeline
 *
 * Builds ALL static JSON files served to the Flutter app:
 * feed, calendar, search, event detail, greetings, quotes,
 * mantras, images, version, manifest, quiz, trivia, gamification,
 * and home greetings — in one concurrent pipeline run.
 */

const fs = require('fs-extra');
const path = require('path');
const connectDB = require('../../config/db');

const { generateFeedMemory } = require('./generate_feed');
const { generateCalendarMemory } = require('./generate_calendar');
const { generateSearchIndexMemory } = require('./generate_search_index');
const { generateEventDetailMemory } = require('./generate_event_detail');
const { generateGreetingsMemory } = require('./generate_greetings');
const { generateQuotesMemory } = require('./generate_quotes');
const { generateMantrasMemory } = require('./generate_mantras');
const { generateImagesMemory } = require('./generate_images');
const { generateVersionMemory } = require('./generate_version');
const { generateManifestMemory } = require('./generate_manifest');
const { generateHomeGreetingsMemory } = require('./generate_home_greetings');
const generateQuizzes = require('./generate_quiz');
const generateTrivia = require('./generate_trivia');
const generateGamification = require('./generate_gamification');

const DATA_DIR = path.join(__dirname, '../../../data/json');
const LANGUAGES = ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'];

async function compileAllJSON() {
    try {
        await connectDB();
        console.log('🔌 MongoDB Connected');
        console.log('🚀 Starting Concurrent JSON Compilation Pipeline...\n');

        await fs.emptyDir(DATA_DIR);
        const startTime = Date.now();

        // Run all language-agnostic memory builders concurrently
        const results = await Promise.all([
            ...LANGUAGES.map(lang => generateFeedMemory(lang)),
            generateCalendarMemory(),
            generateSearchIndexMemory(),
            generateEventDetailMemory(),
            generateGreetingsMemory(),
            generateQuotesMemory(),
            generateMantrasMemory(),
            generateImagesMemory(),
            generateVersionMemory(),
            generateManifestMemory(),
            generateHomeGreetingsMemory()
        ]);

        // Combine all static outputs into one unified disk-write map
        const unifiedOutputs = {};
        for (const moduleOutputs of results) {
            Object.assign(unifiedOutputs, moduleOutputs);
        }

        // Per-language generators: quiz, trivia, gamification
        for (const lang of LANGUAGES) {
            unifiedOutputs[`quizzes/quiz_${lang}.json`] = JSON.stringify(await generateQuizzes(lang));
            unifiedOutputs[`trivia/trivia_${lang}.json`] = JSON.stringify(await generateTrivia(lang));
            unifiedOutputs[`gamification/gamification_${lang}.json`] = JSON.stringify(await generateGamification(lang));
        }

        console.log(`\n💾 Writing ${Object.keys(unifiedOutputs).length} JSON files to disk...`);

        let filesWritten = 0;
        for (const [relativePath, jsonString] of Object.entries(unifiedOutputs)) {
            const fullDst = path.join(DATA_DIR, relativePath);
            await fs.ensureDir(path.dirname(fullDst));
            await fs.writeFile(fullDst, jsonString);
            filesWritten++;
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n✅ PIPELINE COMPLETE in ${duration}s!`);
        console.log(`🎉 Successfully built ${filesWritten} static JSON manifests to data/json`);

        process.exit(0);
    } catch (err) {
        console.error('❌ GENERATION PIPELINE FAILED:', err);
        process.exit(1);
    }
}

compileAllJSON();
