const AWS = require('aws-sdk');
const fs = require('fs-extra');
const path = require('path');
const dotenv = require('dotenv');
const mime = require('mime-types');
const crypto = require('crypto');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const LOCK_FILE = path.join(__dirname, '../../deploy.lock');
const LANGUAGES = ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'];

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

const mongoose = require('mongoose');
const Image = require('../models/Image');

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

// ── Incremental Upload: skip S3 PUTs for unchanged content ───────────────────
const shouldUpload = async (s3Key, content) => {
    try {
        const head = await s3.headObject({ Bucket: BUCKET_NAME, Key: s3Key }).promise();
        const remoteETag = head.ETag?.replace(/"/g, '');
        const localHash = crypto.createHash('md5').update(content).digest('hex');
        if (remoteETag === localHash) {
            return false; // unchanged — skip upload
        }
    } catch (e) {
        // Object doesn't exist yet — upload it
    }
    return true;
};

// ── JSON Auto-Validation: ensure critical keys are present after upload ───────
const VALIDATION_RULES = {
    'home_feed': ['sections'],
    'taxonomy': ['categories', 'vibes', 'tags'],
    'calendar_data': null,  // top-level keys are years — just check it's non-empty
    'search_index': null,   // array
    'events_catalog': ['events'],
    'images': ['images'],
    'greetings': ['greetings'],
    'quotes': ['quotes'],
    'mantras': ['mantras'],
    'quiz': null,           // Allow empty gamification/quizzes in dev/stage
    'trivia': null,
    'gamification': null,
};

const validateJson = (relativePath, jsonString) => {
    try {
        const parsed = JSON.parse(jsonString);
        // Find which rule applies by checking if relativePath contains key
        for (const [key, requiredFields] of Object.entries(VALIDATION_RULES)) {
            if (relativePath.includes(key)) {
                if (requiredFields) {
                    for (const field of requiredFields) {
                        const val = parsed[field];
                        if (!val || (Array.isArray(val) && val.length === 0) || (typeof val === 'object' && Object.keys(val).length === 0)) {
                            return { valid: false, reason: `'${field}' is missing or empty in ${relativePath}` };
                        }
                    }
                } else if (Array.isArray(parsed) && parsed.length === 0) {
                    return { valid: false, reason: `${relativePath} is an empty array` };
                } else if (typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length === 0) {
                    return { valid: false, reason: `${relativePath} is an empty object` };
                }
                break;
            }
        }
        return { valid: true };
    } catch (e) {
        return { valid: false, reason: `Invalid JSON: ${e.message}` };
    }
};


// Build a map of { s3Key → etag } for an entire S3 prefix in ONE API call
const listS3EtagMap = async (s3Prefix) => {
    const etagMap = {};
    let continuationToken = null;
    do {
        const res = await s3.listObjectsV2({
            Bucket: BUCKET_NAME,
            Prefix: s3Prefix,
            ContinuationToken: continuationToken
        }).promise();
        for (const obj of (res.Contents || [])) {
            etagMap[obj.Key] = obj.ETag?.replace(/"/g, '');
        }
        continuationToken = res.NextContinuationToken;
    } while (continuationToken);
    return etagMap;
};

const uploadDir = async (localDir, s3Prefix, cacheControl) => {
    const files = await fs.readdir(localDir);

    // One API call to list ALL existing S3 objects with their ETags
    console.log(`  🔍 Scanning S3 folder: ${s3Prefix} (${files.length} local files)`);
    const s3EtagMap = await listS3EtagMap(s3Prefix + '/');

    let uploaded = 0, skipped = 0;
    for (const file of files) {
        const filePath = path.join(localDir, file);
        const fileContent = await fs.readFile(filePath);
        const s3Key = `${s3Prefix}/${file}`;
        const contentType = mime.lookup(filePath) || 'application/octet-stream';

        // Local MD5 vs S3 ETag — no network call per file
        const localHash = crypto.createHash('md5').update(fileContent).digest('hex');
        const remoteEtag = s3EtagMap[s3Key];

        if (remoteEtag && remoteEtag === localHash) {
            skipped++;
            if (s3Prefix.includes('image')) {
                await Image.updateOne({ s3_key: s3Key }, { $set: { is_s3_uploaded: true } });
            }
            continue;
        }

        const params = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: fileContent,
            ContentType: contentType,
            CacheControl: cacheControl
        };

        try {
            await withRetry(() => s3.upload(params).promise(), `s3.upload ${s3Key}`);
            console.log(`  ↑ Uploaded: ${s3Key}`);
            uploaded++;

            if (s3Prefix.includes('image')) {
                await Image.updateOne(
                    { s3_key: s3Key },
                    { $set: { is_s3_uploaded: true } }
                );
            }
        } catch (err) {
            console.error(`Failed to upload ${s3Key}:`, err.message);
            throw err;
        }
    }
    console.log(`  ✅ ${s3Prefix}: ${uploaded} uploaded, ${skipped} skipped (unchanged).`);
}

const asyncBackupS3Folder = async (sourcePrefix, targetPrefix) => {
    let continuationToken = null;
    do {
        const listParams = {
            Bucket: BUCKET_NAME,
            Prefix: sourcePrefix,
            ContinuationToken: continuationToken
        };
        const listRes = await s3.listObjectsV2(listParams).promise();
        if (!listRes.Contents || listRes.Contents.length === 0) break;

        const copyPromises = listRes.Contents.map(item => {
            const targetKey = item.Key.replace(sourcePrefix, targetPrefix);
            return withRetry(() => s3.copyObject({
                Bucket: BUCKET_NAME,
                CopySource: `${BUCKET_NAME}/${item.Key}`,
                Key: targetKey
            }).promise(), `s3.copyObject ${targetKey}`);
        });
        await Promise.all(copyPromises);
        continuationToken = listRes.NextContinuationToken;
    } while (continuationToken);
};

const deploy = async () => {
    const isForce = process.argv.includes('--force');
    if (isForce) {
        console.log('Force flag detected, clearing existing deploy lock manually...');
        clearLock();
    }

    console.log('Starting Deployment...');

    let env, base, timestamp, backupPrefix, jsonPrefix;

    try {
        // Connect to DB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share');
        console.log('Connected to MongoDB');

        const DeployConfig = require('../models/DeployConfig');
        const config = await DeployConfig.findOne({ key: 'server_deployment' });
        const isLocal = config && config.environment === 'local';

        if (isLocal) {
            console.log('Environment is LOCAL. Skipping S3 Upload. Sync to Flutter flow was removed. Change config to stage/production to test uploads.');
            return;
        }

        env = process.env.DEPLOY_ENV || 'stage';
        base = process.env.S3_BASE_PATH || 'Utsav';

        // 0. Trigger Backup (Only if Online)
        console.log('Running safety backup...');
        const { execSync } = require('child_process');
        execSync('npm run backup', { stdio: 'inherit' });
        console.log('Backup complete.');

        timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
        backupPrefix = `${base}/${env}/backups/${timestamp}/json_rollback/`;
        jsonPrefix = `${base}/${env}/json/`;

        console.log(`Creating S3 explicit rollback point at: ${backupPrefix}`);
        await asyncBackupS3Folder(jsonPrefix, backupPrefix);

        // 1. Upload Images (Originals)
        // Cache-Control: 1 year
        await uploadDir(
            path.join(__dirname, '../../assets/optimized/original'),
            `${base}/${env}/image/original`,
            'max-age=31536000'
        );

        // 2. Upload Images (Thumbnails)
        // Cache-Control: 1 year
        await uploadDir(
            path.join(__dirname, '../../assets/optimized/thumb'),
            `${base}/${env}/image/thumb`,
            'max-age=31536000'
        );

        // 3. Generate and Upload Dynamic Data JSONs (RAM-based Streaming)
        // Cache-Control: 1 hour

        const { generateFeedMemory } = require('./generators/generate_feed');
        const { generateEventDetailMemory } = require('./generators/generate_event_detail');
        const { generateCalendarMemory } = require('./generators/generate_calendar');
        const { generateSearchIndexMemory } = require('./generators/generate_search_index');
        const { generateGreetingsMemory } = require('./generators/generate_greetings');
        const { generateQuotesMemory } = require('./generators/generate_quotes');
        const { generateMantrasMemory } = require('./generators/generate_mantras');
        const { generateImagesMemory } = require('./generators/generate_images');
        const generateQuizzes = require('./generators/generate_quiz');
        const generateTrivia = require('./generators/generate_trivia');
        const generateGamification = require('./generators/generate_gamification');

        console.log(`Generating JSONs for ${LANGUAGES.length} languages in memory...`);

        // generateFeedMemory takes a lang arg — call for ALL languages
        // All other generators loop languages internally and return all files in one call
        const feedPayloads = {};
        for (const lang of LANGUAGES) {
            const langOutputs = await generateFeedMemory(lang);
            Object.assign(feedPayloads, langOutputs);
            console.log(`  ✓ Feed generated: ${lang}`);
        }

        const memoryPayloads = {
            ...feedPayloads,
            ...(await generateEventDetailMemory()),   // loops all langs internally
            ...(await generateCalendarMemory()),       // loops all langs internally
            ...(await generateSearchIndexMemory()),    // loops all langs internally
            ...(await generateGreetingsMemory()),      // loops all langs internally
            ...(await generateQuotesMemory()),         // loops all langs internally
            ...(await generateMantrasMemory()),        // loops all langs internally
            ...(await generateImagesMemory())          // loops all langs internally
        };

        // Run the new generators which only need to run once per language loop
        for (const lang of LANGUAGES) {
            memoryPayloads[`quizzes/quiz_${lang}.json`] = JSON.stringify(await generateQuizzes(lang));
            memoryPayloads[`trivia/trivia_${lang}.json`] = JSON.stringify(await generateTrivia(lang));
            memoryPayloads[`gamification/gamification_${lang}.json`] = JSON.stringify(await generateGamification(lang));
            console.log(`  ✓ Gamification/Trivia/Quiz generated: ${lang}`);
        }

        // Language-selective deploy: DEPLOY_LANGS=en,hi only re-uploads those languages
        const deployLangs = process.env.DEPLOY_LANGS
            ? process.env.DEPLOY_LANGS.split(',').map(l => l.trim())
            : null; // null = all languages

        const uploadMemoryPayloads = async (payloads, maxAge = '3600') => {
            let uploaded = 0, skipped = 0, validated = 0, failed = 0;
            const validationErrors = [];

            const uploadPromises = Object.entries(payloads).map(async ([relativePath, jsonString]) => {
                // Language filter: skip files not in DEPLOY_LANGS (e.g. skip greetings_mr.json if only deploying en,hi)
                if (deployLangs) {
                    const isLangFile = LANGUAGES.some(lang => relativePath.endsWith(`_${lang}.json`));
                    if (isLangFile) {
                        const fileMatchesFilter = deployLangs.some(lang => relativePath.endsWith(`_${lang}.json`));
                        if (!fileMatchesFilter) {
                            skipped++;
                            return; // skip this language
                        }
                    }
                }

                // Pre-upload validation: catch broken JSON before it reaches S3
                const check = validateJson(relativePath, jsonString);
                if (!check.valid) {
                    console.error(`❌ Validation FAILED: ${check.reason}`);
                    validationErrors.push(check.reason);
                    failed++;
                    return;
                }
                validated++;

                const s3Key = `${base}/${env}/json/${relativePath}`;

                // Incremental upload: skip if S3 ETag matches MD5 of new content
                const needsUpload = await shouldUpload(s3Key, jsonString);
                if (!needsUpload) {
                    console.log(`  ⏩ Unchanged (skip): ${s3Key}`);
                    skipped++;
                    return;
                }

                console.log(`  ↑ Uploading: ${s3Key}`);
                await withRetry(() => s3.putObject({
                    Bucket: BUCKET_NAME,
                    Key: s3Key,
                    Body: jsonString,
                    ContentType: 'application/json',
                    CacheControl: `max-age=${maxAge}`
                }).promise(), `s3.putObject ${s3Key}`);
                uploaded++;
            });

            await Promise.all(uploadPromises);

            console.log(`✅ JSON Deploy: ${uploaded} uploaded, ${skipped} skipped (unchanged/lang-filtered), ${validated} validated, ${failed} failed.`);

            if (validationErrors.length > 0) {
                throw new Error(`Validation errors detected:\n${validationErrors.join('\n')}`);
            }
        };

        await uploadMemoryPayloads(memoryPayloads);

        // 4. Upload deploy_health + version JSON
        // deploy_health: Flutter app reads this on startup to detect stale Hive cache after a deploy
        const deployHash = crypto.createHash('md5').update(JSON.stringify(memoryPayloads)).digest('hex').slice(0, 8);
        const deployHealthKey = `${base}/${env}/json/deploy_health.json`;
        const deployHealthBody = JSON.stringify({
            deploy_hash: deployHash,
            deployed_at: new Date().toISOString(),
            env,
            language_count: new Set(Object.keys(memoryPayloads).map(k => k.match(/_([a-z]{2})\.json$/)?.[1]).filter(Boolean)).size,
        });
        await withRetry(() => s3.putObject({
            Bucket: BUCKET_NAME,
            Key: deployHealthKey,
            Body: deployHealthBody,
            ContentType: 'application/json',
            CacheControl: 'max-age=30' // very short cache so Flutter always sees latest hash
        }).promise(), 's3.putObject deploy_health.json');
        console.log(`✅ deploy_health.json pushed (hash: ${deployHash})`);

        await uploadDir(
            path.join(__dirname, '../../data/json/version'),
            `${base}/${env}/json/version`,
            'max-age=60'
        );

        // 5d. Upload Build Manifest
        const manifestPath = path.join(__dirname, '../../data/json/manifest.json');
        if (await fs.pathExists(manifestPath)) {
            const manifestContent = await fs.readFile(manifestPath);
            await withRetry(() => s3.putObject({
                Bucket: BUCKET_NAME,
                Key: `${base}/${env}/json/manifest.json`,
                Body: manifestContent,
                ContentType: 'application/json',
                CacheControl: 'max-age=60'
            }).promise(), 's3.putObject manifest.json');
            console.log(`Uploaded manifest.json to ${base}/${env}/json/manifest.json`);
        }

        // Update System State
        const SystemState = require('../models/SystemState');
        await SystemState.findOneAndUpdate(
            { key: 'main' },
            { $set: { last_deployed_at: new Date() } },
            { upsert: true }
        );
        console.log('System State Updated: Deployed');

        // 5e. Audio Upload Trigger
        console.log('Triggering Audio Uploads via upload_audio.js...');
        try {
            const { execSync } = require('child_process');
            execSync('node src/scripts/upload_audio.js', { stdio: 'inherit' });
            console.log('Audio Upload Complete!');
        } catch (audioErr) {
            console.warn('⚠️ Audio upload encountered a non-fatal error:', audioErr.message);
        }

        // 6. Invalidate CloudFront Cache (JSONs)
        const enableCloudFront = process.env.ENABLE_CLOUDFRONT === 'true';
        const distId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
        if (enableCloudFront && distId) {
            console.log('Invalidating CloudFront CDN cache...');
            try {
                const cloudfront = new AWS.CloudFront({
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                    region: process.env.AWS_REGION
                });

                const invalidationParams = {
                    DistributionId: distId,
                    InvalidationBatch: {
                        CallerReference: `deploy-${Date.now()}`,
                        Paths: {
                            Quantity: 1,
                            Items: [`/${base}/${env}/json/*`]
                        }
                    }
                };

                await withRetry(() => cloudfront.createInvalidation(invalidationParams).promise(), 'CloudFront Invalidation');
                console.log('CloudFront Invalidation Triggered successfully.');
            } catch (cdnErr) {
                console.warn(`⚠️ CloudFront Invalidation Failed: ${cdnErr.message}`);
                console.warn('   (This is safe to ignore if your CDN environment is not fully configured).');
            }
        } else {
            console.log('No CLOUDFRONT_DISTRIBUTION_ID found in environment, skipping cache invalidation.');
        }

        console.log('Deployment Complete!');
    } catch (err) {
        console.error('Deployment Failed:', err);
        console.log('Initiating rollback of JSON assets...');
        try {
            if (backupPrefix && jsonPrefix) {
                console.log(`Rolling back from ${backupPrefix} to ${jsonPrefix}...`);
                await asyncBackupS3Folder(backupPrefix, jsonPrefix);
                console.log('Rollback successful. System restored to previous state.');
            }
        } catch (rollbackErr) {
            console.error('CRITICAL: Rollback failed:', rollbackErr);
        }
    } finally {
        await mongoose.disconnect();
    }
}

deploy();
