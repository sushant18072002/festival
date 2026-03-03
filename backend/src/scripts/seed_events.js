const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Vibe = require('../models/Vibe');
const Event = require('../models/Event');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';

const seedData = require('../../data/events_2026.json');

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');

        // Fetch Categories and Tags
        const categories = await Category.find({});
        const tags = await Tag.find({});

        const categoryMap = categories.reduce((acc, cat) => {
            acc[cat.code] = cat._id;
            return acc;
        }, {});

        const tagMap = tags.reduce((acc, tag) => {
            acc[tag.code] = tag._id;
            return acc;
        }, {});

        // Fetch Vibes
        const vibes = await Vibe.find({});
        const vibeMap = vibes.reduce((acc, vibe) => {
            acc[vibe.code] = vibe._id;
            return acc;
        }, {});

        // Removed destructive deleteMany, script uses upsert safely below
        console.log(`Ready to seed ${seedData.length} events...`);

        for (const event of seedData) {
            // Map category roughly by name/code (JSON has capitalized like 'Religious')
            let catCode = 'festival'; // default
            if (event.category) {
                const lowerCat = event.category.toLowerCase();
                if (lowerCat.includes('national')) catCode = 'national';
                else if (lowerCat.includes('regional')) catCode = 'regional';
                else if (lowerCat.includes('religious')) catCode = 'religious'; // ← fixed: was 'festival'
                else if (lowerCat.includes('observance')) catCode = 'observance';
            }
            event.category = categoryMap[catCode] || categoryMap['festival'] || null;

            // Date mapping from dates array
            if (event.dates && event.dates.length > 0) {
                event.date = new Date(event.dates[0].date);
            }

            // Map tag codes to ObjectIds
            if (event.tags && event.tags.length > 0) {
                event.tags = event.tags.map(t => tagMap[t] || null).filter(id => id);
            }

            // Map vibe codes to ObjectIds
            if (event.vibes && event.vibes.length > 0) {
                event.vibes = event.vibes.map(v => vibeMap[v] || null).filter(id => id);
            }

            // Strip out lottie_overlay if it's an object to prevent CastError
            if (event.lottie_overlay && typeof event.lottie_overlay === 'object') {
                delete event.lottie_overlay;
            }

            // Use upsert based on slug to prevent duplicates if run multiple times
            await Event.findOneAndUpdate(
                { slug: event.slug },
                event,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`Seeded: ${event.title}`);
        }

        console.log('Events Seeding Complete!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
