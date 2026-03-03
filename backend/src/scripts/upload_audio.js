/**
 * upload_audio.js — Upload audio files from backend/assets/audio/ to AWS S3
 * and mark them as uploaded in the AmbientAudio master collection.
 *
 * Usage:
 *   node src/scripts/upload_audio.js
 *   node src/scripts/upload_audio.js --slug diwali-lakshmi-aarti   (single)
 *   node src/scripts/upload_audio.js --force                        (re-upload all)
 */

const AWS = require('aws-sdk');
const fs = require('fs-extra');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const AmbientAudio = require('../models/AmbientAudio');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AUDIO_DIR = path.join(__dirname, '../../assets/audio');
const DEPLOY_ENV = process.env.DEPLOY_ENV || 'stage';
const BASE_PATH = process.env.S3_BASE_PATH || 'Utsav';

const SUPPORTED_TYPES = {
    '.aac': 'audio/aac',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
};

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

const upload = async () => {
    const targetSlug = process.argv.find((a, i) => process.argv[i - 1] === '--slug');
    const forceReUpload = process.argv.includes('--force');

    try {
        await connectDB();
        console.log('🎵 Connected to MongoDB. Starting audio upload...\n');

        // Ensure audio directory exists
        await fs.ensureDir(AUDIO_DIR);

        // Fetch audio records to upload
        const query = targetSlug
            ? { slug: targetSlug }
            : forceReUpload ? {} : { is_s3_uploaded: false };

        const audioRecords = await AmbientAudio.find(query);

        if (audioRecords.length === 0) {
            console.log('✅ Nothing to upload. All audio already on S3.');
            console.log('   Run with --force to re-upload all. Run with --slug <slug> to upload specific.');
            return;
        }

        console.log(`📤 Uploading ${audioRecords.length} audio file(s)...\n`);

        let uploaded = 0;
        let failed = 0;
        let skipped = 0;

        for (const audio of audioRecords) {
            const localPath = path.join(AUDIO_DIR, audio.filename);

            // ── Check if local file exists ────────────────────────────────────
            if (!await fs.pathExists(localPath)) {
                console.warn(`  ⚠  File not found locally, skipping: ${audio.filename}`);
                console.warn(`     Expected at: ${localPath}`);
                skipped++;
                continue;
            }

            const fileContent = await fs.readFile(localPath);
            const ext = path.extname(audio.filename).toLowerCase();
            const contentType = SUPPORTED_TYPES[ext] || audio.mime_type || 'audio/aac';
            const fileSizeBytes = (await fs.stat(localPath)).size;

            // Ensure we don't recursively prepend BASE_PATH and DEPLOY_ENV if already present
            const prefix = `${BASE_PATH}/${DEPLOY_ENV}/`;
            const s3Key = audio.s3_key.startsWith(prefix) ? audio.s3_key : `${prefix}${audio.s3_key}`;

            try {
                console.log(`  ↑  Uploading: ${audio.filename} (${formatBytes(fileSizeBytes)})`);
                console.log(`     S3 Key: ${s3Key}`);

                // AWS S3 Metadata STRICTLY requires ASCII-only characters in HTTP headers. 
                // Any em-dashes (—), emojis, or fancy quotes will instantly crash the upload.
                const safeAsciiString = (str) => {
                    if (!str) return '';
                    // Replace em dash with normal dash, then strip any other non-ASCII characters
                    return String(str).replace(/[\u2013\u2014]/g, '-').replace(/[^\x20-\x7E]/g, '');
                };

                await withRetry(() => s3.putObject({
                    Bucket: BUCKET_NAME,
                    Key: s3Key,
                    Body: fileContent,
                    ContentType: contentType,
                    CacheControl: 'max-age=31536000', // 1 year — audio doesn't change
                    Metadata: {
                        'audio-slug': safeAsciiString(audio.slug),
                        'audio-title': safeAsciiString(audio.title),
                        'duration-seconds': String(audio.duration_seconds),
                    },
                }).promise(), `s3.putObject ${s3Key}`);

                // ── Update DB ─────────────────────────────────────────────────
                await AmbientAudio.updateOne(
                    { _id: audio._id },
                    {
                        $set: {
                            is_s3_uploaded: true,
                            file_size_bytes: fileSizeBytes,
                            // Store the full S3 key with environment prefix for accurate CDN URLs
                            s3_key: s3Key,
                        }
                    }
                );

                console.log(`  ✅ Uploaded: ${audio.slug}\n`);
                uploaded++;
            } catch (err) {
                console.error(`  ❌ Failed: ${audio.filename}: ${err.message}\n`);
                failed++;
            }
        }

        console.log('\n──────────────────────────────────────────');
        console.log(`✅ Upload complete!`);
        console.log(`   Uploaded: ${uploaded} | Skipped: ${skipped} | Failed: ${failed}`);
        if (failed > 0) {
            console.log(`\n⚠  ${failed} file(s) failed. Check errors above.`);
            process.exitCode = 1;
        }

    } catch (err) {
        console.error('❌ Upload script failed:', err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

upload();
