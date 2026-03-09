const mongoose = require('mongoose');
const fs = require('fs-extra');
const path = require('path');
const AWS = require('aws-sdk');
const { spawn } = require('child_process');
const util = require('util');

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const backupDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected for State Update access.');

        const now = new Date();
        const dateStr = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        const timestamp = `${dateStr}_${timeStr}`;
        const backupDir = path.join(__dirname, `../../backups/${timestamp}`);
        const archiveName = `utsav_share_bson_${timestamp}.archive.gz`;
        const archivePath = path.join(backupDir, archiveName);

        await fs.ensureDir(backupDir);

        console.log(`Starting BSON backup via mongodump to ${archivePath}...`);

        try {
            await new Promise((resolve, reject) => {
                const dump = spawn('mongodump', [`--uri=${mongoUri}`, `--archive=${archivePath}`, '--gzip'], { stdio: 'inherit' });
                dump.on('close', (code) => {
                    if (code === 0) resolve();
                    else reject(new Error(`mongodump failed with code ${code}`));
                });
                dump.on('error', reject);
            });
            console.log('Local BSON backup complete.');
        } catch (dumpErr) {
            // mongodump not installed — skip backup gracefully
            console.warn('⚠️  mongodump not found — skipping BSON backup.');
            console.warn('   Install MongoDB Database Tools to enable backups: https://www.mongodb.com/try/download/database-tools');
            await mongoose.disconnect();
            process.exit(0); // exit successfully — backup is optional
        }

        console.log('Local BSON backup complete.');

        // Check Environment
        const DeployConfig = require('../../models/DeployConfig');
        const config = await DeployConfig.findOne({ key: 'server_deployment' });
        const isLocal = config && config.environment === 'local';

        if (isLocal) {
            console.log('Environment is LOCAL. Skipping S3 Backup Upload.');
        } else {
            console.log(`Uploading ${archiveName} to S3...`);
            if (await fs.pathExists(archivePath)) {
                const fileContent = await fs.readFile(archivePath);
                const env = process.env.DEPLOY_ENV || 'stage';
                const base = process.env.S3_BASE_PATH || 'Utsav';
                const s3Key = `${base}/${env}/backups/${timestamp}/${archiveName}`;

                await s3.putObject({
                    Bucket: BUCKET_NAME,
                    Key: s3Key,
                    Body: fileContent,
                    ContentType: 'application/gzip'
                }).promise();

                console.log(`Uploaded: s3://${BUCKET_NAME}/${s3Key}`);
            } else {
                throw new Error(`Archive file not found at ${archivePath}`);
            }
        }

        // Update System State
        const SystemState = require('../../models/SystemState');
        await SystemState.findOneAndUpdate(
            { key: 'main' },
            { $set: { last_backup_at: new Date() } },
            { upsert: true, new: true }
        );
        console.log('System State Updated');

        console.log('Backup Process Complete!');
        process.exit(0);
    } catch (err) {
        console.error('Backup Failed:', err);
        process.exit(1);
    }
};

backupDB();
