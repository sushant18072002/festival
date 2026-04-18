/**
 * fix_lottie_names.js — Data Recovery Script
 * 
 * Target: LottieOverlay records with missing 'name' field.
 * Action: Migrates 'title' to 'name' or generates from filename.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const LottieOverlay = require('../../models/LottieOverlay');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share';

async function fixLotties() {
    console.log('🚀 Starting Lottie Name Recovery...');
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🔌 Connected to MongoDB');

        const lotties = await LottieOverlay.find({});
        console.log(`Found ${lotties.length} total lotties. Checking for Untitled records...`);

        let fixedCount = 0;
        for (const lottie of lotties) {
            // Check if name is missing or effectively "Untitled"
            if (!lottie.name || lottie.name === 'Untitled') {
                // Determine best name source
                // Note: .get('title') allows accessing fields not in the official Schema if they exist in DB
                const titleSource = lottie.get('title');
                let newName = titleSource || lottie.filename.replace('.json', '').replace(/_/g, ' ');
                
                // Title case formatting
                newName = newName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                await LottieOverlay.findByIdAndUpdate(lottie._id, { 
                    $set: { name: newName },
                    $unset: { title: "" } // Clean up the legacy field
                });
                
                console.log(`  ✅ Fixed: ${lottie.filename} -> "${newName}"`);
                fixedCount++;
            }
        }

        console.log(`\n🎉 Recovery Complete! Fixed ${fixedCount} records.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Recovery Failed:', err);
        process.exit(1);
    }
}

fixLotties();
