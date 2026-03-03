/**
 * seed_greetings.js — Safe upsert-only seeding. Never deletes existing admin edits.
 * Run: npm run seed:greetings (from backend/)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Vibe = require('../models/Vibe');
const Event = require('../models/Event');
const Greeting = require('../models/Greeting');
const seedData = require('../../data/greetings.json');

const buildLookupMaps = async () => {
    const [categories, tags, vibes, events] = await Promise.all([
        Category.find({}),
        Tag.find({}),
        Vibe.find({}),
        Event.find({})
    ]);
    return {
        categoryMap: Object.fromEntries(categories.map(c => [c.code, c._id])),
        tagMap: Object.fromEntries(tags.map(t => [t.code, t._id])),
        vibeMap: Object.fromEntries(vibes.map(v => [v.code, v._id])),
        eventMap: Object.fromEntries(events.map(e => [e.slug, e._id]))
    };
};

const resolveItem = (item, { categoryMap, tagMap, vibeMap, eventMap }) => {
    const resolved = { ...item };
    resolved.category = item.category ? (categoryMap[item.category] || null) : null;
    if (item.tags) resolved.tags = item.tags.map(t => tagMap[t]).filter(Boolean);
    if (item.vibes) resolved.vibes = item.vibes.map(v => vibeMap[v]).filter(Boolean);
    if (item.event_slug) resolved.event_id = eventMap[item.event_slug] || null;
    return resolved;
};

const seedDB = async () => {
    try {
        await connectDB();
        console.log('🔌 MongoDB Connected');

        const maps = await buildLookupMaps();

        // Guard: warn if taxonomy is empty (seed:taxonomy must run first)
        if (Object.keys(maps.categoryMap).length === 0) {
            console.warn('⚠️  No categories found. Run `npm run seed:taxonomy` first.');
        }

        let seeded = 0, skipped = 0;
        for (const item of seedData) {
            const resolved = resolveItem(item, maps);
            const existing = await Greeting.findOne({ slug: item.slug });
            if (existing) {
                // Only update taxonomy refs and translations — preserve admin edits to text
                await Greeting.updateOne({ slug: item.slug }, {
                    $set: {
                        category: resolved.category,
                        tags: resolved.tags || [],
                        vibes: resolved.vibes || [],
                        event_id: resolved.event_id || null,
                        translations: item.translations || {}
                    }
                });
                skipped++;
            } else {
                await Greeting.create(resolved);
                seeded++;
                console.log(`  ✅ Seeded: ${item.slug}`);
            }
        }

        console.log(`\n✅ Greetings seed complete! New: ${seeded}, Updated: ${skipped}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
};

seedDB();
