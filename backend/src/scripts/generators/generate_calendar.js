const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const connectDB = require('../../config/db');
const Event = require('../../models/Event');
const Image = require('../../models/Image');
const LottieOverlay = require('../../models/LottieOverlay');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const LANGUAGES = ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'];

const generateCalendarMemory = async () => {
    const outputs = {};

    const events = await Event.find({ is_active: true, is_deleted: { $ne: true } })
        .populate('category')
        .populate('tags')
        .populate('vibes')
        .populate({
            path: 'images',
            match: { is_deleted: { $ne: true } },
            options: { sort: { created_at: 1 } }
        });

    // Base URLs are no longer prepended directly in JSON dumps.
    // The client Flutter app handles mapping relative paths.

    for (const lang of LANGUAGES) {
        const calendarData = {};

        const getStr = (obj, field) => {
            if (!obj) return '';
            if (lang === 'en') return obj[field] || '';
            if (obj.translations && obj.translations[lang] && obj.translations[lang][field]) {
                return obj.translations[lang][field];
            }
            return obj[field] || '';
        };

        const addToCalendar = (dateObj, evt, primaryImage, galleryImages) => {
            const year = dateObj.getFullYear();
            const month = dateObj.getMonth() + 1;
            const day = dateObj.getDate();

            if (!calendarData[year]) calendarData[year] = {};
            if (!calendarData[year][month]) calendarData[year][month] = {};
            if (!calendarData[year][month][day]) calendarData[year][month][day] = [];

            const exists = calendarData[year][month][day].find(e => e.id.toString() === evt._id.toString());
            if (!exists) {
                calendarData[year][month][day].push({
                    id: evt._id,
                    slug: evt.slug,
                    title: getStr(evt, 'title'),
                    description: getStr(evt, 'description'),
                    wiki_link: evt.wiki_link || '',
                    date: dateObj.toISOString(),
                    priority: evt.priority,
                    thumbnail: primaryImage
                        ? primaryImage.s3_key.replace('/original/', '/thumb/').replace('.webp', '_thumb.webp')
                        : null,
                    image: primaryImage ? {
                        url: primaryImage.s3_key,
                        thumbnail: primaryImage.s3_key.replace('/original/', '/thumb/').replace('.webp', '_thumb.webp')
                    } : null,
                    gallery: galleryImages.map(img => ({
                        id: img._id,
                        url: img.s3_key,
                        thumbnail: img.s3_key.replace('/original/', '/thumb/').replace('.webp', '_thumb.webp')
                    })),
                    category: {
                        code: evt.category ? evt.category.code : 'general',
                        name: evt.category ? (evt.category.translations?.[lang]?.name || evt.category.translations?.['en']?.name || evt.category.code) : 'General',
                        icon: evt.category ? evt.category.icon : 'star',
                        color: evt.category ? evt.category.color : 'grey'
                    },
                    tags: (evt.tags || []).map(t => ({
                        code: t.code,
                        name: t.translations?.[lang]?.name || t.translations?.['en']?.name || t.code
                    })),
                    vibes: (evt.vibes || []).map(v => ({
                        name: v.translations?.[lang]?.name || v.translations?.['en']?.name || v.code,
                        icon: v.icon || 'sparkles',
                        color: v.color || '#8b5cf6'
                    })),
                    facts: (evt.historical_significance || []).map(item => {
                        let fact = item.fact;
                        if (lang !== 'en' && item.translations?.[lang]?.fact) {
                            fact = item.translations[lang].fact;
                        }
                        return { year: item.year, fact, source: item.source };
                    })
                });
            }
        };

        for (const evt of events) {
            const imgs = evt.images || [];
            const primaryImage = imgs.length > 0 ? imgs[0] : null;
            const galleryImages = imgs.slice(0, 10);

            if (evt.date) addToCalendar(new Date(evt.date), evt, primaryImage, galleryImages);
            if (evt.dates && evt.dates.length > 0) {
                for (const d of evt.dates) {
                    if (d.date) addToCalendar(new Date(d.date), evt, primaryImage, galleryImages);
                }
            }
        }

        Object.keys(calendarData).forEach(year => {
            Object.keys(calendarData[year]).forEach(month => {
                Object.keys(calendarData[year][month]).forEach(day => {
                    calendarData[year][month][day].sort((a, b) => b.priority - a.priority);
                });
            });
        });

        const fileName = lang === 'en' ? 'calendar_data.json' : `calendar_data_${lang}.json`;
        outputs[`calendar/${fileName}`] = JSON.stringify(calendarData);
    }

    console.log(`[RAM Generate] Compiled Calendar Data for ${LANGUAGES.length} languages.`);
    return outputs;
};

module.exports = {
    generateCalendarMemory
};

if (require.main === module) {
    (async () => {
        await connectDB();
        const outputs = await generateCalendarMemory();
        for (const [relativePath, jsonString] of Object.entries(outputs)) {
            const fullDst = path.join(__dirname, '../../data/json', relativePath);
            await fs.ensureDir(path.dirname(fullDst));
            await fs.writeFile(fullDst, jsonString);
        }
        console.log('Finished Local Calendar Dump');
        process.exit();
    })();
}
