const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const connectDB = require('../../config/db');
const Greeting = require('../../models/Greeting');
const Category = require('../../models/Category');
const Tag = require('../../models/Tag');
const Vibe = require('../../models/Vibe');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const LANGUAGES = ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'];

const generateGreetingsMemory = async () => {
    const outputs = {};

    const items = await Greeting.find({ is_active: true, is_deleted: { $ne: true } })
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
            category: item.category ? item.category.code : null,
            tags: (item.tags || []).map(t => t.code),
            vibes: (item.vibes || []).map(v => v.code)
        }));

        const output = {
            version: '1.0',
            generated_at: new Date().toISOString(),
            language: lang,
            greetings: catalog
        };

        const fileName = lang === 'en' ? 'greetings_en.json' : `greetings_${lang}.json`;
        outputs[`greetings/${fileName}`] = JSON.stringify(output);
    }

    console.log(`[RAM Generate] Compiled Greetings Data for ${LANGUAGES.length} languages.`);
    return outputs;
};

module.exports = {
    generateGreetingsMemory
};

if (require.main === module) {
    (async () => {
        await connectDB();
        const outputs = await generateGreetingsMemory();
        for (const [relativePath, jsonString] of Object.entries(outputs)) {
            const fullDst = path.join(__dirname, '../../data/json', relativePath);
            await fs.ensureDir(path.dirname(fullDst));
            await fs.writeFile(fullDst, jsonString);
        }
        console.log('Finished Local Greetings Dump');
        process.exit();
    })();
}
