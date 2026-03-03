/**
 * images.js — Smart one-command image pipeline.
 * 
 * What it does automatically:
 *   1. Scans backend/assets/raw/ for new images
 *   2. Optimizes them with Sharp (WebP + thumbnails) → backend/assets/optimized/
 *   3. Uploads new originals + thumbs to S3 (skips already-uploaded files)
 *   4. Seeds/upserts image records into MongoDB
 * 
 * Run: npm run images     (from backend/)
 * 
 * No mongodump, no full deploy, no PowerShell && issues.
 * Add images to backend/assets/raw/ and just run: npm run images
 */
const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const Image = require('../models/Image');
const Event = require('../models/Event');
const Greeting = require('../models/Greeting');
const Quote = require('../models/Quote');

// ── Config ────────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';
const BUCKET = process.env.AWS_BUCKET_NAME;
const ENV = process.env.DEPLOY_ENV || 'stage';
const BASE = process.env.S3_BASE_PATH || 'Utsav';

const RAW_DIR = path.join(__dirname, '../../assets/raw');
const ORIG_DIR = path.join(__dirname, '../../assets/optimized/original');
const THUMB_DIR = path.join(__dirname, '../../assets/optimized/thumb');
const SUPPORTED = /\.(jpg|jpeg|png|webp|gif)$/i;

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// ── Step 1: Optimize raw images ───────────────────────────────────────────────
const optimizeRaw = async () => {
    await fs.ensureDir(RAW_DIR);
    await fs.ensureDir(ORIG_DIR);
    await fs.ensureDir(THUMB_DIR);

    const files = (await fs.readdir(RAW_DIR)).filter(f => SUPPORTED.test(f));
    if (files.length === 0) {
        console.log('   📂 No raw images to optimize (backend/assets/raw/ is empty)');
        return [];
    }

    const processed = [];
    for (const file of files) {
        const stem = path.parse(file).name;
        const ext = path.parse(file).ext.toLowerCase();
        const isGif = ext === '.gif';

        const origName = isGif ? `${stem}.gif` : `${stem}.webp`;
        const thumbName = isGif ? `${stem}_thumb.gif` : `${stem}_thumb.webp`;
        const origPath = path.join(ORIG_DIR, origName);
        const thumbPath = path.join(THUMB_DIR, thumbName);

        if (await fs.pathExists(origPath)) {
            console.log(`   ⏭️  Already optimized: ${origName}`);
            processed.push({ origName, thumbName, origPath, thumbPath });
            continue;
        }

        console.log(`   ⚙️  Optimizing: ${file}`);
        const src = path.join(RAW_DIR, file);

        if (isGif) {
            await sharp(src, { animated: true }).resize({ width: 1080, withoutEnlargement: true }).toFile(origPath);
            await sharp(src, { animated: true }).resize({ width: 300, withoutEnlargement: true }).toFile(thumbPath);
        } else {
            await sharp(src).resize({ width: 1080, withoutEnlargement: true }).webp({ quality: 82 }).toFile(origPath);
            await sharp(src).resize({ width: 300, withoutEnlargement: true }).webp({ quality: 65 }).toFile(thumbPath);
        }

        processed.push({ origName, thumbName, origPath, thumbPath });
    }

    return processed;
};

// ── Step 2: Upload to S3 (skip already-uploaded) ─────────────────────────────
const uploadFile = async (localPath, s3Key, mimeType) => {
    const body = await fs.readFile(localPath);
    await s3.putObject({
        Bucket: BUCKET,
        Key: s3Key,
        Body: body,
        ContentType: mimeType,
        CacheControl: 'max-age=31536000'
    }).promise();
};

const uploadToS3 = async (processed) => {
    let uploaded = 0, skipped = 0;

    for (const { origName, thumbName, origPath, thumbPath } of processed) {
        const isGif = origName.endsWith('.gif');
        const mime = isGif ? 'image/gif' : 'image/webp';

        const origKey = `${BASE}/${ENV}/image/original/${origName}`;
        const thumbKey = `${BASE}/${ENV}/image/thumb/${thumbName}`;

        // Check if already on S3 via DB flag
        const existingOrig = await Image.findOne({ s3_key: origKey, is_s3_uploaded: true });
        if (existingOrig) {
            console.log(`   ⏭️  Already on S3: ${origName}`);
            skipped++;
            continue;
        }

        console.log(`   ☁️  Uploading → S3: ${origName}`);
        await uploadFile(origPath, origKey, mime);

        // Upload thumbnail if it exists
        if (await fs.pathExists(thumbPath)) {
            await uploadFile(thumbPath, thumbKey, mime);
        }

        // Mark uploaded in DB if record exists
        await Image.updateOne({ s3_key: origKey }, { $set: { is_s3_uploaded: true } });
        uploaded++;
    }

    return { uploaded, skipped };
};

