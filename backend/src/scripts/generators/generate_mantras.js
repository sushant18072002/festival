const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const connectDB = require('../../config/db');
const Mantra = require('../../models/Mantra');
const Category = require('../../models/Category');
const Tag = require('../../models/Tag');
const Vibe = require('../../models/Vibe');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const LANGUAGES = ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'];

const generateMantrasMemory = async () => {
    const outputs = {};

    const items = await Mantra.find({ is_active: true, is_deleted: { $ne: true } })
        .populate('category', 'code')
        .populate('tags', 'code')
        .populate('vibes', 'code');

    const getStr = (obj, field, lang) => {
        if (!obj) return '';
        if (lang !== 'en' && obj.translations?.[lang]?.[field]) {
            return obj.translations[lang][field];
        }
        return obj[field] || '';
    };

    for (const lang of LANGUAGES) {
        const catalog = items.map(item => ({
            id: item._id.toString(),
            slug: item.slug,
            text: getStr(item, 'text', lang),
            transliteration: getStr(item, 'transliteration', lang),
            meaning: getStr(item, 'meaning', lang),
            audio_file: item.audio_file || '',
            language: item.language || 'neutral',
            category: item.category ? item.category.code : null,
            tags: (item.tags || []).map(t => t.code),
            vibes: (item.vibes || []).map(v => v.code)
        }));

        const output = {
            version: '1.0',
            generated_at: new Date().toISOString(),
            language: lang,
            mantras: catalog
        };

        const fileName = lang === 'en' ? 'mantras_en.json' : `mantras_${lang}.json`;
        outputs[`mantras/${fileName}`] = JSON.stringify(output);
    }

    console.log(`[RAM Generate] Compiled Mantras Data for ${LANGUAGES.length} languages.`);
    return outputs;
};

module.exports = {
    generateMantrasMemory
};

if (require.main === module) {
    (async () => {
        await connectDB();
        const outputs = await generateMantrasMemory();
        for (const [relativePath, jsonString] of Object.entries(outputs)) {
            const fullDst = path.join(__dirname, '../../data/json', relativePath);
            await fs.ensureDir(path.dirname(fullDst));
            await fs.writeFile(fullDst, jsonString);
        }
        console.log('Finished Local Mantras Dump');
        process.exit();
    })();
}
