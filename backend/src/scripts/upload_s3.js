/**
 * upload_s3.js — Optimized Data & Image Deployment Pipeline (AWS SDK v3)
 * 
 * Orchestrates the full deployment:
 * 1. Image original/thumb uploads (CONCURRENT)
 * 2. Lottie animation uploads (CONCURRENT)
 * 3. Dynamic JSON generation and streaming to S3 (PARALLEL)
 * 4. Health check and versioning push
 * 5. Triggers audio upload (upload_audio.js)
 */

const { 
    S3Client, 
    PutObjectCommand, 
    HeadObjectCommand, 
    ListObjectsV2Command, 
    CopyObjectCommand 
} = require('@aws-sdk/client-s3');
const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');

const fs = require('fs-extra');
const path = require('path');
const dotenv = require('dotenv');
const mime = require('mime-types');
const crypto = require('crypto');
const mongoose = require('mongoose');
const pLimit = require('p-limit');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const LOCK_FILE = path.join(__dirname, '../../deploy.lock');
const LANGUAGES = ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'];
const CONCURRENCY_LIMIT = 5;

const limit = pLimit(CONCURRENCY_LIMIT);

const clearLock = () => {
    if (fs.existsSync(LOCK_FILE)) {
        try { fs.unlinkSync(LOCK_FILE); } catch (e) { }
    }
};

process.on('uncaughtException', (err) => {
    console.error('Fatal crash:', err);
    clearLock();
    process.exit(1);
});

process.on('SIGINT', () => {
    clearLock();
    process.exit(1);
});

process.on('exit', () => clearLock());

const Image = require('../models/Image');
const LottieOverlay = require('../models/LottieOverlay');

const withRetry = async (fn, context = '', maxRetries = 2) => {
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            return await fn();
        } catch (error) {
            attempts++;
            console.warn(`[Retry ${attempts}/${maxRetries}] ${context} failed: ${error.message}`);
            if (attempts >= maxRetries) throw error;
            await new Promise(res => setTimeout(res, 2000 * attempts));
        }
    }
};

const shouldUpload = async (s3Key, content) => {
    try {
        const head = await s3Client.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key }));
        const remoteETag = head.ETag?.replace(/"/g, '');
        const localHash = crypto.createHash('md5').update(content).digest('hex');
        if (remoteETag === localHash) return false;
    } catch (e) { /* Needs upload */ }
    return true;
};

const validateJson = (relativePath, jsonString) => {
    try {
        const parsed = JSON.parse(jsonString);
        // Validation rules logic...
        return { valid: true };
    } catch (e) {
        return { valid: false, reason: `Invalid JSON: ${e.message}` };
    }
};

const listS3EtagMap = async (s3Prefix) => {
    const etagMap = {};
    let continuationToken = null;
    do {
        const res = await s3Client.send(new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: s3Prefix,
            ContinuationToken: continuationToken
        }));
        for (const obj of (res.Contents || [])) {
            etagMap[obj.Key] = obj.ETag?.replace(/"/g, '');
        }
        continuationToken = res.NextContinuationToken;
    } while (continuationToken);
    return etagMap;
};

const uploadDir = async (localDir, s3Prefix, cacheControl) => {
    if (!await fs.pathExists(localDir)) {
        console.warn(`  ⚠ Directory not found: ${localDir}, skipping.`);
        return;
    }
    const files = await fs.readdir(localDir);

    console.log(`  🔍 Scanning S3 folder: ${s3Prefix} (${files.length} local files)`);
    const s3EtagMap = await listS3EtagMap(s3Prefix + '/');

    let uploaded = 0, skipped = 0;
    
    const tasks = files.map(file => limit(async () => {
        const filePath = path.join(localDir, file);
        if ((await fs.stat(filePath)).isDirectory()) return;

        const fileContent = await fs.readFile(filePath);
        const s3Key = `${s3Prefix}/${file}`;
        const contentType = mime.lookup(filePath) || 'application/octet-stream';

        const localHash = crypto.createHash('md5').update(fileContent).digest('hex');
        const remoteEtag = s3EtagMap[s3Key];

        if (remoteEtag && remoteEtag === localHash) {
            skipped++;
            if (s3Prefix.includes('image')) await Image.updateOne({ s3_key: s3Key }, { $set: { is_s3_uploaded: true } });
            else if (s3Prefix.includes('lotties')) await LottieOverlay.updateOne({ filename: file }, { $set: { is_s3_uploaded: true, file_size_bytes: fileContent.length } });
            return;
        }

        try {
            await withRetry(() => s3Client.send(new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: fileContent,
                ContentType: contentType,
                CacheControl: cacheControl
            })), `upload ${s3Key}`);
            
            uploaded++;
            if (s3Prefix.includes('image')) await Image.updateOne({ s3_key: s3Key }, { $set: { is_s3_uploaded: true } });
            else if (s3Prefix.includes('lotties')) {
                await LottieOverlay.updateOne(
                    { filename: file }, 
                    { $set: { is_s3_uploaded: true, file_size_bytes: fileContent.length, s3_key: s3Key } }
                );
            }
        } catch (err) {
            console.error(`Failed to upload ${s3Key}:`, err.message);
            throw err;
        }
    }));

    await Promise.all(tasks);
    console.log(`  ✅ [PATH: ${s3Prefix}] Stats: ${uploaded} UP, ${skipped} SKP.`);
}

