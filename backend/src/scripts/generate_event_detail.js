const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const connectDB = require('../config/db');
const Event = require('../models/Event');
const Image = require('../models/Image');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Vibe = require('../models/Vibe');
const DeployConfig = require('../models/DeployConfig');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const LANGUAGES = ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const getStr = (obj, field, lang) => {
    if (!obj) return '';
    if (lang !== 'en' && obj.translations?.[lang]?.[field]) {
        return obj.translations[lang][field];
    }
    return obj[field] || '';
};

const imageUrl = (s3Key) => s3Key ? s3Key : null;
const thumbUrl = (s3Key) => s3Key ? s3Key.replace('/original/', '/thumb/').replace(/\.webp$/, '_thumb.webp') : null;

// ─────────────────────────────────────────────────────────────────────────────
// Per-language catalog generation (Pure Function)
// ─────────────────────────────────────────────────────────────────────────────

const buildCatalog = (lang = 'en', events, imagesByEvent) => {
    const catalog = events.map((evt) => {
        if (!evt.slug) return null;

        const validLangs = ['neutral', lang];
        const imgs = (imagesByEvent[evt._id.toString()] || []).filter(img => validLangs.includes(img.language || 'neutral'));
        const primaryImage = imgs[0] || null;
        const galleryImages = imgs.slice(0, 20);

        const facts = (evt.historical_significance || []).map((item) => {
            const fact = lang !== 'en' && item.translations?.[lang]?.fact ? item.translations[lang].fact : item.fact;
            return { year: item.year || 0, fact, source: item.source || '' };
        });

        const now = new Date();
        const futureDates = (evt.dates || [])
            .filter((d) => d.date && new Date(d.date) > now)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        const nextDate = futureDates[0] || null;

        return {
            id: evt._id.toString(),
            slug: evt.slug,
            title: getStr(evt, 'title', lang),
            description: getStr(evt, 'description', lang),
            wiki_link: evt.wiki_link || '',
            lottie_overlay: evt.lottie_overlay ? { id: evt.lottie_overlay._id.toString(), title: evt.lottie_overlay.title, filename: evt.lottie_overlay.filename, s3_key: evt.lottie_overlay.s3_key } : null,
            date: evt.date ? evt.date.toISOString() : null,
            next_date: nextDate ? { year: nextDate.year, date: nextDate.date ? new Date(nextDate.date).toISOString() : null } : null,
            dates: (evt.dates || []).map((d) => ({
                year: d.year,
                date: d.date ? new Date(d.date).toISOString() : null,
            })),
            priority: evt.priority || 0,
            category: evt.category ? {
                code: evt.category.code,
                name: evt.category.translations?.[lang]?.name || evt.category.translations?.en?.name || evt.category.code,
                icon: evt.category.icon || 'sparkles',
                color: evt.category.color || '#8b5cf6',
            } : null,
            vibes: (evt.vibes || []).map((v) => ({
                code: v.code,
                name: v.translations?.[lang]?.name || v.translations?.en?.name || v.code,
                icon: v.icon || 'sparkles',
                color: v.color || '#8b5cf6',
            })),
            tags: (evt.tags || []).map((t) => ({
                code: t.code,
                name: t.translations?.[lang]?.name || t.translations?.en?.name || t.code,
            })),
            image: primaryImage ? {
                id: primaryImage._id.toString(),
                url: imageUrl(primaryImage.s3_key),
                thumbnail: thumbUrl(primaryImage.s3_key),
                caption: getStr(primaryImage, 'caption', lang) || '',
                share_text: getStr(primaryImage, 'share_text', lang) || '',
                has_overlay: primaryImage.has_overlay || false,
                greeting_id: primaryImage.greeting_id ? primaryImage.greeting_id.toString() : null,
                greeting_config: primaryImage.greeting_config || null,
                quote_id: primaryImage.quote_id ? primaryImage.quote_id.toString() : null,
                quote_config: primaryImage.quote_config || null,
                dominant_colors: primaryImage.dominant_colors || [],
                aspect_ratio: primaryImage.aspect_ratio || 1.0,
                language: primaryImage.language || 'neutral',
                is_s3_uploaded: primaryImage.is_s3_uploaded || false,
            } : null,
            thumbnail: primaryImage ? thumbUrl(primaryImage.s3_key) : null,
            gallery: galleryImages.map((img) => ({
                id: img._id.toString(),
                url: imageUrl(img.s3_key),
                thumbnail: thumbUrl(img.s3_key),
                caption: getStr(img, 'caption', lang) || getStr(img, 'share_text', lang) || '',
                share_text: getStr(img, 'share_text', lang),
                credits: img.credits || '',
                media_type: img.media_type || 'image',
                is_standalone: img.is_standalone || false,
                standalone_category: img.standalone_category || null,
                has_overlay: img.has_overlay || false,
                greeting_id: img.greeting_id ? img.greeting_id.toString() : null,
                greeting_config: img.greeting_config || null,
                quote_id: img.quote_id ? img.quote_id.toString() : null,
                quote_config: img.quote_config || null,
                dominant_colors: img.dominant_colors || [],
                aspect_ratio: img.aspect_ratio || 1.0,
                language: img.language || 'neutral',
                is_s3_uploaded: img.is_s3_uploaded || false,
            })),
            facts,
            // ── Rich Event Fields ──────────────────────────────────────────
            muhurat: evt.muhurat ? {
                puja_time: evt.muhurat.puja_time || '',
                type: evt.muhurat.type || '',
                description: evt.muhurat.description || '',
            } : null,
            ritual_steps: (evt.ritual_steps || [])
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(step => ({
                    order: step.order,
                    title: (lang !== 'en' && step.translations?.[lang]?.title) ? step.translations[lang].title : step.title,
                    description: (lang !== 'en' && step.translations?.[lang]?.description) ? step.translations[lang].description : (step.description || ''),
                    timing: step.timing || '',
                    items_needed: step.items_needed || [],
                })),
            ambient_audio: evt.ambient_audio?.s3_key ? {
                filename: evt.ambient_audio.filename || '',
                s3_key: evt.ambient_audio.s3_key,
                duration_seconds: evt.ambient_audio.duration_seconds || 0,
                title: evt.ambient_audio.title || '',
            } : null,
            recipes: (evt.recipes || []).map(recipe => ({
                name: (lang !== 'en' && recipe.translations?.[lang]?.name) ? recipe.translations[lang].name : recipe.name,
                description: (lang !== 'en' && recipe.translations?.[lang]?.description) ? recipe.translations[lang].description : (recipe.description || ''),
                ingredients: recipe.ingredients || [],
                steps: recipe.steps || [],
            })),
            dress_guide: evt.dress_guide ? {
                description: (lang !== 'en' && evt.dress_guide.translations?.[lang]?.description)
                    ? evt.dress_guide.translations[lang].description
                    : (evt.dress_guide.description || ''),
                colors: evt.dress_guide.colors || [],
            } : null,
            playlist_links: (evt.playlist_links || []).map(pl => ({
                platform: pl.platform || '',
                url: pl.url || '',
                title: pl.title || '',
            })),
            mantras: (evt.mantras || []).map(m => ({
                id: m._id.toString(),
                text: getStr(m, 'text', lang),
                translation: getStr(m, 'translation', lang) || '',
                audio_file: m.audio_file || '',
                category: m.category ? m.category.toString() : ''
            }))
        };
    });

    const validEvents = catalog.filter(Boolean);

    return {
        version: '2.0',
        generated_at: new Date().toISOString(),
        language: lang,
        events: validEvents,
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// Per-language consolidated image catalog (Pure Function)
// ─────────────────────────────────────────────────────────────────────────────

const buildImagesCatalog = (lang, events, imagesByEvent) => {
    const eventsMap = {};

    for (const evt of events) {
        if (!evt.slug) continue;
        const validLangs = ['neutral', lang];
        const imgs = (imagesByEvent[evt._id.toString()] || []).filter(img => validLangs.includes(img.language || 'neutral'));
        if (imgs.length === 0) continue;

        eventsMap[evt.slug] = imgs.map((img) => ({
            id: img._id.toString(),
            url: imageUrl(img.s3_key),
            thumbnail: thumbUrl(img.s3_key),
            caption: getStr(img, 'caption', lang) || getStr(img, 'share_text', lang) || '',
            share_text: getStr(img, 'share_text', lang),
            credits: img.credits || '',
            media_type: img.media_type || 'image',
            is_standalone: img.is_standalone || false,
            standalone_category: img.standalone_category || null,
            has_overlay: img.has_overlay || false,
            greeting_id: img.greeting_id ? img.greeting_id.toString() : null,
            greeting_config: img.greeting_config || null,
            quote_id: img.quote_id ? img.quote_id.toString() : null,
            quote_config: img.quote_config || null,
            is_s3_uploaded: img.is_s3_uploaded || false,
        }));
    }

    return {
        version: '1.0',
        generated_at: new Date().toISOString(),
        language: lang,
        events: eventsMap,
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Memory Generator
// ─────────────────────────────────────────────────────────────────────────────

const generateEventDetailMemory = async () => {
    const outputs = {};

    // Outputting strictly relative s3_key paths. Flutter app handles mapping via API_BASE_URL
    const events = await Event.find({ is_active: true, is_deleted: { $ne: true } })
        .select('-__v -updatedAt -createdAt')
        .populate('category', 'code icon color translations')
        .populate('tags', 'code translations')
        .populate('vibes', 'code icon color translations')
        .populate('lottie_overlay', 'title filename s3_key')
        .populate('mantras')
        .sort({ priority: -1, date: 1 });

    const eventIds = events.map((e) => e._id);
    const allImages = await Image.find({ event_id: { $in: eventIds }, is_deleted: { $ne: true } })
        .sort({ created_at: 1 });

    const imagesByEvent = {};
    for (const img of allImages) {
        const key = img.event_id.toString();
        if (!imagesByEvent[key]) imagesByEvent[key] = [];
        imagesByEvent[key].push(img);
    }

    for (const lang of LANGUAGES) {
        const catalog = buildCatalog(lang, events, imagesByEvent);
        outputs[`events/catalog/events_catalog_${lang}.json`] = JSON.stringify(catalog);

        const imgCatalog = buildImagesCatalog(lang, events, imagesByEvent);
        outputs[`images/images_${lang}.json`] = JSON.stringify(imgCatalog);
    }

    console.log(`[RAM Generate] Compiled Events & Images Catalog Data for ${LANGUAGES.length} languages.`);
    return outputs;
};

// Expose cleanly for S3 uploader
module.exports = {
    generateEventDetailMemory
};

// Legacy Dev Execution
if (require.main === module) {
    (async () => {
        await connectDB();
        const outputs = await generateEventDetailMemory();
        for (const [relativePath, jsonString] of Object.entries(outputs)) {
            const fullDst = path.join(__dirname, '../../data/json', relativePath);
            await fs.ensureDir(path.dirname(fullDst));
            await fs.writeFile(fullDst, jsonString);
        }
        console.log('Finished Local Event/Images Dump');
        process.exit();
    })();
}
