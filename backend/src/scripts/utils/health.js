/**
 * health.js — Optimized Backend Health & Deep Audit Tool
 * 
 * Usage:
 *   node src/scripts/utils/health.js          (Shallow count comparison)
 *   node src/scripts/utils/health.js --deep   (Deep per-asset verification)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const { S3Client, ListObjectsV2Command, HeadObjectCommand } = require('@aws-sdk/client-s3');
const pLimit = require('p-limit');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.AWS_BUCKET_NAME;
const ENV = process.env.DEPLOY_ENV || 'stage';
const BASE = process.env.S3_BASE_PATH || 'Utsav';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';
const CONCURRENCY = 10;
const limit = pLimit(CONCURRENCY);

// Load models for deep audit
const Image = require('../../models/Image');
const Mantra = require('../../models/Mantra');
const AmbientAudio = require('../../models/AmbientAudio');
const LottieOverlay = require('../../models/LottieOverlay');

const countS3Objects = async (prefix) => {
    let total = 0, token;
    do {
        const res = await s3Client.send(new ListObjectsV2Command({
            Bucket: BUCKET, Prefix: prefix, ContinuationToken: token
        }));
        total += (res.Contents || []).length;
        token = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (token);
    return total;
};

const verifyObject = async (key) => {
    if (!key) return false;
    try {
        await s3Client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
        return true;
    } catch (e) {
        return false;
    }
};

const statusIcon = (ok) => ok ? '✅' : '❌';
const warnIcon = (ok) => ok ? '✅' : '⚠️ ';

const performDeepAudit = async () => {
    console.log('🔍 Starting Deep Integrity Audit...');
    const results = { images: 0, mantras: 0, ambient: 0, lotties: 0, broken: [] };

    const auditModel = async (Model, label, keyField, slugField) => {
        const records = await Model.find({ is_deleted: { $ne: true } });
        console.log(`  Checking ${records.length} ${label}...`);
        
        const tasks = records.map(r => limit(async () => {
            const ok = await verifyObject(r[keyField]);
            if (!ok) results.broken.push(`${label}: ${r[slugField]} (Key: ${r[keyField]})`);
            else results[label.toLowerCase()]++;
        }));
        await Promise.all(tasks);
    };

    await auditModel(Image, 'Images', 's3_key', 'filename');
    await auditModel(Mantra, 'Mantras', 'audio_file', 'slug');
    await auditModel(AmbientAudio, 'Ambient', 's3_key', 'slug');
    await auditModel(LottieOverlay, 'Lotties', 's3_key', 'filename');

    return results;
};

const health = async () => {
    const isDeep = process.argv.includes('--deep');
    try {
        await mongoose.connect(MONGO_URI);
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

        let s3Original = 0, s3Thumb = 0;
        try {
            [s3Original, s3Thumb] = await Promise.all([
                countS3Objects(`${BASE}/${ENV}/image/original/`),
                countS3Objects(`${BASE}/${ENV}/image/thumb/`)
            ]);
        } catch (e) {
            console.warn('  ⚠️  Could not reach S3:', e.message);
        }

        let auditResults = null;
        if (isDeep) auditResults = await performDeepAudit();

        console.log('\n╔══════════════════════════════════════════════════╗');
        console.log('║           🏥  UTSAV BACKEND HEALTH CHECK          ║');
        console.log('╠══════════════════════════════════════════════════╣');
        console.log('║  DATABASE                                         ║');
        console.log(`║  ${statusIcon(events > 0)} Events:       ${String(events).padEnd(4)}                          ║`);
        console.log(`║  ${statusIcon(images > 0)} Images:       ${String(images).padEnd(4)} (on S3: ${imagesUploaded})      ║`);
        console.log(`║  ${statusIcon(mantras > 0)} Mantras:     ${String(mantras).padEnd(4)}                          ║`);
        console.log('╠══════════════════════════════════════════════════╣');
        console.log('║  S3 STORAGE                                       ║');
        console.log(`║  ${statusIcon(s3Original > 0)} Originals:   ${String(s3Original).padEnd(4)}                          ║`);
        const synced = images === s3Original;
        console.log(`║  ${warnIcon(synced)} DB↔S3 Sync: ${synced ? 'In Sync' : 'MISMATCH'}                    ║`);
        
        if (isDeep) {
            console.log('╠══════════════════════════════════════════════════╣');
            console.log('║  DEEP INTEGRITY RESULTS                           ║');
            console.log(`║  Verified Assets: ${String(auditResults.images + auditResults.mantras + auditResults.ambient + auditResults.lotties).padEnd(4)}                    ║`);
            console.log(`║  Broken Links:    ${String(auditResults.broken.length).padEnd(4)} ${auditResults.broken.length > 0 ? '❌' : '✅'}                  ║`);
            if (auditResults.broken.length > 0) {
                console.log('║  Listing up to 3 broken links:                    ║');
                auditResults.broken.slice(0, 3).forEach(b => {
                    console.log(`║  ! ${b.slice(0, 45).padEnd(45)} ║`);
                });
            }
        }
        console.log('╚══════════════════════════════════════════════════╝');

        process.exit(0);
    } catch (err) {
        console.error('\n❌ Health check failed:', err.message);
        process.exit(1);
    }
};

health();
