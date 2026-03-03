const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const Event = require('../models/Event');
const Greeting = require('../models/Greeting');
const Quote = require('../models/Quote');
const Image = require('../models/Image');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const env = process.env.DEPLOY_ENV || 'stage';
const base = process.env.S3_BASE_PATH || 'Utsav';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// ── Fetch all .webp / .gif files from S3 ──────────────────────────────────────
const fetchS3Files = async () => {
    const prefix = `${base}/${env}/image/original/`;
    console.log(`\n📦 Scanning S3: s3://${BUCKET_NAME}/${prefix}`);

    let files = [];
    let continuationToken;

    do {
        const params = { Bucket: BUCKET_NAME, Prefix: prefix, ContinuationToken: continuationToken };
        const data = await s3.listObjectsV2(params).promise();
        files = files.concat(data.Contents || []);
        continuationToken = data.IsTruncated ? data.NextContinuationToken : undefined;
    } while (continuationToken);

    const fileNames = files
        .map(obj => obj.Key.replace(prefix, ''))
        .filter(f => f.length > 0 && f.match(/\.(webp|gif|png|jpg|jpeg)$/i));

    console.log(`   ✅ Found ${fileNames.length} image files`);
    return fileNames;
};

// ── Match a filename to an Event by slug ──────────────────────────────────────
const slugAliases = {
    'navratri-2026': ['durga-puja-2026', 'dussehra-2026'],
    'diwali-2026': ['deepavali-2026'],
    'lohri-makar-sankranti-2026': ['lohri-sankranti-pongal-2026'],
    'easter-2026': ['easter-good-friday-2026'],
    'republic-day-2026': ['republic-independence-day-2026'],
    'independence-day-2026': ['republic-independence-day-2026'],
    'valentines-day-2026': ['valentine-day-2026']
};

const matchEvent = (file, events) => {
    const lastUnder = file.lastIndexOf('_');
    const matchName = (lastUnder !== -1 ? file.substring(0, lastUnder) : file.split('.')[0])
        .replace(/^seed_\d+_/, '');  // strip seed prefix if present

    let match = events.find(e => e.slug === matchName);
    if (!match) {
        match = events.find(e =>
            e.slug && slugAliases[e.slug] && slugAliases[e.slug].includes(matchName)
        );
    }
    if (!match) {
        match = events.find(e => e.slug && e.slug.includes(matchName.replace('-2026', '')));
    }
    return match || null;
};

// ── Build an image payload ─────────────────────────────────────────────────────
const captions = ['Beautiful', 'Amazing', 'Stunning', 'Vibrant', 'Peaceful', 'Happy', 'Divine', 'Auspicious'];
const sCats = ['morning', 'spiritual', 'motivational', 'nature', 'gratitude', 'evening', 'weekend'];

const buildPayload = (file, index, matchedEvent, greetings, quotes, greetingByEvent, quoteByEvent) => {
    const isStandalone = !matchedEvent;
    const adj = captions[index % captions.length];
    const textColor = Math.random() > 0.5 ? '#1A1A1A' : '#FFFFFF';
    const eid = matchedEvent?._id?.toString();

    // Prefer event-matched greeting/quote, fall back to a random one
    const matchedGreetingId = eid && greetingByEvent[eid]
        ? greetingByEvent[eid]
        : (greetings.length > 0 ? greetings[index % greetings.length]._id : null);
    const matchedQuoteId = eid && quoteByEvent[eid]
        ? quoteByEvent[eid]
        : (quotes.length > 0 ? quotes[index % quotes.length]._id : null);

    const img = {
        filename: file,
        s3_key: `${base}/${env}/image/original/${file}`,
        caption: `${adj} ${matchedEvent ? matchedEvent.title : 'Festival'} Image`,
        share_text: `Wishing you a ${adj.toLowerCase()} day! #Utsav`,
        media_type: file.match(/\.gif$/i) ? 'gif' : 'image',
        is_optimized: true,
        is_s3_uploaded: true,
        credits: 'Utsav Pro',
        is_standalone: isStandalone,
        has_overlay: !!matchedGreetingId || !!matchedQuoteId, // overlay only if we have content
        show_watermark: true,
        dominant_colors: ['#000000'],
        greeting_id: matchedGreetingId || undefined,
        quote_id: matchedQuoteId || undefined,
    };

    if (!isStandalone) img.event_id = matchedEvent._id;
    else img.standalone_category = sCats[index % sCats.length];

    if (matchedGreetingId) {
        img.greeting_config = { position: 'bottom', font_size: 24, color: textColor, shadow: textColor === '#FFFFFF', glass_bg: true, glass_opacity: 0.25, padding: 16 };
    }
    if (matchedQuoteId) {
        img.quote_config = { position: 'top', font_size: 18, color: '#FFFFFF', shadow: true, glass_bg: false, padding: 12 };
    }

    return img;
};