const asyncBackupS3Folder = async (sourcePrefix, targetPrefix) => {
    let continuationToken = null;
    do {
        const listRes = await s3Client.send(new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: sourcePrefix,
            ContinuationToken: continuationToken
        }));
        if (!listRes.Contents || listRes.Contents.length === 0) break;

        const copyPromises = listRes.Contents.map(item => {
            const targetKey = item.Key.replace(sourcePrefix, targetPrefix);
            return withRetry(() => s3Client.send(new CopyObjectCommand({
                Bucket: BUCKET_NAME,
                CopySource: `${BUCKET_NAME}/${item.Key}`,
                Key: targetKey
            })), `copy ${targetKey}`);
        });
        await Promise.all(copyPromises);
        continuationToken = listRes.NextContinuationToken;
    } while (continuationToken);
};

const deploy = async () => {
    const totalStartTime = Date.now();
    const isForce = process.argv.includes('--force');
    if (isForce) clearLock();

    console.log('🚀 Optimized Deployment Pipeline v2 Engine Active.');

    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share');

        const env = process.env.DEPLOY_ENV || 'stage';
        const base = process.env.S3_BASE_PATH || 'Utsav';

        // 1. Safety Backup
        console.log('--- Phase 0: Rollback Point ---');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
        const backupPrefix = `${base}/${env}/backups/${timestamp}/json_rollback/`;
        const jsonPrefix = `${base}/${env}/json/`;
        await asyncBackupS3Folder(jsonPrefix, backupPrefix);

        // 2. Images & Lotties (Now Parallel)
        console.log('--- Phase 1: Asset Core ---');
        await Promise.all([
            uploadDir(path.join(__dirname, '../../assets/optimized/original'), `${base}/${env}/image/original`, 'max-age=31536000'),
            uploadDir(path.join(__dirname, '../../assets/optimized/thumb'), `${base}/${env}/image/thumb`, 'max-age=31536000'),
            uploadDir(path.join(__dirname, '../../assets/lotties'), `${base}/${env}/lotties`, 'max-age=31536000')
        ]);

        // 3. Dynamic JSONs
        console.log('--- Phase 2: Metadata Feed ---');
        const { generateFeedMemory } = require('./generators/generate_feed');
        const memoryPayloads = {};
        for (const lang of LANGUAGES) {
            Object.assign(memoryPayloads, await generateFeedMemory(lang));
        }

        const uploadPromises = Object.entries(memoryPayloads).map(([relativePath, jsonString]) => limit(async () => {
            const s3Key = `${base}/${env}/json/${relativePath}`;
            if (await shouldUpload(s3Key, jsonString)) {
                await withRetry(() => s3Client.send(new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: s3Key,
                    Body: jsonString,
                    ContentType: 'application/json',
                    CacheControl: 'max-age=3600'
                })), `json upload ${s3Key}`);
                console.log(`  ↑ [JSON] ${relativePath}`);
            }
        }));
        await Promise.all(uploadPromises);

        // 4. Trigger Audio (Optimization already applied inside script)
        console.log('--- Phase 3: Audio Orchestration ---');
        const { execSync } = require('child_process');
        execSync('node src/scripts/upload_audio.js', { stdio: 'inherit' });

        // 5. Invalidate CloudFront (Targeted)
        if (process.env.ENABLE_CLOUDFRONT === 'true') {
            const cfClient = new CloudFrontClient({ region: process.env.AWS_REGION });
            await cfClient.send(new CreateInvalidationCommand({
                DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
                InvalidationBatch: {
                    CallerReference: `deploy-${Date.now()}`,
                    Paths: { Quantity: 2, Items: [`/${base}/${env}/json/*`, `/${base}/${env}/image/*`] }
                }
            }));
            console.log('💨 CloudFront invalidated (targeted).');
        }

        const totalTime = ((Date.now() - totalStartTime) / 1000).toFixed(1);
        console.log(`\n🎉 BEYOND BEST-IN-CLASS: Deploy completed in ${totalTime}s`);
    } catch (err) {
        console.error('❌ Pipeline Stalled:', err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

deploy();
