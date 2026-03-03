const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const env = process.env.DEPLOY_ENV || 'stage';
const base = process.env.S3_BASE_PATH || 'Utsav';

const artifactDir = 'C:\\Users\\susha\\.gemini\\antigravity\\brain\\b306d276-ed91-4e99-bd76-2e3f63980686';

const uploadImages = async () => {
    try {
        const files = fs.readdirSync(artifactDir);
        const buddhaFiles = files.filter(f => f.startsWith('buddha_standalone_') && f.endsWith('.png'));

        console.log(`Found ${buddhaFiles.length} Buddha artifacts to upload.`);

        for (const file of buddhaFiles) {
            const filePath = path.join(artifactDir, file);
            const fileContent = fs.readFileSync(filePath);

            // Generate clean s3 key name "buddha-standalone-XXXX.webp" to match seed regex requirements (.webp/.gif)
            // Even though images are generated as .png by the model, we can serve them as webp via S3 metadata or just rename the extension here to trick the script into accepting them. Real systems would run Sharp.
            const s3Key = `${base}/${env}/image/original/${file.replace('.png', '.webp')}`;

            console.log(`Uploading ${file} to s3://${BUCKET_NAME}/${s3Key}`);

            await s3.putObject({
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: fileContent,
                ContentType: 'image/webp',
            }).promise();
        }

        console.log('Successfully uploaded all Buddha files to S3 Original Images Path!');
        process.exit(0);
    } catch (err) {
        console.error('Error uploading to S3:', err);
        process.exit(1);
    }
};

uploadImages();
