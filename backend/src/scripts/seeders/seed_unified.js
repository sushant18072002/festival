/**
 * seed_unified.js — Master database seeder for Utsav Pro
 * Run: npm run seed (from backend/)
 * 
 * Replaces:
 * - seed_taxonomy.js
 * - seed_events.js
 * - seed_quotes.js
 * - seed_greetings.js
 * - seed_mantras.js
 * - seed_images.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const AWS = require('aws-sdk');

// Models
const Category = require('../../models/Category');
const Tag = require('../../models/Tag');
const Vibe = require('../../models/Vibe');
const Event = require('../../models/Event');
const Quote = require('../../models/Quote');
const Greeting = require('../../models/Greeting');
const Mantra = require('../../models/Mantra');
const Image = require('../../models/Image');
const LottieOverlay = require('../../models/LottieOverlay');
const GamificationConfig = require('../../models/GamificationConfig');
const Trivia = require('../../models/Trivia');
const AmbientAudio = require('../../models/AmbientAudio');

// Data sources
const eventData = require('../../../data/events_2026.json');
const quoteData = require('../../../data/quotes.json');
const greetingData = require('../../../data/greetings.json');
const mantraData = require('../../../data/mantras_seed.json');
const ambientAudioData = require('../../../data/ambient_audio_seed.json');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';

// S3 config for Images
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const env = process.env.DEPLOY_ENV || 'stage';
const base = process.env.S3_BASE_PATH || 'Utsav';
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Taxonomy Data
const STATIC_CATEGORIES = [
    { code: 'festival', translations: { en: { name: 'Festival' }, hi: { name: 'त्योहार' } }, icon: 'Sparkles', color: 'purple' },
    { code: 'national', translations: { en: { name: 'National' }, hi: { name: 'राष्ट्रीय' } }, icon: 'Flag', color: 'orange' },
    { code: 'religious', translations: { en: { name: 'Religious' }, hi: { name: 'धार्मिक' } }, icon: 'Om', color: 'red' },
    { code: 'regional', translations: { en: { name: 'Regional' }, hi: { name: 'क्षेत्रीय' } }, icon: 'MapPin', color: 'teal' },
    { code: 'international', translations: { en: { name: 'International' }, hi: { name: 'अंतरराष्ट्रीय' } }, icon: 'Globe', color: 'blue' }
];

const STATIC_TAGS = [
    { code: 'lights', translations: { en: { name: 'Lights' }, hi: { name: 'रोशनी' } } },
    { code: 'colors', translations: { en: { name: 'Colors' }, hi: { name: 'रंग' } } },
    { code: 'freedom', translations: { en: { name: 'Freedom' }, hi: { name: 'आजादी' } } }
];

const STATIC_VIBES = [
    { code: 'spiritual', icon: 'Sparkles', color: '#8b5cf6', translations: { en: { name: 'Spiritual' }, hi: { name: 'आध्यात्मिक' } } },
    { code: 'joyful', icon: 'PartyPopper', color: '#f59e0b', translations: { en: { name: 'Joyful' }, hi: { name: 'हर्षित' } } },
    { code: 'patriotic', icon: 'Flag', color: '#10b981', translations: { en: { name: 'Patriotic' }, hi: { name: 'देशभक्ति' } } },
    { code: 'cultural', icon: 'Music', color: '#ec4899', translations: { en: { name: 'Cultural' }, hi: { name: 'सांस्कृतिक' } } },
    { code: 'solemn', icon: 'Moon', color: '#64748b', translations: { en: { name: 'Solemn' }, hi: { name: 'गंभीर' } } },
    { code: 'romantic', icon: 'Heart', color: '#ec4899', translations: { en: { name: 'Love' }, hi: { name: 'प्रेम' } } },
    { code: 'morning', icon: 'Sunrise', color: '#0ea5e9', translations: { en: { name: 'Morning' }, hi: { name: 'सुबह' } } }
];

// Helper: Fetch S3 images
const fetchS3Files = async () => {
    const prefix = `${base}/${env}/image/original/`;
    let files = [];
    let token;
    do {
        const data = await s3.listObjectsV2({ Bucket: BUCKET_NAME, Prefix: prefix, ContinuationToken: token }).promise();
        files = files.concat(data.Contents || []);
        token = data.IsTruncated ? data.NextContinuationToken : undefined;
    } while (token);
    return files.map(obj => obj.Key.replace(prefix, '')).filter(f => f.match(/\.(webp|gif|png|jpg|jpeg)$/i));
};

const slugAliases = {
    'navratri-2026': ['durga-puja-2026', 'dussehra-2026'],
    'diwali-2026': ['deepavali-2026'],
    'lohri-makar-sankranti-2026': ['lohri-sankranti-pongal-2026'],
    'easter-2026': ['easter-good-friday-2026'],
    'republic-day-2026': ['republic-independence-day-2026'],
    'independence-day-2026': ['republic-independence-day-2026'],
    'valentines-day-2026': ['valentine-day-2026'],

    // Unmapped Image fixes
    'world-environment-day-2026': ['earth-day-environment-day-2026'],
    'womens-day-2026': ['international-womens-day-2026'],
    'mothers-day-2026': ['mothers-fathers-day-2026'],
    'fathers-day-2026': ['mothers-fathers-day-2026'],
    'muharram-ashura-2026': ['muharram-2026'],
    'ramadan-start-2026': ['ramadan-2026'],
    'world-cancer-day-2026': ['world-cancer-day-2026'] // Keep mapped even if event is temporarily missing
};

const matchEvent = (filename, activeEvents) => {
    // Expected filename start: 'seed_2_holi-2026_...' -> core: 'holi-2026'
    // Alternatively: 'holi_...' -> core: 'holi'
    let core = filename.split('_')[0];
    if (filename.startsWith('seed_')) {
        // e.g. seed_2_holi-2026_01.webp -> split by _ gives ['seed', '2', 'holi-2026', '01.webp']
        const parts = filename.split('_');
        if (parts.length > 2) {
            core = parts[2].replace(/\.[^/.]+$/, "");
        }
    } else {
        core = core.replace(/\.[^/.]+$/, "");
    }

    let match = activeEvents.find(e => e.slug === core);
    if (!match) match = activeEvents.find(e => e.slug && slugAliases[e.slug]?.includes(core));

    // Fallback: strip -2026 and try exact match against slug stripped of -2026
    if (!match) {
        const strippedCore = core.replace(/-2026$/, '');
        match = activeEvents.find(e => {
            if (!e.slug) return false;
            const strippedSlug = e.slug.replace(/-2026$/, '');
            return strippedSlug === strippedCore;
        });
    }

    return match || null;
};

// Main Seed Function
async function seedAll() {
    let stats = { cats: 0, tags: 0, vibes: 0, events: 0, quotes: 0, greetings: 0, mantras: 0, images: 0, audio: 0 };

    try {
        await mongoose.connect(MONGO_URI);
        console.log('🔌 MongoDB Connected');
        console.log('🚀 Starting Unified Seeding Pipeline...\n');

        // --- PHASE 1: Taxonomy ---
        console.log('1️⃣  Deploying Taxonomy...');
        for (const cat of STATIC_CATEGORIES) { await Category.findOneAndUpdate({ code: cat.code }, cat, { upsert: true }); stats.cats++; }
        for (const tag of STATIC_TAGS) { await Tag.findOneAndUpdate({ code: tag.code }, tag, { upsert: true }); stats.tags++; }
        for (const vibe of STATIC_VIBES) { await Vibe.findOneAndUpdate({ code: vibe.code }, vibe, { upsert: true }); stats.vibes++; }

        const catMap = Object.fromEntries((await Category.find()).map(i => [i.code, i._id]));
        const tagMap = Object.fromEntries((await Tag.find()).map(i => [i.code, i._id]));
        const vibeMap = Object.fromEntries((await Vibe.find()).map(i => [i.code, i._id]));

        // --- PHASE 2: Ambient Audio ---
        console.log('\n2️⃣  Deploying Ambient Audio...');
        for (const audio of ambientAudioData) {
            await AmbientAudio.findOneAndUpdate(
                { slug: audio.slug },
                { $set: audio },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            stats.audio++;
        }
        const audioMap = Object.fromEntries((await AmbientAudio.find()).map(i => [i.slug, i._id]));

        // --- PHASE 3: Events ---
        console.log('\n3️⃣  Deploying Events...');
        // Clear old event relationships before remaps
        await Event.updateMany({}, { $set: { quotes: [], greetings: [], mantras: [], images: [], ambient_audio: null } });

        for (const ev of eventData) {
            const rawCat = (ev.category || 'festival').toLowerCase();
            const catResolve = rawCat.includes('religious') ? 'religious' : (rawCat.includes('national') ? 'national' : 'festival');

            const eventPayload = {
                ...ev,
                category: catMap[catResolve],
                date: (ev.dates && ev.dates.length > 0) ? new Date(ev.dates[0].date) : new Date(),
                tags: (ev.tags || []).map(t => tagMap[t.toLowerCase()]).filter(Boolean),
                vibes: (ev.vibes || []).map(v => vibeMap[v]).filter(Boolean),
                ambient_audio: ev.ambient_audio_slug ? audioMap[ev.ambient_audio_slug] : null
            };

            // Process lottie_overlay if it exists
            if (eventPayload.lottie_overlay && typeof eventPayload.lottie_overlay === 'object') {
                const overlayData = eventPayload.lottie_overlay;
                const overlayDoc = await LottieOverlay.findOneAndUpdate(
                    { filename: overlayData.filename },
                    { $set: overlayData },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                eventPayload.lottie_overlay = overlayDoc._id; // Map Object ID for the Event schema
            }

            await Event.findOneAndUpdate({ slug: ev.slug }, { $set: eventPayload }, { upsert: true });
            stats.events++;
        }
        const eventMap = Object.fromEntries((await Event.find()).map(i => [i.slug, i._id]));

        // --- PHASE 4: Wisdom & Wishes ---
        console.log('\n4️⃣  Deploying Wisdom & Wishes (Quotes, Mantras, Greetings)...');

        // Quotes
        for (const q of quoteData) {
            const payload = {
                ...q,
                category: catMap[q.category] || null,
                tags: (q.tags || []).map(t => tagMap[t]).filter(Boolean),
                vibes: (q.vibes || []).map(v => vibeMap[v]).filter(Boolean)
            };
            const doc = await Quote.findOneAndUpdate({ slug: q.slug }, { $set: payload }, { upsert: true, new: true, setDefaultsOnInsert: true });
            stats.quotes++;
            if (q.event_slug && eventMap[q.event_slug]) {
                await Event.findByIdAndUpdate(eventMap[q.event_slug], { $addToSet: { quotes: doc._id } });
            }
        }

        // Mantras
        for (const m of mantraData) {
            const payload = {
                ...m,
                category: catMap[m.category] || null,
                tags: (m.tags || []).map(t => tagMap[t]).filter(Boolean),
                vibes: (m.vibes || []).map(v => vibeMap[v]).filter(Boolean)
            };
            const doc = await Mantra.findOneAndUpdate({ slug: m.slug }, { $set: payload }, { upsert: true, new: true, setDefaultsOnInsert: true });
            stats.mantras++;
            if (m.event_slug && eventMap[m.event_slug]) {
                await Event.findByIdAndUpdate(eventMap[m.event_slug], { $addToSet: { mantras: doc._id } });
            }
        }

        // Greetings
        for (const g of greetingData) {
            const payload = {
                ...g,
                category: catMap[g.category] || null,
                tags: (g.tags || []).map(t => tagMap[t]).filter(Boolean),
                vibes: (g.vibes || []).map(v => vibeMap[v]).filter(Boolean)
            };
            const filter = g.slug ? { slug: g.slug } : { text: g.text };
            const doc = await Greeting.findOneAndUpdate(filter, { $set: payload }, { upsert: true, new: true, setDefaultsOnInsert: true });
            stats.greetings++;
            if (g.event_slug && eventMap[g.event_slug]) {
                await Event.findByIdAndUpdate(eventMap[g.event_slug], { $addToSet: { greetings: doc._id } });
            }
        }

        // --- PHASE 4: Images from S3 ---
        console.log('\n4️⃣  Discovering and Linking Images from S3...');
        const s3Files = await fetchS3Files();
        const activeEvents = await Event.find({}).lean();

        const captions = ['Beautiful', 'Amazing', 'Stunning', 'Vibrant', 'Peaceful', 'Happy', 'Divine', 'Auspicious'];

        for (let i = 0; i < s3Files.length; i++) {
            const file = s3Files[i];
            const matchedEvent = matchEvent(file, activeEvents);
            const isStandalone = !matchedEvent;
            const adj = captions[i % captions.length];

            // Randomly link a greeting/quote to demonstrate Many-to-Many overlay logic
            let greeting_id = null;
            let quote_id = null;
            if (matchedEvent && matchedEvent.greetings?.length > 0 && i % 2 === 0) {
                greeting_id = matchedEvent.greetings[0];
            } else if (matchedEvent && matchedEvent.quotes?.length > 0 && i % 3 === 0) {
                quote_id = matchedEvent.quotes[0];
            }

            // Propagate taxonomy from the Event down to the Image natively
            let categories = [];
            let tags = [];
            let vibes = [];

            if (matchedEvent) {
                if (matchedEvent.category) categories.push(matchedEvent.category);
                if (Array.isArray(matchedEvent.tags)) tags = [...matchedEvent.tags];
                if (Array.isArray(matchedEvent.vibes)) vibes = [...matchedEvent.vibes];
            }

            const imgPayload = {
                filename: file,
                s3_key: `${base}/${env}/image/original/${file}`,
                caption: `${adj} ${matchedEvent ? matchedEvent.title : 'Festival'} Image`,
                share_text: `Wishing you a ${adj.toLowerCase()} day! #Utsav`,
                media_type: file.match(/\.gif$/i) ? 'gif' : 'image',
                is_optimized: true,
                is_s3_uploaded: true,
                credits: 'Utsav Pro',
                categories: categories,
                tags: tags,
                vibes: vibes,
                is_standalone: isStandalone,
                has_overlay: !!greeting_id || !!quote_id,
                greeting_id: greeting_id,
                quote_id: quote_id,
                greeting_config: greeting_id ? { font_size: 24, font_weight: 700, position: 'bottom', color: '#FFFFFF', padding: 16 } : null,
                quote_config: quote_id ? { font_size: 18, font_weight: 400, position: 'center', color: '#FFFFFF', glass_bg: true } : null
            };

            const doc = await Image.findOneAndUpdate(
                { s3_key: imgPayload.s3_key },
                { $set: imgPayload },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            stats.images++;

            // Vital Step: Push Image into Event's many-to-many array
            if (matchedEvent) {
                await Event.findByIdAndUpdate(matchedEvent._id, { $addToSet: { images: doc._id } });
            }
        }

        // --- 7. Seed Gamification Config & Trivia ---
        const triviaQ = {
            question: "Which festival is known as the 'Festival of Colors'?",
            options: ["Diwali", "Holi", "Navratri", "Pongal"],
            correctAnswerIndex: 1, karmaReward: 10, tags: ["holi", "colors", "spring"]
        };
        const triviaExists = await Trivia.findOne({ question: triviaQ.question });
        if (!triviaExists) { await Trivia.create(triviaQ); console.log('✅ Trivia seeded.'); }

        const gamificationData = {
            version: 1, isActive: true,
            avatarTiers: [
                { name: '🌱 Seedling (Starter)', baseKarma: 0, paths: ['assets/icon/avatar_tier1_1.png', 'assets/icon/avatar_tier1_2.png', 'assets/icon/avatar_tier1_3.png', 'assets/icon/avatar_tier1_4.png', 'assets/icon/avatar_tier1_5.png'] },
                { name: '🕯️ Diya Lighter', baseKarma: 30, paths: ['assets/icon/avatar_tier2_1.png', 'assets/icon/avatar_tier2_2.png', 'assets/icon/avatar_tier2_3.png', 'assets/icon/avatar_tier2_4.png', 'assets/icon/avatar_tier2_5.png'] },
                { name: '🌸 Festive Guide', baseKarma: 100, paths: ['assets/icon/avatar_tier3_1.png', 'assets/icon/avatar_tier3_2.png', 'assets/icon/avatar_tier3_3.png', 'assets/icon/avatar_tier3_4.png', 'assets/icon/avatar_tier3_5.png'] },
                { name: '🌳 Vibe Seeker', baseKarma: 250, paths: ['assets/icon/avatar_tier4_1.png', 'assets/icon/avatar_tier4_2.png', 'assets/icon/avatar_tier4_3.png', 'assets/icon/avatar_tier4_4.png', 'assets/icon/avatar_tier4_5.png'] },
                { name: '✨ Utsav Master', baseKarma: 500, paths: ['assets/icon/avatar_tier5_1.png', 'assets/icon/avatar_tier5_2.png', 'assets/icon/avatar_tier5_3.png', 'assets/icon/avatar_tier5_4.png', 'assets/icon/avatar_tier5_5.png'] }
            ],
            trophies: [
                { name: 'Beginner Seeker', icon: '🌱', description: 'Joined Utsav', unlockRuleType: 'signup', unlockThreshold: 0 },
                { name: 'Festival Explorer', icon: '🗺️', description: 'Explore 5 festivals', unlockRuleType: 'explore', unlockThreshold: 5 },
                { name: 'Vibe Master', icon: '✨', description: 'Discover 10 vibes', unlockRuleType: 'explore', unlockThreshold: 10 },
                { name: 'Cultural Guru', icon: '📚', description: 'Reach 500 Karma', unlockRuleType: 'karma', unlockThreshold: 500 },
                { name: 'Social Butterfly', icon: '🦋', description: 'Share 10 images', unlockRuleType: 'share', unlockThreshold: 10 },
                { name: 'Unbreakable', icon: '🔥', description: '30-day streak', unlockRuleType: 'streak', unlockThreshold: 30 },
                { name: 'Night Owl', icon: '🦉', description: 'Explore at midnight', unlockRuleType: 'time', unlockThreshold: 2300 },
                { name: 'Early Bird', icon: '🌅', description: 'Explore at dawn', unlockRuleType: 'time', unlockThreshold: 400 }
            ]
        };
        const configExists = await GamificationConfig.findOne({ version: 1 });
        if (!configExists) {
            await GamificationConfig.create(gamificationData);
        } else {
            await GamificationConfig.updateOne({ version: 1 }, gamificationData);
        }
        console.log('✅ Gamification config seeded/updated.');

        console.log('\n✅ UNIFIED PIPELINE COMPLETE!');
        console.table({
            Categories: stats.cats,
            Tags: stats.tags,
            Vibes: stats.vibes,
            Events: stats.events,
            Quotes: stats.quotes,
            Mantras: stats.mantras,
            Greetings: stats.greetings,
            Images: stats.images
        });

        process.exit(0);
    } catch (err) {
        console.error('❌ SEED PIPELINE FAILED:', err);
        process.exit(1);
    }
}

seedAll();
