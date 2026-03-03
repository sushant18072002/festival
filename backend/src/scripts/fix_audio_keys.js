/**
 * fix_audio_keys.js
 * 
 * Cleans up recursively prepended S3 keys in the AmbientAudio collection
 * caused by the old upload_audio.js bug. 
 * E.g., translates "Utsav/stage/Utsav/stage/audio/originals/xxx.aac"
 * back to simply "Utsav/stage/audio/originals/xxx.aac" natively.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const AmbientAudio = require('../models/AmbientAudio');
const Event = require('../models/Event');

const fixKeys = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB. Scanning for corrupted S3 keys...');

        const prefix = `${process.env.S3_BASE_PATH || 'Utsav'}/${process.env.DEPLOY_ENV || 'stage'}/`;

        const audioRecords = await AmbientAudio.find({});
        let fixedCount = 0;

        for (const audio of audioRecords) {
            let currentKey = audio.s3_key;
            let modified = false;

            // Strip the prefix recursively if it was applied multiple times
            while (currentKey && currentKey.startsWith(prefix)) {
                currentKey = currentKey.replace(prefix, '');
                modified = true;
            }

            // After stripping all errant copies, we prepend exactly one correct prefix
            const finalKey = `${prefix}${currentKey}`;

            // Also if it was already correct but missing prefix from old seeds, consider it modified
            if (!modified && audio.s3_key === currentKey) {
                modified = true;
            }

            if (modified || audio.s3_key !== finalKey) {
                console.log(`Fixing: ${audio.slug}`);
                console.log(`  Old: ${audio.s3_key}`);
                console.log(`  New: ${finalKey}`);

                await AmbientAudio.updateOne(
                    { _id: audio._id },
                    { $set: { s3_key: finalKey, is_s3_uploaded: false } }
                );

                // Update linked events properly so the flutter JSON payload receives the correct full relative key
                await Event.updateMany(
                    { 'ambient_audio.s3_key': audio.s3_key },
                    { $set: { 'ambient_audio.s3_key': finalKey } }
                );

                fixedCount++;
            }
        }

        console.log(`\n✅ Cleaned up ${fixedCount} corrupted AmbientAudio records.`);
        console.log(`   (Ready for upload_audio.js re-deploy)`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

fixKeys();
