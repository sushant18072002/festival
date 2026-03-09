const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const connectDB = require('../../config/db');
const Event = require('../../models/Event');
const Image = require('../../models/Image');
const Category = require('../../models/Category');
const Tag = require('../../models/Tag');
const Vibe = require('../../models/Vibe');
const DeployConfig = require('../../models/DeployConfig');
const AmbientAudio = require('../../models/AmbientAudio');

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

const buildCatalog = (lang = 'en', events) => {
    const catalog = events.map((evt) => {
        if (!evt.slug) return null;

        const validLangs = ['neutral', lang];
        const imgs = (evt.images || []).filter(img => validLangs.includes(img.language || 'neutral'));
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
                aspect_ratio: primaryImage.aspect_ratio || 1.0,
                language: primaryImage.language || 'neutral',
                is_s3_uploaded: primaryImage.is_s3_uploaded || false,
                categories: (primaryImage.categories || []).map(c => c.code),
                tags: (primaryImage.tags || []).map(t => t.code),
                downloads_count: primaryImage.downloads_count || 0,
                likes_count: primaryImage.likes_count || 0,
                shares_count: primaryImage.shares_count || 0,
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
                aspect_ratio: img.aspect_ratio || 1.0,
                language: img.language || 'neutral',
                is_s3_uploaded: img.is_s3_uploaded || false,
                categories: (img.categories || []).map(c => c.code),
                tags: (img.tags || []).map(t => t.code),
                downloads_count: img.downloads_count || 0,
                likes_count: img.likes_count || 0,
                shares_count: img.shares_count || 0,
            })),
            facts,
            notifications: evt.notification_templates ? {
                discovery: evt.notification_templates.discovery || '',
                countdown: evt.notification_templates.countdown || '',
                eve: evt.notification_templates.eve || '',
                day_of: evt.notification_templates.day_of || ''
            } : null,
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
            images: (evt.images || []).map(img => img._id.toString()), // Flat array of image IDs for cross-referencing
            ambient_audio: evt.ambient_audio ? {
                id: evt.ambient_audio._id.toString(),
                slug: evt.ambient_audio.slug || '',
                filename: evt.ambient_audio.filename || '',
                s3_key: evt.ambient_audio.s3_key || '',
                duration_seconds: evt.ambient_audio.duration_seconds || 0,
                title: evt.ambient_audio.title || '',
                is_loopable: evt.ambient_audio.is_loopable || false,
                fade_in_ms: evt.ambient_audio.fade_in_ms || 0,
                fade_out_ms: evt.ambient_audio.fade_out_ms || 0,
                default_volume: evt.ambient_audio.default_volume || 1.0,
                mood: evt.ambient_audio.mood || ''
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
                language: m.language || 'neutral',
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
        .populate('ambient_audio')
        .populate('mantras')
        .populate({
            path: 'images',
            match: { is_deleted: { $ne: true } },
            options: { sort: { created_at: 1 } },
            populate: [
                { path: 'categories', select: 'code' },
                { path: 'tags', select: 'code' }
            ]
        })
        .sort({ priority: -1, date: 1 });

    for (const lang of LANGUAGES) {
        const catalog = buildCatalog(lang, events);
        outputs[`events/catalog/events_catalog_${lang}.json`] = JSON.stringify(catalog);
    }

    console.log(`[RAM Generate] Compiled Events Catalog Data for ${LANGUAGES.length} languages.`);
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
