const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const connectDB = require('../../config/db');
const Image = require('../../models/Image');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const LANGUAGES = ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'];

const imageUrl = (s3Key) => s3Key ? s3Key : null;
const thumbUrl = (s3Key) => s3Key ? s3Key.replace('/original/', '/thumb/').replace(/\.webp$/, '_thumb.webp') : null;

const generateImagesMemory = async () => {
    const outputs = {};

    const items = await Image.find({ is_deleted: { $ne: true } })
        .populate('categories', 'code')
        .populate('tags', 'code');
    // Note: 'vibes' are not on Image models natively.

    const getStr = (obj, field, lang) => {
        if (!obj) return '';
        if (lang !== 'en' && obj.translations?.[lang]?.[field]) {
            return obj.translations[lang][field];
        }
        return obj[field] || '';
    };

    for (const lang of LANGUAGES) {
        // Filter language-specific images
        const langItems = items.filter(img => ['neutral', lang].includes(img.language || 'neutral'));

        const catalog = langItems.map(item => ({
            id: item._id.toString(),
            url: imageUrl(item.s3_key),
            thumbnail: thumbUrl(item.s3_key),
            caption: getStr(item, 'caption', lang) || getStr(item, 'share_text', lang) || '',
            share_text: getStr(item, 'share_text', lang),
            credits: item.credits || '',
            media_type: item.media_type || 'image',
            is_standalone: item.is_standalone || false,
            standalone_category: item.standalone_category || null,
            has_overlay: item.has_overlay || false,
            greeting_id: item.greeting_id ? item.greeting_id.toString() : null,
            greeting_config: item.greeting_config || null,
            quote_id: item.quote_id ? item.quote_id.toString() : null,
            quote_config: item.quote_config || null,
            dominant_colors: item.dominant_colors || [],
            aspect_ratio: item.aspect_ratio || 1.0,
            language: item.language || 'neutral',
            is_s3_uploaded: item.is_s3_uploaded || false,
            // Restored Taxonomy & Metric Fields that were missing in Event aggregator
            categories: (item.categories || []).map(c => c.code),
            tags: (item.tags || []).map(t => t.code),
            downloads_count: item.downloads_count || 0,
            likes_count: item.likes_count || 0,
            shares_count: item.shares_count || 0,
        }));

        const output = {
            version: '2.0',
            generated_at: new Date().toISOString(),
            language: lang,
            images: catalog
        };

        const fileName = lang === 'en' ? 'images_en.json' : `images_${lang}.json`;
        outputs[`images/${fileName}`] = JSON.stringify(output);
    }

    console.log(`[RAM Generate] Compiled Images Data for ${LANGUAGES.length} languages.`);
    return outputs;
};

module.exports = {
    generateImagesMemory
};

if (require.main === module) {
    (async () => {
        await connectDB();
        const outputs = await generateImagesMemory();
        for (const [relativePath, jsonString] of Object.entries(outputs)) {
            const fullDst = path.join(__dirname, '../../data/json', relativePath);
            await fs.ensureDir(path.dirname(fullDst));
            await fs.writeFile(fullDst, jsonString);
        }
        console.log('Finished Local Images Dump');
        process.exit();
    })();
}
