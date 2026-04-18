/**
 * fix_ritual_step_order.js
 * Adds sequential 'order' field to ritual steps that are missing it.
 * Run: node src/scripts/fix_ritual_step_order.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';

const TARGET_SLUGS = [
    'pongal-2026', 'easter-2026', 'maha-navami-2026', 'govardhan-puja-2026',
    'hola-mohalla-2026', 'teej-2026', 'tulsi-vivah-2026', 'vat-savitri-2026',
    'nag-panchami-2026', 'bodhi-day-2026'
];

async function fix() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    let fixedCount = 0;

    for (const slug of TARGET_SLUGS) {
        const event = await Event.findOne({ slug });
        if (!event) {
            console.log(`  ⚠️  Not found: ${slug}`);
            continue;
        }

        if (!event.ritual_steps || event.ritual_steps.length === 0) {
            console.log(`  ⚠️  No ritual_steps: ${slug}`);
            continue;
        }

        let changed = false;
        for (let i = 0; i < event.ritual_steps.length; i++) {
            const step = event.ritual_steps[i];
            if (step.order === undefined || step.order === null || step.order === 0) {
                event.ritual_steps[i].order = i + 1;
                changed = true;
            }
        }

        if (changed) {
            event.markModified('ritual_steps');
            await event.save();
            console.log(`  ✅ Fixed ${event.ritual_steps.length} ritual steps for: ${slug}`);
            fixedCount++;
        } else {
            console.log(`  ➡️  Orders already set: ${slug}`);
        }
    }

    // Also fix ALL remaining events that might have order=0 or missing
    const allEvents = await Event.find({ 'ritual_steps.0': { $exists: true } });
    for (const event of allEvents) {
        if (TARGET_SLUGS.includes(event.slug)) continue; // already handled above
        let changed = false;
        for (let i = 0; i < event.ritual_steps.length; i++) {
            if (!event.ritual_steps[i].order) {
                event.ritual_steps[i].order = i + 1;
                changed = true;
            }
        }
        if (changed) {
            event.markModified('ritual_steps');
            await event.save();
            console.log(`  ✅ Fixed ritual step orders for: ${event.slug}`);
            fixedCount++;
        }
    }

    console.log(`\nFixed ${fixedCount} events.`);
    await mongoose.disconnect();
    process.exit(0);
}

fix().catch(err => {
    console.error('Fix failed:', err);
    process.exit(1);
});