// ── Step 3: Seed / upsert S3 images into MongoDB ─────────────────────────────
const scanAndSeed = async () => {
    let continuationToken;
    const s3Files = [];

    do {
        const res = await s3.listObjectsV2({
            Bucket: BUCKET,
            Prefix: `${BASE}/${ENV}/image/original/`,
            ContinuationToken: continuationToken
        }).promise();
        s3Files.push(...(res.Contents || []));
        continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (continuationToken);

    const validFiles = s3Files
        .map(o => o.Key)
        .filter(k => /\.(webp|gif|png|jpg|jpeg)$/i.test(k));

    const [events, greetings, quotes] = await Promise.all([
        Event.find({}),
        Greeting.find({ event_id: { $exists: true, $ne: null } }),
        Quote.find({ event_id: { $exists: true, $ne: null } })
    ]);

    // Build lookup maps: eventId -> first matching greeting/quote
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

    let seeded = 0, updated = 0;
    for (const s3Key of validFiles) {
        const filename = path.basename(s3Key);
        const existing = await Image.findOne({ s3_key: s3Key });

        if (existing) {
            // Update s3 flag. Also update greeting/quote links if now available.
            const stem = path.parse(filename).name.replace(/-\d{4}$/, '').replace(/_\d+$/, '');
            const matchedEvent = events.find(e => e.slug && (e.slug === stem || stem.startsWith(e.slug)));
            const eid = matchedEvent?._id?.toString();

            const patch = { is_s3_uploaded: true };
            if (eid && greetingByEvent[eid] && !existing.greeting_id) patch.greeting_id = greetingByEvent[eid];
            if (eid && quoteByEvent[eid] && !existing.quote_id) patch.quote_id = quoteByEvent[eid];
            if (matchedEvent && !existing.event_id) patch.event_id = matchedEvent._id;

            await Image.updateOne({ s3_key: s3Key }, { $set: patch });
            updated++;
        } else {
            // Try to match to an event by filename stem
            const stem = path.parse(filename).name.replace(/-\d{4}$/, '').replace(/_\d+$/, '');
            const matchedEvent = events.find(e => e.slug && (e.slug === stem || stem.startsWith(e.slug)));
            const eid = matchedEvent?._id?.toString();

            await Image.create({
                filename,
                s3_key: s3Key,
                caption: `${matchedEvent ? matchedEvent.title : 'Festival'} Image`,
                share_text: 'Sharing with love! #Utsav',
                media_type: filename.endsWith('.gif') ? 'gif' : 'image',
                is_optimized: true,
                is_s3_uploaded: true,
                is_standalone: !matchedEvent,
                event_id: matchedEvent ? matchedEvent._id : undefined,
                greeting_id: eid && greetingByEvent[eid] ? greetingByEvent[eid] : undefined,
                quote_id: eid && quoteByEvent[eid] ? quoteByEvent[eid] : undefined,
                credits: 'Utsav Pro',
                dominant_colors: ['#000000']
            });
            seeded++;
            console.log(`   🌱 Seeded: ${filename}${eid && greetingByEvent[eid] ? ' (+ greeting)' : ''}${eid && quoteByEvent[eid] ? ' (+ quote)' : ''}`);
        }
    }

    return { seeded, updated, total: seeded + updated };
};

// ── Main ───────────────────────────────────────────────────────────────────────
const run = async () => {
    console.log('\n🚀 Utsav Image Pipeline\n');

    await mongoose.connect(MONGO_URI);
    console.log('🔌 MongoDB Connected\n');

    // Step 1 — Optimize
    console.log('📸 Step 1: Optimizing raw images...');
    const processed = await optimizeRaw();
    console.log(`   ✅ ${processed.length} image(s) ready\n`);

    // Step 2 — Upload to S3
    if (!BUCKET || !process.env.AWS_ACCESS_KEY_ID) {
        console.warn('⚠️  Skipping S3 upload — AWS credentials not set in .env');
    } else {
        console.log('☁️  Step 2: Uploading to S3...');
        const { uploaded, skipped } = await uploadToS3(processed);
        console.log(`   ✅ Uploaded: ${uploaded}, Skipped (already on S3): ${skipped}\n`);
    }

    // Step 3 — Seed MongoDB
    console.log('🌱 Step 3: Syncing S3 → MongoDB...');
    const { seeded, updated, total } = await scanAndSeed();
    console.log(`   ✅ New: ${seeded}, Updated: ${updated}, Total in DB: ${total}\n`);

    console.log('🎉 Done! Run `npm run health` to see the full status.\n');
    process.exit(0);
};

run().catch(err => {
    console.error('\n❌ Pipeline failed:', err.message);
    console.error(err);
    process.exit(1);
});
