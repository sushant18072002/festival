const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const connectDB = require('../../config/db');
const Event = require('../../models/Event');
const Image = require('../../models/Image');
const LottieOverlay = require('../../models/LottieOverlay');
const SystemState = require('../../models/SystemState');
const Vibe = require('../../models/Vibe');
const Category = require('../../models/Category');
const Tag = require('../../models/Tag');
const DeployConfig = require('../../models/DeployConfig');
const AppConfig = require('../../models/AppConfig');
const HomeGreeting = require('../../models/HomeGreeting');

dotenv.config({ path: path.join(__dirname, '../../.env') });

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getStr = (obj, field, lang) => {
    if (!obj) return '';
    if (lang === 'en') return obj[field] || '';
    if (obj.translations && obj.translations[lang] && obj.translations[lang][field]) {
        return obj.translations[lang][field];
    }
    return obj[field] || '';
};

const getFacts = (evt, lang) => {
    if (!evt.historical_significance) return [];
    return evt.historical_significance.map(item => {
        let fact = item.fact;
        if (lang !== 'en' && item.translations && item.translations[lang] && item.translations[lang].fact) {
            fact = item.translations[lang].fact;
        }
        return { year: item.year, fact: fact, source: item.source };
    });
};

// Removed getBaseUrl - Decoupled client architecture handles base mappings

// ─── Builders ────────────────────────────────────────────────────────────────

const buildHistoryCard = (allEvents, lang, today) => {
    const historyEvents = allEvents.filter(e => e.historical_significance && e.historical_significance.length > 0);
    const todayHistory = [];
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    for (const evt of historyEvents) {
        if (evt.date) {
            const evtDate = new Date(evt.date);
            if (evtDate.getMonth() + 1 === currentMonth && evtDate.getDate() === currentDay) {
                const facts = getFacts(evt, lang);
                if (facts && facts.length > 0) {
                    todayHistory.push({
                        id: evt._id,
                        slug: evt.slug,
                        title: getStr(evt, 'title', lang),
                        facts: facts
                    });
                }
            }
        }
    }

    if (todayHistory.length === 0) return null;
    return {
        type: 'history_card',
        code: 'history',
        title: lang === 'hi' ? 'आज का इतिहास' : 'This Day in History',
        items: todayHistory
    };
};

const buildTrendingGrid = async (lang) => {
    const trendingImagesDeep = await Image.find({ is_deleted: { $ne: true }, language: { $in: ['neutral', lang] } })
        .select(`s3_key caption aspect_ratio dominant_colors share_text media_type downloads_count is_standalone standalone_category has_overlay greeting_id greeting_config quote_id quote_config is_s3_uploaded translations.en translations.${lang}`)
        .sort({ downloads_count: -1 })
        .limit(50);

    if (trendingImagesDeep.length === 0) return null;

    const trendingItems = trendingImagesDeep.map(img => ({
        id: img._id,
        url: img.s3_key,
        thumbnail: img.s3_key.replace('/original/', '/thumb/').replace('.webp', '_thumb.webp'),
        caption: getStr(img, 'caption', lang),
        share_text: getStr(img, 'share_text', lang),
        has_overlay: img.has_overlay || false,
        greeting_id: img.greeting_id ? img.greeting_id.toString() : null,
        greeting_config: img.greeting_config || null,
        quote_id: img.quote_id ? img.quote_id.toString() : null,
        quote_config: img.quote_config || null,
        dominant_colors: img.dominant_colors || [],
        aspect_ratio: img.aspect_ratio || 1.0,
        language: img.language || 'neutral',
        is_s3_uploaded: img.is_s3_uploaded || false,
        is_standalone: img.is_standalone || false,
        standalone_category: img.standalone_category || null,
        downloads_count: img.downloads_count || 0,
        vibes: [] // Images no longer inherit event vibes natively via population
    }));

    return {
        type: 'masonry_grid',
        code: 'trending',
        title: lang === 'hi' ? 'आपके लिए' : 'For You',
        items: trendingItems
    };
};