// ── Main ───────────────────────────────────────────────────────────────────────
const seedImages = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🔌 MongoDB Connected\n');

        // Load reference data
        const [events, allGreetings, allQuotes] = await Promise.all([
            Event.find({}),
            Greeting.find({}),
            Quote.find({})
        ]);
        // Only greetings/quotes with an explicit event link
        const greetings = allGreetings.filter(g => g.event_id);
        const quotes = allQuotes.filter(q => q.event_id);
        console.log(`📋 Loaded: ${events.length} events, ${allGreetings.length} greetings, ${allQuotes.length} quotes`);

        // Event → greeting/quote lookup maps
        const greetingByEvent = {};
        const quoteByEvent = {};
        for (const g of greetings) {
            const eid = g.event_id?.toString();
            if (eid && !greetingByEvent[eid]) greetingByEvent[eid] = g._id;
        }
        for (const q of quotes) {
            const eid = q.event_id?.toString();
            if (eid && !quoteByEvent[eid]) quoteByEvent[eid] = q._id;
        }

        // Get S3 files
        const validFiles = await fetchS3Files();
        if (validFiles.length === 0) {
            console.warn('\n⚠️  No images found in S3. Did you upload images first? Check your AWS credentials and S3_BASE_PATH.');
            process.exit(0);
        }

        // Upsert each image (SAFE — never deletes existing admin edits)
        let seeded = 0;
        let skipped = 0;

        for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];
            const existing = await Image.findOne({ filename: file });

            if (existing) {
                // Preserve admin edits — only update s3 key + fill in missing greeting/quote links
                const matchedEvent = matchEvent(file, events);
                const eid = matchedEvent?._id?.toString();
                const patch = {
                    s3_key: `${base}/${env}/image/original/${file}`,
                    is_s3_uploaded: true
                };
                // Only fill in greeting/quote if admin hasn't set one yet
                if (!existing.greeting_id && eid && greetingByEvent[eid]) patch.greeting_id = greetingByEvent[eid];
                if (!existing.quote_id && eid && quoteByEvent[eid]) patch.quote_id = quoteByEvent[eid];
                if (!existing.event_id && matchedEvent) patch.event_id = matchedEvent._id;

                await Image.findByIdAndUpdate(existing._id, patch);
                skipped++;
            } else {
                const matchedEvent = matchEvent(file, events);
                const payload = buildPayload(file, i, matchedEvent, allGreetings, allQuotes, greetingByEvent, quoteByEvent);
                await Image.create(payload);
                seeded++;
            }
        }

        console.log(`\n✅ Seed complete!`);
        console.log(`   🆕 New images seeded: ${seeded}`);
        console.log(`   ♻️  Existing images updated (with greeting/quote links if missing): ${skipped}`);
        console.log(`   📊 Total in DB: ${seeded + skipped}`);

        process.exit(0);
    } catch (err) {
        console.error('\n❌ Seed failed:', err.message);
        if (err.message.includes('InvalidAccessKeyId') || err.message.includes('SignatureDoesNotMatch')) {
            console.error('   → Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in backend/.env');
        }
        process.exit(1);
    }
};

seedImages();
