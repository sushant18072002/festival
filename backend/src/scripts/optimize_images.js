const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Image = require('../models/Image');

const RAW_DIR = path.join(__dirname, '../../assets/raw');
const OPTIMIZED_DIR = path.join(__dirname, '../../assets/optimized');
const ORIGINAL_DIR = path.join(OPTIMIZED_DIR, 'original');
const THUMB_DIR = path.join(OPTIMIZED_DIR, 'thumb');

const optimizeImages = async () => {
    try {
        // Connect to DB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share');
        console.log('Connected to MongoDB');

        // Ensure dirs exist
        await fs.ensureDir(RAW_DIR);
        await fs.ensureDir(ORIGINAL_DIR);
        await fs.ensureDir(THUMB_DIR);

        const files = await fs.readdir(RAW_DIR);

        console.log(`Found ${files.length} images to optimize...`);

        for (const file of files) {
            if (file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
                const inputPath = path.join(RAW_DIR, file);
                const filename = path.parse(file).name;
                const extension = path.parse(file).ext.toLowerCase();
                const isGif = extension === '.gif';

                const outputPath = path.join(ORIGINAL_DIR, isGif ? `${filename}.gif` : `${filename}.webp`);
                const thumbPath = path.join(THUMB_DIR, isGif ? `${filename}_thumb.gif` : `${filename}_thumb.webp`);

                // Check if already exists
                if (await fs.pathExists(outputPath)) {
                    console.log(`Skipping ${file} (already optimized)`);
                    await Image.updateOne(
                        { filename: file },
                        { $set: { is_optimized: true, mime_type: isGif ? 'image/gif' : 'image/webp' } }
                    );
                    continue;
                }

                console.log(`Processing ${file}...`);

                if (isGif) {
                    // For GIFs, we just copy for now or use sharp with animated: true
                    await sharp(inputPath, { animated: true })
                        .resize({ width: 1080, withoutEnlargement: true })
                        .toFile(outputPath);

                    await sharp(inputPath, { animated: true })
                        .resize({ width: 300, withoutEnlargement: true })
                        .toFile(thumbPath);
                } else {
                    // Resize to 1080 width, convert to WebP
                    await sharp(inputPath)
                        .resize({ width: 1080, withoutEnlargement: true })
                        .webp({ quality: 80 })
                        .toFile(outputPath);

                    // Generate Thumbnail
                    await sharp(inputPath)
                        .resize({ width: 300, withoutEnlargement: true })
                        .webp({ quality: 60 })
                        .toFile(thumbPath);
                }

                // Update DB
                await Image.updateOne(
                    { filename: file },
                    { $set: { is_optimized: true, mime_type: isGif ? 'image/gif' : 'image/webp' } }
                );
            }
        }

        console.log('Optimization Complete!');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

optimizeImages();