const buildUpcomingHorizontal = async (allEvents, lang, today) => {
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(today.getDate() + 30);

    const upcomingEvents = allEvents.filter(e => {
        if (!e.date) return false;
        const evtDate = new Date(e.date);
        return evtDate >= today && evtDate <= thirtyDaysLater;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

    if (upcomingEvents.length === 0) return null;

    const upcomingItems = [];
    for (const evt of upcomingEvents) {
        const primaryImage = evt.images && evt.images.length > 0 ? evt.images[0] : null;
        const galleryImages = evt.images ? evt.images.slice(0, 5) : [];

        upcomingItems.push({
            id: evt._id,
            slug: evt.slug,
            title: getStr(evt, 'title', lang),
            description: getStr(evt, 'description', lang),
            wiki_link: evt.wiki_link || '',
            lottie_overlay: evt.lottie_overlay ? { id: evt.lottie_overlay._id, filename: evt.lottie_overlay.filename, s3_key: evt.lottie_overlay.s3_key } : null,
            date: evt.date,
            priority: evt.priority || 0,
            dates: evt.dates || [],
            facts: getFacts(evt, lang),
            vibes: (evt.vibes || []).map(v => ({
                name: v.translations?.[lang]?.name || v.translations?.['en']?.name || v.code,
                icon: v.icon || 'sparkles',
                color: v.color || '#8b5cf6'
            })),
            tags: (evt.tags || []).map(t => ({
                code: t.code,
                name: t.translations?.[lang]?.name || t.translations?.['en']?.name || t.code
            })),
            category: {
                name: evt.category?.translations?.[lang]?.name || evt.category?.translations?.['en']?.name || evt.category?.code || 'Festival',
                icon: evt.category?.icon || 'calendar',
                color: evt.category?.color || '#3b82f6'
            },
            image: primaryImage ? {
                id: primaryImage._id,
                url: primaryImage.s3_key,
                thumbnail: primaryImage.s3_key.replace('/original/', '/thumb/').replace('.webp', '_thumb.webp'),
                caption: getStr(primaryImage, 'caption', lang),
                share_text: getStr(primaryImage, 'share_text', lang),
                has_overlay: primaryImage.has_overlay || false,
                greeting_id: primaryImage.greeting_id ? primaryImage.greeting_id.toString() : null,
                greeting_config: primaryImage.greeting_config || null,
                quote_id: primaryImage.quote_id ? primaryImage.quote_id.toString() : null,
                quote_config: primaryImage.quote_config || null,
                dominant_colors: primaryImage.dominant_colors || [],
                aspect_ratio: primaryImage.aspect_ratio || 1.0,
                language: primaryImage.language || 'neutral',
                is_s3_uploaded: primaryImage.is_s3_uploaded || false
            } : null,
            gallery: galleryImages.map(img => ({
                id: img._id,
                url: img.s3_key,
                thumbnail: img.s3_key.replace('/original/', '/thumb/').replace('.webp', '_thumb.webp'),
                caption: getStr(img, 'caption', lang),
                share_text: getStr(img, 'share_text', lang),
                has_overlay: img.has_overlay || false,
                greeting_id: img.greeting_id ? img.greeting_id.toString() : null,
                greeting_config: img.greeting_config || null,
                quote_id: img.quote_id ? img.quote_id.toString() : null,
                quote_config: img.quote_config || null,
                dominant_colors: img.dominant_colors || [],
                aspect_ratio: img.aspect_ratio || 1.0,
                language: img.language || 'neutral',
                is_s3_uploaded: img.is_s3_uploaded || false
            }))
        });
    }

    return {
        type: 'horizontal_list',
        code: 'upcoming',
        title: lang === 'hi' ? 'आगामी त्यौहार' : 'Upcoming Festivals',
        items: upcomingItems
    };
};

const buildNotifications = (allEvents, lang, today) => {
    const oneYearLater = new Date(today);
    oneYearLater.setFullYear(today.getFullYear() + 1);

    const notificationEvents = allEvents.filter(e => {
        if (!e.date) return false;
        const evtDate = new Date(e.date);
        return evtDate >= today && evtDate <= oneYearLater;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return notificationEvents.map(evt => {
        const title = getStr(evt, 'title', lang);
        let body = `Today is ${title}! Learn more about it.`;

        if (lang === 'hi') body = `आज ${title} है! इसके बारे में और जानें।`;
        else if (lang === 'mr') body = `आज ${title} आहे! याबद्दल अधिक जाणून घ्या.`;
        else if (lang === 'gu') body = `આજે ${title} છે! આ વિશે વધુ જાણો.`;
        else if (lang === 'bn') body = `আজ ${title}! এই সম্পর্কে আরও জানুন।`;
        else if (lang === 'ta') body = `இன்று ${title}! இதைப் பற்றி மேலும் அறிக.`;
        else if (lang === 'te') body = `ఈరోజు ${title}! దీని గురించి మరింత తెలుసుకోండి.`;
        else if (lang === 'kn') body = `ಇಂದು ${title}! ಇದರ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ.`;
        else if (lang === 'ml') body = `ഇന്ന് ${title}! ഇതിനെക്കുറിച്ച് കൂടുതൽ അറിയുക.`;

        return {
            id: evt._id,
            title: title,
            body: body,
            date: evt.date,
            slug: evt.slug
        };
    });
};

const buildTaxonomy = async (lang) => {
    const allCategories = await Category.find({});
    const allTags = await Tag.find({});
    const allVibes = await Vibe.find({});

    return {
        categories: allCategories.map(c => ({
            code: c.code,
            name: c.translations?.[lang]?.name || c.translations?.['en']?.name || c.code,
            icon: c.icon,
            color: c.color
        })),
        tags: allTags.map(t => ({
            code: t.code,
            name: t.translations?.[lang]?.name || t.translations?.['en']?.name || t.code
        })),
        vibes: allVibes.map(v => ({
            code: v.code,
            name: v.translations?.[lang]?.name || v.translations?.['en']?.name || v.code,
            icon: v.icon,
            color: v.color
        }))
    };
};

// ─── Greetings Builder ───────────────────────────────────────────────────────

const buildGreetingsMap = async (lang) => {
    const homeGreetings = await HomeGreeting.find({ is_active: true, is_deleted: { $ne: true } }).lean();
    const groups = { morning: [], afternoon: [], evening: [], night: [], festival: [], general: [] };
    for (const hg of homeGreetings) {
        const type = hg.type || 'general';
        if (!groups[type]) continue;
        const text = (lang !== 'en' && hg.translations?.[lang]?.text) ? hg.translations[lang].text : hg.text;
        if (text) groups[type].push(text);
    }
    return groups;
};

// ─── Main Generator Output ───────────────────────────────────────────────────

/**
 * Executes feed generation completely in memory and returns map of filenames mapped to JSON data strings.
 * Discards local fs.writeJson reliance.
 */
const generateFeedMemory = async (lang = 'en') => {
    const outputs = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allEvents = await Event.find({ is_active: true, is_deleted: { $ne: true } })
        .select(`title slug description date dates priority lottie_overlay historical_significance category tags vibes images translations.en translations.${lang}`)
        .populate('category', `code icon color translations.en translations.${lang}`)
        .populate('tags', `code translations.en translations.${lang}`)
        .populate('vibes', `code icon color translations.en translations.${lang}`)
        .populate('lottie_overlay', 'filename s3_key title')
        .populate({
            path: 'images',
            match: { is_deleted: { $ne: true } },
            options: { sort: { created_at: 1 } },
            populate: [
                { path: 'categories', select: 'code' },
                { path: 'tags', select: 'code' }
            ]
        });

    // 1. Core Feed structure
    const feed = {
        version: "1.3",
        generated_at: new Date().toISOString(),
        language: lang,
        sections: []
    };

    const historySection = buildHistoryCard(allEvents, lang, today);
    if (historySection) feed.sections.push(historySection);

    const trendingSection = await buildTrendingGrid(lang);
    if (trendingSection) feed.sections.push(trendingSection);

    const upcomingSection = await buildUpcomingHorizontal(allEvents, lang, today);
    if (upcomingSection) feed.sections.push(upcomingSection);

    // Inject HomeGreeting grouped map so Flutter's HomeFeed.fromJson can populate 'greetings'
    feed.greetings = await buildGreetingsMap(lang);

    outputs[`home/home_feed_${lang}.json`] = JSON.stringify(feed);

    // 2. System State Tracking
    const state = await SystemState.findOneAndUpdate(
        { key: 'main' },
        { $set: { last_feed_generated_at: new Date() } },
        { upsert: true, new: true }
    );

    outputs[`home/sync.json`] = JSON.stringify({
        version: '2.0',
        last_feed_generated_at: state.last_feed_generated_at.toISOString(),
        status: 'success'
    });

    // Generate version.json so Flutter can detect content updates and invalidate Hive cache
    const deployVersion = Math.floor(Date.now() / 1000); // Unix timestamp as version int
    outputs[`version/version.json`] = JSON.stringify({ version: deployVersion });

    outputs[`home/system_state_${lang}.json`] = JSON.stringify({
        is_maintenance_mode: state.is_maintenance_mode || false,
        min_app_version: state.min_app_version || '1.0.0',
        update_url: state.update_url || '',
        last_modified_at: state.last_modified_at,
        last_deployed_at: state.last_deployed_at,
        last_feed_generated_at: state.last_feed_generated_at,
        version: "1.3"
    });

    // 3. Subsidiary Outputs
    outputs[`home/notifications_${lang}.json`] = JSON.stringify(buildNotifications(allEvents, lang, today));

    const appConfig = await AppConfig.findOne({ key: 'mobile_app' }).lean()
        || await (async () => { await AppConfig.create({ key: 'mobile_app' }); return AppConfig.findOne({ key: 'mobile_app' }).lean(); })();
    const appConfigDto = {
        support_url: appConfig.support_url || '',
        privacy_policy_url: appConfig.privacy_policy_url || '',
        terms_url: appConfig.terms_url || '',
        contact_email: appConfig.contact_email || '',
        social_links: appConfig.social_links || {},
        store_urls: appConfig.store_urls || {},
        feature_flags: appConfig.feature_flags || {},
        generated_at: new Date().toISOString()
    };
    outputs[`home/app_config_${lang}.json`] = JSON.stringify(appConfigDto);

    outputs[`home/taxonomy_${lang}.json`] = JSON.stringify(await buildTaxonomy(lang));

    console.log(`[RAM Generate] Compiled Feed Data for payload: ${lang}`);
    return outputs;
};

// Expose cleanly for S3 uploader
module.exports = {
    generateFeedMemory
};

// If run directly (legacy dev flow), write it
if (require.main === module) {
    (async () => {
        await connectDB();
        const languages = ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'];
        for (const lang of languages) {
            const outputs = await generateFeedMemory(lang);
            for (const [relativePath, jsonString] of Object.entries(outputs)) {
                // For direct file-run backwards compatibility we write here, but deploy scripts will natively injest the Map
                const fixedFileName = relativePath.replace(`home_feed_en.json`, `home_feed.json`);
                const fullDst = path.join(__dirname, '../../data/json', fixedFileName);
                await fs.ensureDir(path.dirname(fullDst));
                await fs.writeFile(fullDst, jsonString);
            }
        }
        console.log('Finished Local Feed Dump');
        process.exit();
    })();
}
