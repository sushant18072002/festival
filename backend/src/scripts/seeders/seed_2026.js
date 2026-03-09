const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const mongoose = require('mongoose');

const Category = require('../../models/Category');
const Tag = require('../../models/Tag');
const LottieOverlay = require('../../models/LottieOverlay');
const Event = require('../../models/Event');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');

        // Removed destructive deleteMany commands; relying on findOneAndUpdate instead.
        console.log('Database connected, starting seed...');

        // Read the massive 2026 JSON seed file
        const dataPath = path.join(__dirname, '../../../data/events_2026.json');
        const seedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        console.log(`Loaded ${seedData.length} events from events_2026.json`);

        for (const eventData of seedData) {
            console.log(`Processing Event: ${eventData.title}`);

            // 1. Handle Category
            let categoryId = null;
            if (eventData.category) {
                const categoryCode = eventData.category.toLowerCase().replace(/\s+/g, '-');
                const cat = await Category.findOneAndUpdate(
                    { code: categoryCode },
                    {
                        code: categoryCode,
                        translations: { hi: { name: eventData.category } }
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                categoryId = cat._id;
            }

            // 2. Handle Tags
            const tagIds = [];
            if (eventData.tags && eventData.tags.length > 0) {
                for (const tagName of eventData.tags) {
                    const tagCode = tagName.toLowerCase().replace(/\s+/g, '-');
                    const tag = await Tag.findOneAndUpdate(
                        { code: tagCode },
                        {
                            code: tagCode,
                            translations: { hi: { name: tagName } }
                        },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );
                    tagIds.push(tag._id);
                }
            }

            // 3. Handle LottieOverlay
            let lottieId = null;
            if (eventData.lottie_overlay) {
                const lottie = await LottieOverlay.findOneAndUpdate(
                    { filename: eventData.lottie_overlay.filename },
                    {
                        title: eventData.lottie_overlay.title,
                        filename: eventData.lottie_overlay.filename,
                        asset_path: `assets/lottie/${eventData.lottie_overlay.filename}`,
                        tags: tagIds
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                lottieId = lottie._id;
            }

            // 4. Create/Update Event
            const parsedDates = eventData.dates.map(d => ({
                year: d.year,
                date: new Date(d.date) // Ensure proper string to ISODate conversion
            }));

            // Use the first date as the primary future date field if it exists
            const primaryDate = parsedDates.length > 0 ? parsedDates[0].date : null;

            await Event.findOneAndUpdate(
                { slug: eventData.slug },
                {
                    slug: eventData.slug,
                    title: eventData.title,
                    description: eventData.description,
                    category: categoryId,
                    tags: tagIds,
                    lottie_overlay: lottieId,
                    notification_templates: eventData.notification_templates || [],
                    priority: eventData.priority || 0,
                    dates: parsedDates,
                    date: primaryDate,
                    is_active: true
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            console.log(`Successfully seeded: ${eventData.title}`);
        }

        console.log('2026 Seeding Complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error during 2026 seeding:', err);
        process.exit(1);
    }
};

seedDB();
