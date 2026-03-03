/**
 * seed_mantras.js — Safe upsert-only seeding. Never deletes existing admin edits.
 * Run: npm run seed:mantras (from backend/)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Vibe = require('../models/Vibe');
const Event = require('../models/Event');
const Mantra = require('../models/Mantra');
const seedData = require('../../data/mantras.json');

const seedDB = async () => {
    try {
        await connectDB();
        console.log('🔌 MongoDB Connected');

        const [categories, tags, vibes, events] = await Promise.all([
            Category.find({}), Tag.find({}), Vibe.find({}), Event.find({})
        ]);

        const categoryMap = Object.fromEntries(categories.map(c => [c.code, c._id]));
        const tagMap = Object.fromEntries(tags.map(t => [t.code, t._id]));
        const vibeMap = Object.fromEntries(vibes.map(v => [v.code, v._id]));
        const eventMap = Object.fromEntries(events.map(e => [e.slug, e._id]));

        if (Object.keys(categoryMap).length === 0) {
            console.warn('⚠️  No categories found. Run `npm run seed:taxonomy` first.');
        }

        let seeded = 0, updated = 0;
        for (const item of seedData) {
            const resolved = { ...item };
            resolved.category = item.category ? (categoryMap[item.category] || null) : null;
            if (item.tags) resolved.tags = item.tags.map(t => tagMap[t]).filter(Boolean);
            if (item.vibes) resolved.vibes = item.vibes.map(v => vibeMap[v]).filter(Boolean);
            if (item.event_slug) resolved.event_id = eventMap[item.event_slug] || null;

            const existing = await Mantra.findOne({ slug: item.slug });
            if (existing) {
                await Mantra.updateOne({ slug: item.slug }, {
                    $set: { category: resolved.category, tags: resolved.tags || [], vibes: resolved.vibes || [], translations: item.translations || {} }
                });
                updated++;
            } else {
                await Mantra.create(resolved);
                seeded++;
                console.log(`  ✅ Seeded: ${item.slug}`);
            }
        }

        console.log(`\n✅ Mantras seed complete! New: ${seeded}, Updated: ${updated}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
};

seedDB();
