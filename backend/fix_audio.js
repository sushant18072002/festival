const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './.env' });
const Event = require('./src/models/Event');
const AmbientAudio = require('./src/models/AmbientAudio');

const audioMapFixes = {
    'om-namah-shivaya': 'shiva-chant-om-namah-shivaya',
    'holi-celebration': 'holi-dhol-beats',
    'diwali-diya': 'diwali-aarti-bells',
    'garba-navratri': 'garba-dandiya-beat',
    'ganpati-aarti': 'ganesha-aarti',
    'krishna-flute': 'krishna-flute-melody',
    'ram-navami-bhajan': 'om-bells', // Fallback to om-bells for any religious event missing audio
    'buddha-purnima': 'buddha-meditation'
};

async function fixAudioSlugs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Fix MongoDB Events
        const audios = await AmbientAudio.find({});
        const validAudioSlugs = audios.reduce((acc, a) => {
            acc[a.slug] = a._id;
            return acc;
        }, {});

        const events = await Event.find({});
        let count = 0;

        // We also need to fix events_2026.json since it's the source of truth
        const jsonPath = path.join(__dirname, 'data', 'events_2026.json');
        let rawData = fs.readFileSync(jsonPath, 'utf8');
        let jsonData = JSON.parse(rawData);

        for (let evtKey in audioMapFixes) {
            const correctSlug = audioMapFixes[evtKey];
            // Regex replace the wrong slug with the right one in the JSON
            rawData = rawData.replace(new RegExp(`"ambient_audio_slug"\\s*:\\s*"${evtKey}"`, 'g'), `"ambient_audio_slug": "${correctSlug}"`);
        }
        fs.writeFileSync(jsonPath, rawData, 'utf8');
        console.log('Fixed events_2026.json JSON source');

        // Now re-seed audio references for events from the JSON so they reflect immediately in DB
        const updatedJsonData = JSON.parse(rawData);
        for (const jsonEvt of updatedJsonData) {
            if (jsonEvt.ambient_audio_slug && validAudioSlugs[jsonEvt.ambient_audio_slug]) {
                await Event.updateOne(
                    { slug: jsonEvt.slug },
                    { $set: { ambient_audio: validAudioSlugs[jsonEvt.ambient_audio_slug] } }
                );
                count++;
            }
        }

        console.log(`Assigned ambient_audio correctly for ${count} events.`);
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

fixAudioSlugs();
