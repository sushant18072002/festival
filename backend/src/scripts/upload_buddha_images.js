/**
 * upload_buddha_images.js
 * Uploads pre-generated Buddha PNG/WebP images to S3.
 * Images are searched in backend/assets/buddha/ directory.
 * Use: npm run seed:buddha:upload
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const env = process.env.DEPLOY_ENV || 'stage';
const base = process.env.S3_BASE_PATH || 'Utsav';

// Buddha images directory — place your PNG/WebP files here
const BUDDHA_DIR = path.join(__dirname, '../../assets/buddha');

const uploadImages = async () => {
    if (!fs.existsSync(BUDDHA_DIR)) {
        fs.mkdirSync(BUDDHA_DIR, { recursive: true });
        console.warn(`⚠️  Created ${BUDDHA_DIR} — place your Buddha images here and re-run this script.`);
        process.exit(0);
    }

    const files = fs.readdirSync(BUDDHA_DIR)
        .filter(f => f.match(/\.(png|webp|jpg|jpeg)$/i));

    if (files.length === 0) {
        console.warn(`⚠️  No images found in ${BUDDHA_DIR}. Place Buddha images there first.`);
        process.exit(0);
    }

    console.log(`📦 Uploading ${files.length} Buddha images to S3...\n`);

    let uploaded = 0;
    for (const file of files) {
        const filePath = path.join(BUDDHA_DIR, file);
        const fileContent = fs.readFileSync(filePath);
        const ext = path.extname(file).toLowerCase();

        // Always store as .webp key so seed_images picks them up
        const s3Key = `${base}/${env}/image/original/${file.replace(ext, '.webp')}`;
        const mimeType = ext === '.gif' ? 'image/gif' : 'image/webp';

        process.stdout.write(`  Uploading ${file}... `);
        await s3.putObject({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: fileContent,
            ContentType: mimeType,
        }).promise();
        console.log(`✅ → s3://${BUCKET_NAME}/${s3Key}`);
        uploaded++;
    }

    console.log(`\n✅ Uploaded ${uploaded} Buddha images to S3.`);
    console.log(`\n👉 Next step: npm run seed:images  (to register them in MongoDB)`);
    process.exit(0);
};

uploadImages().catch(err => {
    console.error('❌ Upload failed:', err.message);
    if (err.code === 'InvalidAccessKeyId') {
        console.error('   → Fix AWS_ACCESS_KEY_ID in backend/.env');
    }
    process.exit(1);
});
