const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const fs = require('fs-extra');
const connectDB = require('../../config/db');
const Event = require('../../models/Event');
const Image = require('../../models/Image');
const LottieOverlay = require('../../models/LottieOverlay');
const DeployConfig = require('../../models/DeployConfig');

const LANGUAGES = ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'];

const generateSearchIndexMemory = async () => {
    const outputs = {};

    const events = await Event.find({ is_active: true, is_deleted: { $ne: true } })
        .populate('category')
        .populate('tags')
        .populate('vibes')
        .populate({
            path: 'images',
            match: { is_deleted: { $ne: true } },
            options: { sort: { created_at: 1 } }
        })
        .select('title category tags vibes description translations images');

    // Base URLs are no longer prepended directly in JSON dumps.
    // The client Flutter app handles mapping relative paths.

    const getStr = (obj, field, lang) => {
        if (!obj) return '';
        if (lang === 'en') return obj[field] || '';
        if (obj.translations && obj.translations[lang] && obj.translations[lang][field]) {
            return obj.translations[lang][field];
        }
        return obj[field] || '';
    };

    for (const lang of LANGUAGES) {
        const searchIndex = [];
        for (const evt of events) {
            const title = getStr(evt, 'title', lang);
            const description = getStr(evt, 'description', lang);

            const categoryName = evt.category ? getStr(evt.category, 'name', lang) || evt.category.code : '';
            const tagNames = (evt.tags || []).map(t => getStr(t, 'name', lang) || t.code);
            const vibeNames = (evt.vibes || []).map(v => getStr(v, 'name', lang) || v.code);

            const searchString = [
                title,
                categoryName,
                ...vibeNames,
                ...tagNames,
                description
            ].join(' ').toLowerCase();

            let thumbUrl = '';
            const primaryImage = evt.images && evt.images.length > 0 ? evt.images[0] : null;
            if (primaryImage) {
                thumbUrl = primaryImage.s3_key.replace('/original/', '/thumb/').replace('.webp', '_thumb.webp');
            }

            searchIndex.push({
                id: evt._id,
                t: title,
                c: categoryName,
                v: vibeNames,
                k: tagNames,
                s: searchString,
                i: thumbUrl
            });
        }

        const fileName = lang === 'en' ? 'search_index.json' : `search_index_${lang}.json`;
        outputs[`search/${fileName}`] = JSON.stringify(searchIndex);
    }

    console.log(`[RAM Generate] Compiled Search Index for ${LANGUAGES.length} languages.`);
    return outputs;
};

module.exports = {
    generateSearchIndexMemory
};

if (require.main === module) {
    (async () => {
        await connectDB();
        const outputs = await generateSearchIndexMemory();
        for (const [relativePath, jsonString] of Object.entries(outputs)) {
            const fullDst = path.join(__dirname, '../../data/json', relativePath);
            await fs.ensureDir(path.dirname(fullDst));
            await fs.writeFile(fullDst, jsonString);
        }
        console.log('Finished Local Search Dump');
        process.exit();
    })();
}
