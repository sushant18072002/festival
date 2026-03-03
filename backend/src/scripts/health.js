/**
 * health.js — Checks the health of the full pipeline: DB counts, S3 counts, JSON feed freshness.
 * Run: npm run health (from backend/)
 * 
 * Outputs:
 *   - MongoDB collection counts
 *   - S3 image counts (original, thumb)
 *   - Sync status: images in DB vs S3
 *   - Last deploy time from SystemState
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const BUCKET = process.env.AWS_BUCKET_NAME;
const ENV = process.env.DEPLOY_ENV || 'stage';
const BASE = process.env.S3_BASE_PATH || 'Utsav';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';

const countS3Objects = async (prefix) => {
    let total = 0, token;
    do {
        const res = await s3.listObjectsV2({ Bucket: BUCKET, Prefix: prefix, ContinuationToken: token }).promise();
        total += (res.Contents || []).length;
        token = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (token);
    return total;
};

const statusIcon = (ok) => ok ? '✅' : '❌';
const warnIcon = (ok) => ok ? '✅' : '⚠️ ';

const health = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        // ── DB Counts ─────────────────────────────────────────────────────────
        const db = mongoose.connection.db;
        const [events, images, greetings, quotes, mantras, categories, tags, vibes] = await Promise.all([
            db.collection('events').countDocuments({ is_deleted: { $ne: true } }),
            db.collection('images').countDocuments({ is_deleted: { $ne: true } }),
            db.collection('greetings').countDocuments({ is_deleted: { $ne: true } }),
            db.collection('quotes').countDocuments({ is_deleted: { $ne: true } }),
            db.collection('mantras').countDocuments({ is_deleted: { $ne: true } }),
            db.collection('categories').countDocuments({}),
            db.collection('tags').countDocuments({}),
            db.collection('vibes').countDocuments({})
        ]);

        const imagesUploaded = await db.collection('images').countDocuments({ is_s3_uploaded: true });

        // ── S3 Counts ─────────────────────────────────────────────────────────
        let s3Original = 0, s3Thumb = 0;
        try {
            [s3Original, s3Thumb] = await Promise.all([
                countS3Objects(`${BASE}/${ENV}/image/original/`),
                countS3Objects(`${BASE}/${ENV}/image/thumb/`)
            ]);
        } catch (e) {
            console.warn('  ⚠️  Could not reach S3:', e.message);
        }

        // ── SystemState ───────────────────────────────────────────────────────
        let lastDeploy = 'Never', lastFeed = 'Never';
        try {
            const state = await db.collection('systemstates').findOne({ key: 'main' });
            if (state) {
                lastDeploy = state.last_deployed_at ? new Date(state.last_deployed_at).toLocaleString() : 'Never';
                lastFeed = state.last_feed_generated_at ? new Date(state.last_feed_generated_at).toLocaleString() : 'Never';
            }
        } catch (e) { /* ignore */ }

        // ── Report ────────────────────────────────────────────────────────────
        console.log('\n╔══════════════════════════════════════════════════╗');
        console.log('║           🏥  UTSAV BACKEND HEALTH CHECK          ║');
        console.log('╠══════════════════════════════════════════════════╣');
        console.log('║  DATABASE                                         ║');
        console.log(`║  ${statusIcon(events > 0)} Events:       ${String(events).padEnd(4)} (active)              ║`);
        console.log(`║  ${statusIcon(images > 0)} Images:       ${String(images).padEnd(4)} (active, ${imagesUploaded} on S3)      ║`);
        console.log(`║  ${statusIcon(greetings > 0)} Greetings:   ${String(greetings).padEnd(4)}                          ║`);
        console.log(`║  ${statusIcon(quotes > 0)} Quotes:      ${String(quotes).padEnd(4)}                          ║`);
        console.log(`║  ${statusIcon(mantras > 0)} Mantras:     ${String(mantras).padEnd(4)}                          ║`);
        console.log(`║  ${statusIcon(categories > 0)} Categories:  ${String(categories).padEnd(4)}                          ║`);
        console.log(`║  ${warnIcon(tags > 0)} Tags:        ${String(tags).padEnd(4)}                          ║`);
        console.log(`║  ${warnIcon(vibes > 0)} Vibes:       ${String(vibes).padEnd(4)}                          ║`);
        console.log('╠══════════════════════════════════════════════════╣');
        console.log('║  S3 STORAGE                                       ║');
        console.log(`║  ${statusIcon(s3Original > 0)} Originals:   ${String(s3Original).padEnd(4)} in ${BASE}/${ENV}/image/original/  ║`);
        console.log(`║  ${warnIcon(s3Thumb > 0)} Thumbnails:  ${String(s3Thumb).padEnd(4)} in ${BASE}/${ENV}/image/thumb/     ║`);
        const synced = images === s3Original;
        console.log(`║  ${warnIcon(synced)} DB↔S3 Sync: ${synced ? 'In Sync' : `OUT OF SYNC (DB:${images} S3:${s3Original})`}${''.padEnd(synced ? 14 : 2)} ║`);
        console.log('╠══════════════════════════════════════════════════╣');
        console.log('║  DEPLOYMENT                                       ║');
        console.log(`║  Last Deploy:  ${lastDeploy.slice(0, 34).padEnd(34)} ║`);
        console.log(`║  Last Feed:    ${lastFeed.slice(0, 34).padEnd(34)} ║`);
        console.log('╚══════════════════════════════════════════════════╝');

        if (!synced) {
            console.log('\n💡 Run `npm run seed:images` to sync S3 images into DB.');
        }
        if (images === 0) {
            console.log('💡 No images! Add images to backend/assets/raw/ then run: npm run optimize && npm run deploy && npm run seed:images');
        }

        process.exit(0);
    } catch (err) {
        console.error('\n❌ Health check failed:', err.message);
        process.exit(1);
    }
};

health();
