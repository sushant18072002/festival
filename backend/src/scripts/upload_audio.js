/**
 * upload_audio.js — Optimized Asset Upload Pipeline (AWS SDK v3)
 * 
 * Features:
 * - CONCURRENCY: Parallel uploads (limit 5) for high-speed deployment.
 * - INTEGRITY: 0-byte file check and .aac enforcement.
 * - SMART SYNC: Pre-check S3 existence via HeadObject even if local flag is false.
 */

const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs-extra');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const pLimit = require('p-limit');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const AmbientAudio = require('../models/AmbientAudio');
const Mantra = require('../models/Mantra');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AUDIO_BASE_DIR = path.join(__dirname, '../../assets/audio');
const DEPLOY_ENV = process.env.DEPLOY_ENV || 'stage';
const BASE_PATH = process.env.S3_BASE_PATH || 'Utsav';
const CONCURRENCY_LIMIT = 5;

const limit = pLimit(CONCURRENCY_LIMIT);

const withRetry = async (fn, context = '', maxRetries = 3) => {
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            return await fn();
        } catch (err) {
            attempts++;
            console.warn(`  [Retry ${attempts}/${maxRetries}] ${context}: ${err.message}`);
            if (attempts >= maxRetries) throw err;
            await new Promise(res => setTimeout(res, 2000 * attempts));
        }
    }
};

const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const safeAsciiString = (str) => {
    if (!str) return '';
    return String(str).replace(/[\u2013\u2014]/g, '-').replace(/[^\x20-\x7E]/g, '');
};

const uploadModelAssets = async (Model, assetType, subFolder, filenameField, slugField) => {
    const forceReUpload = process.argv.includes('--force');
    const query = forceReUpload ? {} : { is_s3_uploaded: { $ne: true } };
    const records = await Model.find(query);

    if (records.length === 0) {
        console.log(`🍵 No ${assetType} assets to process.`);
        return { uploaded: 0, skipped: 0, failed: 0 };
    }

    console.log(`📤 Processing ${records.length} ${assetType}(s) with concurrency=${CONCURRENCY_LIMIT}...`);

    let uploaded = 0, failed = 0, skipped = 0;

    const tasks = records.map(record => limit(async () => {
        let filename = record[filenameField];
        if (filename && filename.includes('/')) {
            filename = filename.split('/').pop();
        }

        if (!filename) {
            skipped++;
            return;
        }

        const localPath = path.join(AUDIO_BASE_DIR, subFolder, filename);
        if (!await fs.pathExists(localPath)) {
            console.warn(`  [!] MISSING: ${record[slugField]} at ${localPath}`);
            skipped++;
            return;
        }

        const stats = await fs.stat(localPath);
        if (stats.size === 0) {
            console.warn(`  [!] INVALID: ${filename} is 0 bytes. Skipping.`);
            skipped++;
            return;
        }

        const s3Key = `${BASE_PATH}/${DEPLOY_ENV}/audio/${subFolder}/${filename}`;

        // Smart Sync: Check if file already exists on S3 with same size
        try {
            const head = await s3Client.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key }));
            if (head.ContentLength === stats.size && !forceReUpload) {
                // Already on S3, just update local flag if it was false
                if (!record.is_s3_uploaded) {
                    await Model.updateOne({ _id: record._id }, { $set: { is_s3_uploaded: true, file_size_bytes: stats.size, s3_key: s3Key } });
                }
                skipped++;
                return;
            }
        } catch (e) {
            // Not on S3, proceed to upload
        }

        try {
            const fileContent = await fs.readFile(localPath);
            console.log(`  ↑ [UPLOAD] ${filename} (${formatBytes(stats.size)})`);

            await withRetry(() => s3Client.send(new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: fileContent,
                ContentType: 'audio/aac',
                CacheControl: 'max-age=31536000',
                Metadata: {
                    'asset-type': assetType,
                    'slug': safeAsciiString(record[slugField]),
                    'title': safeAsciiString(record.title || record.text || '')
                }
            })), `Upload ${s3Key}`);

            await Model.updateOne(
                { _id: record._id },
                { $set: { is_s3_uploaded: true, file_size_bytes: stats.size, s3_key: s3Key } }
            );

            if (assetType === 'mantra') {
                await Model.updateOne({ _id: record._id }, { $set: { audio_file: s3Key } });
            }

            uploaded++;
        } catch (err) {
            console.error(`  ❌ [ERROR] ${filename}: ${err.message}`);
            failed++;
        }
    }));

    await Promise.all(tasks);
    return { uploaded, skipped, failed };
};

const run = async () => {
    const startTime = Date.now();
    try {
        await connectDB();
        console.log('🎵 Audio Pipeline Optimization active.\n');

        console.log('--- Phase 1: Ambient Audio (Originals) ---');
        const ambientResult = await uploadModelAssets(AmbientAudio, 'ambient', 'originals', 'filename', 'slug');

        console.log('\n--- Phase 2: Mantras ---');
        const mantraResult = await uploadModelAssets(Mantra, 'mantra', 'mantras', 'audio_file', 'slug');

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log('\n' + '─'.repeat(45));
        console.log(`📊 PIPELINE SUMMARY (${duration}s)`);
        console.log(`   Ambient: ${ambientResult.uploaded} UP, ${ambientResult.skipped} SKP, ${ambientResult.failed} ERR`);
        console.log(`   Mantras: ${mantraResult.uploaded} UP, ${mantraResult.skipped} SKP, ${mantraResult.failed} ERR`);
        console.log('─'.repeat(45));

    } catch (err) {
        console.error('❌ Pipeline Crash:', err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

run();
