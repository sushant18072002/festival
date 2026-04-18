/**
 * audit_json_fields.js
 * Comprehensive field-level audit: DB → Generator → Flutter model expectation
 * Run: node src/scripts/audit_json_fields.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');

// ─── Flutter model field expectations (from dart source) ─────────────────────
const FLUTTER_EXPECTATIONS = {
    event_catalog: {
        required: ['id', 'slug', 'title', 'description', 'date', 'category', 'vibes', 'tags', 'image', 'gallery', 'facts', 'ritual_steps', 'notifications', 'muhurat', 'ambient_audio', 'recipes', 'dress_guide', 'playlist_links', 'mantras', 'images'],
        optional: ['wiki_link', 'lottie_overlay', 'thumbnail', 'priority', 'dates', 'next_date']
    },
    home_feed: {
        required: ['version', 'language', 'sections', 'greetings'],
        optional: []
    },
    taxonomy: {
        required: ['categories', 'vibes', 'tags'],
        optional: []
    },
    greetings: {
        required: ['greetings'],
        item_fields: ['id', 'text', 'category', 'vibes', 'tags']
    },
    quotes: {
        required: ['quotes'],
        item_fields: ['id', 'slug', 'text', 'author', 'source', 'is_featured', 'category', 'vibes', 'tags']
    },
    mantras: {
        required: ['mantras'],
        item_fields: ['id', 'slug', 'text', 'transliteration', 'meaning', 'audio_file', 'language', 'category', 'vibes', 'tags']
    },
    images: {
        required: ['images'],
        item_fields: ['id', 'url', 'thumbnail', 'caption', 'share_text', 'media_type', 'language', 'aspect_ratio', 'dominant_colors', 'has_overlay', 'greeting_id', 'greeting_config', 'quote_id', 'quote_config', 'is_s3_uploaded', 'categories', 'tags', 'downloads_count', 'likes_count', 'shares_count']
    },
    home_feed_greetings_map: {
        required: ['morning', 'afternoon', 'evening', 'night', 'festival', 'general'],
        optional: []
    },
    notification_templates: {
        required: ['discovery', 'countdown', 'eve', 'day_of'],
        optional: []
    },
    history_fact: {
        required: ['year', 'fact', 'source'],
        optional: []
    },
    muhurat: {
        required: ['puja_time', 'type', 'description'],
        optional: []
    },
    ritual_step: {
        required: ['order', 'title', 'description', 'timing', 'items_needed'],
        optional: []
    },
    ambient_audio: {
        required: ['id', 'slug', 'filename', 's3_key', 'duration_seconds', 'title', 'is_loopable', 'fade_in_ms', 'fade_out_ms', 'default_volume', 'mood'],
        optional: []
    },
    overlay_config: {
        required: ['padding', 'max_width', 'font_size', 'font_family', 'font_weight', 'font_style', 'text_align', 'letter_spacing', 'line_height', 'shadow', 'glass_bg', 'glass_opacity', 'glass_blur', 'animation', 'color', 'position'],
        optional: []
    }
};

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';

const PASS = '✅';
const FAIL = '❌';
const WARN = '⚠️ ';

let issues = [];
let passes = 0;

function check(label, condition, detail = '') {
    if (condition) {
        passes++;
        return true;
    } else {
        issues.push({ label, detail });
        return false;
    }
}

async function auditGeneratorOutput() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Load all generators
    const { generateEventDetailMemory } = require('./generators/generate_event_detail');
    const { generateFeedMemory } = require('./generators/generate_feed');
    const { generateGreetingsMemory } = require('./generators/generate_greetings');
    const { generateQuotesMemory } = require('./generators/generate_quotes');
    const { generateMantrasMemory } = require('./generators/generate_mantras');
    const { generateImagesMemory } = require('./generators/generate_images');
    const { generateCalendarMemory } = require('./generators/generate_calendar');
    const { generateSearchIndexMemory } = require('./generators/generate_search_index');
    const generateQuizzes = require('./generators/generate_quiz');
    const generateTrivia = require('./generators/generate_trivia');
    const generateGamification = require('./generators/generate_gamification');

    const LANG = 'en'; // audit English only for speed

    console.log('='.repeat(60));
    console.log('1. AUDITING: events_catalog_en.json');
    console.log('='.repeat(60));
    const eventOutputs = await generateEventDetailMemory();
    const catalogKey = Object.keys(eventOutputs).find(k => k.includes('en'));
    const catalog = JSON.parse(eventOutputs[catalogKey]);

    check('catalog has version', catalog.version != null, `got: ${catalog.version}`);
    check('catalog has events array', Array.isArray(catalog.events), `type: ${typeof catalog.events}`);
    check('catalog has events', catalog.events.length > 0, `count: ${catalog.events.length}`);

    let badNotifFormat = 0, missingFacts = 0, factsWithNoYear = 0;
    let missingMuhurat = 0, missingRitualSteps = 0, missingAmbientAudio = 0;
    let missingCategory = 0, missingVibes = 0, badGallery = 0;
    let missingNotifications = 0;

    for (const evt of catalog.events) {
        // Required top-level fields
        FLUTTER_EXPECTATIONS.event_catalog.required.forEach(field => {
            check(`event[${evt.slug}].${field} present`, evt[field] !== undefined, `slug=${evt.slug}`);
        });

        // notifications sub-object
        if (evt.notifications) {
            const n = evt.notifications;
            const hasAll = ['discovery', 'countdown', 'eve', 'day_of'].every(k => n[k] !== undefined);
            if (!hasAll) badNotifFormat++;
        } else {
            missingNotifications++;
        }

        // facts
        if (!evt.facts || evt.facts.length === 0) {
            missingFacts++;
        } else {
            for (const f of evt.facts) {
                if (!f.year || f.year === 0) factsWithNoYear++;
                check(`fact has 'fact' field`, !!f.fact, `slug=${evt.slug}`);
                check(`fact has 'source' field`, f.source !== undefined, `slug=${evt.slug}`);
            }
        }

        // muhurat
        if (!evt.muhurat || !evt.muhurat.puja_time) missingMuhurat++;

        // ritual_steps
        if (!evt.ritual_steps || evt.ritual_steps.length === 0) missingRitualSteps++;
        else {
            for (const step of evt.ritual_steps) {
                check(`ritual_step has order`, step.order !== undefined, `slug=${evt.slug}`);
                check(`ritual_step has title`, !!step.title, `slug=${evt.slug}`);
                check(`ritual_step has items_needed array`, Array.isArray(step.items_needed), `slug=${evt.slug}`);
            }
        }

        // ambient_audio
        if (!evt.ambient_audio) missingAmbientAudio++;
        else {
            FLUTTER_EXPECTATIONS.ambient_audio.required.forEach(field => {
                check(`ambient_audio.${field}`, evt.ambient_audio[field] !== undefined, `slug=${evt.slug}`);
            });
        }

        // category
        if (!evt.category) missingCategory++;
        else {
            check(`category.code`, !!evt.category.code, `slug=${evt.slug}`);
            check(`category.name`, !!evt.category.name, `slug=${evt.slug}`);
            check(`category.icon`, !!evt.category.icon, `slug=${evt.slug}`);
            check(`category.color`, !!evt.category.color, `slug=${evt.slug}`);
        }

        // vibes
        if (!evt.vibes || evt.vibes.length === 0) missingVibes++;

        // image overlay config
        if (evt.image && evt.image.greeting_config) {
            const cfg = evt.image.greeting_config;
            FLUTTER_EXPECTATIONS.overlay_config.required.forEach(field => {
                check(`greeting_config.${field}`, cfg[field] !== undefined, `slug=${evt.slug}`);
            });
        }
    }

    console.log(`  Events: ${catalog.events.length}`);
    console.log(`  ${missingNotifications > 0 ? FAIL : PASS} Missing notifications: ${missingNotifications}`);
    console.log(`  ${badNotifFormat > 0 ? FAIL : PASS} Bad notification format: ${badNotifFormat}`);
    console.log(`  ${missingFacts > 0 ? WARN : PASS} Events with no facts: ${missingFacts}/${catalog.events.length}`);
    console.log(`  ${factsWithNoYear > 0 ? WARN : PASS} Facts with year=0: ${factsWithNoYear}`);
    console.log(`  ${missingMuhurat > 0 ? WARN : PASS} Events missing muhurat: ${missingMuhurat}/${catalog.events.length}`);
    console.log(`  ${missingRitualSteps > 0 ? WARN : PASS} Events missing ritual_steps: ${missingRitualSteps}/${catalog.events.length}`);
    console.log(`  ${missingAmbientAudio > 0 ? WARN : PASS} Events missing ambient_audio: ${missingAmbientAudio}/${catalog.events.length}`);
    console.log(`  ${missingCategory > 0 ? FAIL : PASS} Events missing category: ${missingCategory}`);
    console.log(`  ${missingVibes > 0 ? WARN : PASS} Events missing vibes: ${missingVibes}/${catalog.events.length}`);

    // ── 2. HOME FEED ────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('2. AUDITING: home_feed_en.json');
    console.log('='.repeat(60));
    const feedOutputs = await generateFeedMemory(LANG);
    const feedKey = Object.keys(feedOutputs).find(k => k.includes('home_feed_en'));
    const feed = JSON.parse(feedOutputs[feedKey]);

    FLUTTER_EXPECTATIONS.home_feed.required.forEach(field => {
        const ok = check(`home_feed.${field}`, feed[field] !== undefined, `type: ${typeof feed[field]}`);
        console.log(`  ${ok ? PASS : FAIL} feed.${field}: ${ok ? 'present' : 'MISSING'}`);
    });

    // greetings map validation
    if (feed.greetings && typeof feed.greetings === 'object') {
        FLUTTER_EXPECTATIONS.home_feed_greetings_map.required.forEach(type => {
            const ok = check(`greetings.${type}`, Array.isArray(feed.greetings[type]) && feed.greetings[type].length > 0, `count: ${feed.greetings[type]?.length}`);
            console.log(`  ${ok ? PASS : FAIL} greetings.${type}: ${feed.greetings[type]?.length ?? 0} items`);
        });
    } else {
        console.log(`  ${FAIL} greetings map: MISSING or wrong type`);
    }

    // sections
    console.log(`  ${PASS} sections count: ${feed.sections?.length ?? 0}`);
    for (const section of feed.sections || []) {
        const itemCount = section.items?.length ?? 0;
        console.log(`    ${itemCount > 0 ? PASS : WARN} section[${section.code}] type=${section.type} items=${itemCount}`);
    }

    // ── 3. TAXONOMY ─────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('3. AUDITING: taxonomy_en.json');
    console.log('='.repeat(60));
    const taxKey = Object.keys(feedOutputs).find(k => k.includes('taxonomy_en'));
    const tax = JSON.parse(feedOutputs[taxKey]);
    FLUTTER_EXPECTATIONS.taxonomy.required.forEach(field => {
        const ok = check(`taxonomy.${field}`, Array.isArray(tax[field]) && tax[field].length > 0, `count: ${tax[field]?.length}`);
        console.log(`  ${ok ? PASS : FAIL} taxonomy.${field}: ${tax[field]?.length ?? 0} items`);
    });

    // ── 4. GREETINGS ────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('4. AUDITING: greetings_en.json');
    console.log('='.repeat(60));
    const greetOutputs = await generateGreetingsMemory();
    const greetKey = Object.keys(greetOutputs).find(k => k.includes('en'));
    const greetData = JSON.parse(greetOutputs[greetKey]);
    check('greetings.greetings is array', Array.isArray(greetData.greetings));
    console.log(`  ${PASS} greetings count: ${greetData.greetings?.length ?? 0}`);
    if (greetData.greetings?.length > 0) {
        const sample = greetData.greetings[0];
        FLUTTER_EXPECTATIONS.greetings.item_fields.forEach(field => {
            const ok = check(`greetings[0].${field}`, sample[field] !== undefined);
            console.log(`  ${ok ? PASS : WARN} greetings[0].${field}: ${ok ? 'present' : 'MISSING'}`);
        });
    }

    // ── 5. QUOTES ───────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('5. AUDITING: quotes_en.json');
    console.log('='.repeat(60));
    const quoteOutputs = await generateQuotesMemory();
    const quoteKey = Object.keys(quoteOutputs).find(k => k.includes('en'));
    const quoteData = JSON.parse(quoteOutputs[quoteKey]);
    check('quotes.quotes is array', Array.isArray(quoteData.quotes));
    console.log(`  ${PASS} quotes count: ${quoteData.quotes?.length ?? 0}`);
    if (quoteData.quotes?.length > 0) {
        const sample = quoteData.quotes[0];
        FLUTTER_EXPECTATIONS.quotes.item_fields.forEach(field => {
            const ok = check(`quotes[0].${field}`, sample[field] !== undefined);
            console.log(`  ${ok ? PASS : WARN} quotes[0].${field}: ${ok ? 'present' : 'MISSING'}`);
        });
    }

    // ── 6. MANTRAS ──────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('6. AUDITING: mantras_en.json');
    console.log('='.repeat(60));
    const mantraOutputs = await generateMantrasMemory();
    const mantraKey = Object.keys(mantraOutputs).find(k => k.includes('en'));
    const mantraData = JSON.parse(mantraOutputs[mantraKey]);
    check('mantras.mantras is array', Array.isArray(mantraData.mantras));
    console.log(`  ${PASS} mantras count: ${mantraData.mantras?.length ?? 0}`);
    if (mantraData.mantras?.length > 0) {
        const sample = mantraData.mantras[0];
        FLUTTER_EXPECTATIONS.mantras.item_fields.forEach(field => {
            const ok = check(`mantras[0].${field}`, sample[field] !== undefined);
            console.log(`  ${ok ? PASS : WARN} mantras[0].${field}: ${ok ? 'present' : 'MISSING'}`);
        });
    }

    // ── 7. IMAGES ───────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('7. AUDITING: images_en.json');
    console.log('='.repeat(60));
    const imageOutputs = await generateImagesMemory();
    const imageKey = Object.keys(imageOutputs).find(k => k.includes('en'));
    const imageData = JSON.parse(imageOutputs[imageKey]);
    check('images.images is array', Array.isArray(imageData.images));
    console.log(`  ${PASS} images count: ${imageData.images?.length ?? 0}`);
    if (imageData.images?.length > 0) {
        const sample = imageData.images[0];
        let missingImageFields = [];
        FLUTTER_EXPECTATIONS.images.item_fields.forEach(field => {
            if (sample[field] === undefined) missingImageFields.push(field);
        });
        if (missingImageFields.length === 0) {
            console.log(`  ${PASS} all image fields present`);
        } else {
            console.log(`  ${WARN} missing fields in image sample: ${missingImageFields.join(', ')}`);
        }
        // Check overlay configs
        const imgWithGreetingConfig = imageData.images.find(i => i.greeting_config);
        if (imgWithGreetingConfig) {
            const cfg = imgWithGreetingConfig.greeting_config;
            let missingCfg = FLUTTER_EXPECTATIONS.overlay_config.required.filter(f => cfg[f] === undefined);
            if (missingCfg.length === 0) {
                console.log(`  ${PASS} overlay_config all fields present`);
            } else {
                console.log(`  ${WARN} overlay_config missing: ${missingCfg.join(', ')}`);
            }
        }
    }

    // ── 8. QUIZ ─────────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('8. AUDITING: quiz_en.json');
    console.log('='.repeat(60));
    const quizData = await generateQuizzes(LANG);
    check('quiz has version', !!quizData.version);
    check('quiz has quizzes array', Array.isArray(quizData.quizzes));
    console.log(`  ${PASS} quizzes count: ${quizData.quizzes?.length ?? 0}`);
    if (quizData.quizzes?.length > 0) {
        const q = quizData.quizzes[0];
        ['id', 'title', 'slug', 'description', 'karma_reward', 'questions', 'results'].forEach(field => {
            const ok = check(`quiz[0].${field}`, q[field] !== undefined);
            console.log(`  ${ok ? PASS : WARN} quiz[0].${field}`);
        });
    }

    // ── 9. TRIVIA ───────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('9. AUDITING: trivia_en.json');
    console.log('='.repeat(60));
    const triviaData = await generateTrivia(LANG);
    check('trivia has version', !!triviaData.version);
    check('trivia is array', Array.isArray(triviaData.trivia));
    console.log(`  ${PASS} trivia count: ${triviaData.trivia?.length ?? 0}`);
    if (triviaData.trivia?.length > 0) {
        const t = triviaData.trivia[0];
        ['id', 'question', 'options', 'correct_answer_index', 'karma_reward'].forEach(field => {
            const ok = check(`trivia[0].${field}`, t[field] !== undefined);
            console.log(`  ${ok ? PASS : WARN} trivia[0].${field}`);
        });
    }

    // ── 10. GAMIFICATION ────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('10. AUDITING: gamification_en.json');
    console.log('='.repeat(60));
    const gamData = await generateGamification(LANG);
    check('gamification has version', !!gamData.version);
    ['avatar_tiers', 'trophies'].forEach(field => {
        const ok = check(`gamification.${field}`, Array.isArray(gamData[field]));
        console.log(`  ${ok ? PASS : WARN} gamification.${field}: ${gamData[field]?.length ?? 0} items`);
    });

    // ── 11. SEARCH INDEX ────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('11. AUDITING: search_index.json');
    console.log('='.repeat(60));
    const searchOutputs = await generateSearchIndexMemory();
    const searchKey = Object.keys(searchOutputs).find(k => k.includes('search_index.json'));
    const searchData = JSON.parse(searchOutputs[searchKey]);
    check('search index is array', Array.isArray(searchData));
    console.log(`  ${PASS} search index count: ${searchData?.length ?? 0}`);
    if (searchData?.length > 0) {
        const s = searchData[0];
        ['id', 't', 'c', 'v', 'k', 's', 'i'].forEach(field => {
            const ok = check(`search[0].${field}`, s[field] !== undefined);
            console.log(`  ${ok ? PASS : WARN} search[0].${field} ('${s[field] ? String(s[field]).slice(0, 30) : 'missing'}')`);
        });
    }

    // ── SUMMARY ─────────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('AUDIT SUMMARY');
    console.log('='.repeat(60));
    console.log(`${PASS} Passed checks: ${passes}`);
    console.log(`${issues.length > 0 ? FAIL : PASS} Failed checks: ${issues.length}`);

    if (issues.length > 0) {
        console.log('\nFailed checks:');
        issues.forEach(i => {
            console.log(`  ${FAIL} ${i.label} ${i.detail ? `(${i.detail})` : ''}`);
        });
    } else {
        console.log('\nAll checks passed! 🎉');
    }

    await mongoose.disconnect();
    process.exit(issues.length > 0 ? 1 : 0);
}

auditGeneratorOutput().catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
});
