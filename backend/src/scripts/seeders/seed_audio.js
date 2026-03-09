/**
 * seed_audio.js — Seeds the AmbientAudio master library in MongoDB.
 *
 * This script creates AmbientAudio master records linked to their festival events.
 * Audio files need to be placed in: backend/assets/audio/ before running upload_audio.js
 *
 * Usage:
 *   node src/scripts/seed_audio.js
 *   node src/scripts/seed_audio.js --clean   (drop existing audio records first)
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const connectDB = require('../../config/db');
const AmbientAudio = require('../../models/AmbientAudio');
const Event = require('../../models/Event');

// ─── Curated Festival Audio Library ──────────────────────────────────────────
// Free/CC0 sources recommended:
//   - freesound.org (CC0 filter)
//   - pixabay.com/music
//   - soundbible.com
//   - traditional recordings in public domain
//
// Place audio files in: backend/assets/audio/<filename>
// Then run: node src/scripts/upload_audio.js
// ─────────────────────────────────────────────────────────────────────────────

const AUDIO_CATALOG = [
    {
        slug: 'diwali-lakshmi-aarti',
        title: 'Lakshmi Aarti – Diwali',
        description: 'Classical Lakshmi Aarti bells and devotional chanting for Diwali Puja',
        attribution: 'Traditional Indian devotional music, public domain',
        filename: 'diwali_ambient.mp3',
        s3_key: 'audio/originals/diwali_ambient.mp3',
        mime_type: 'audio/mpeg',
        duration_seconds: 180,
        category: 'devotional',
        mood: 'spiritual',
        language: 'hi',
        tags: ['diwali', 'lakshmi', 'aarti', 'bells', 'puja'],
        is_loopable: true,
        fade_in_ms: 2000,
        fade_out_ms: 3000,
        default_volume: 0.6,
        event_slugs: ['diwali'],
    },
    {
        slug: 'holi-folk-music',
        title: 'Holi Folk Dhol Beats',
        description: 'Traditional Holi dhol and folk celebration music',
        attribution: 'Traditional Holi folk music, public domain',
        filename: 'holi_ambient.mp3',
        s3_key: 'audio/originals/holi_ambient.mp3',
        mime_type: 'audio/mpeg',
        duration_seconds: 240,
        category: 'folk',
        mood: 'festive',
        language: 'neutral',
        tags: ['holi', 'dhol', 'folk', 'colors', 'spring'],
        is_loopable: true,
        fade_in_ms: 1000,
        fade_out_ms: 2000,
        default_volume: 0.5,
        event_slugs: ['holi'],
    },
    {
        slug: 'ganesh-chaturthi-aarti',
        title: 'Ganpati Aarti',
        description: 'Sukhkarta Dukhharta – the sacred Ganesh Aarti',
        attribution: 'Traditional Marathi devotional music, public domain',
        filename: 'ganesh_chaturthi_ambient.mp3',
        s3_key: 'audio/originals/ganesh_chaturthi_ambient.mp3',
        mime_type: 'audio/mpeg',
        duration_seconds: 200,
        category: 'devotional',
        mood: 'joyful',
        language: 'mr',
        tags: ['ganesh', 'aarti', 'chaturthi', 'marathi'],
        is_loopable: false,
        fade_in_ms: 1500,
        fade_out_ms: 2500,
        default_volume: 0.65,
        event_slugs: ['ganesh-chaturthi'],
    },
    {
        slug: 'durga-puja-dhak',
        title: 'Durga Puja Dhak Drums',
        description: 'The iconic dhak drums that define the spirit of Durga Puja',
        attribution: 'Traditional Bengali percussion, public domain',
        filename: 'dussehra_ambient.mp3',
        s3_key: 'audio/originals/dussehra_ambient.mp3',
        mime_type: 'audio/mpeg',
        duration_seconds: 210,
        category: 'devotional',
        mood: 'festive',
        language: 'neutral',
        tags: ['durga', 'puja', 'dhak', 'bengali', 'navratri'],
        is_loopable: true,
        fade_in_ms: 500,
        fade_out_ms: 2000,
        default_volume: 0.55,
        event_slugs: ['durga-puja', 'navratri'],
    },
    {
        slug: 'navratri-garba',
        title: 'Navratri Garba Folk Rhythm',
        description: 'Traditional Garba folk music for Navratri celebrations',
        attribution: 'Traditional Gujarati folk music, public domain',
        filename: 'navratri_ambient.mp3',
        s3_key: 'audio/originals/navratri_ambient.mp3',
        mime_type: 'audio/mpeg',
        duration_seconds: 270,
        category: 'folk',
        mood: 'joyful',
        language: 'gu',
        tags: ['navratri', 'garba', 'gujarati', 'dandiya'],
        is_loopable: true,
        fade_in_ms: 1000,
        fade_out_ms: 2000,
        default_volume: 0.5,
        event_slugs: ['navratri'],
    },
    {
        slug: 'eid-nasheed',
        title: 'Eid Mubarak Nasheed',
        description: 'Peaceful Eid nasheed celebrating the joy of Eid al-Fitr',
        attribution: 'Traditional Islamic devotional music',
        filename: 'eid_ul_fitr_ambient.mp3',
        s3_key: 'audio/originals/eid_ul_fitr_ambient.mp3',
        mime_type: 'audio/mpeg',
        duration_seconds: 190,
        category: 'devotional',
        mood: 'peaceful',
        language: 'neutral',
        tags: ['eid', 'nasheed', 'celebration', 'prayer'],
        is_loopable: false,
        fade_in_ms: 2000,
        fade_out_ms: 3000,
        default_volume: 0.6,
        event_slugs: ['eid-ul-fitr', 'eid-al-adha'],
    },
    {
        slug: 'christmas-carols',
        title: 'Christmas Carols',
        description: 'Traditional Christmas carols and bells',
        attribution: 'Traditional western folk music, public domain',
        filename: 'christmas_ambient.mp3',
        s3_key: 'audio/originals/christmas_ambient.mp3',
        mime_type: 'audio/mpeg',
        duration_seconds: 220,
        category: 'folk',
        mood: 'joyful',
        language: 'neutral',
        tags: ['christmas', 'carols', 'bells', 'joy'],
        is_loopable: true,
        fade_in_ms: 1500,
        fade_out_ms: 2500,
        default_volume: 0.6,
        event_slugs: ['christmas'],
    },
    {
        slug: 'morning-temple-bells',
        title: 'Temple Morning Bells',
        description: 'Peaceful morning temple bells suited for any devotional context',
        attribution: 'Traditional Indian temple soundscape, public domain',
        filename: 'raksha_bandhan_ambient.mp3',
        s3_key: 'audio/originals/raksha_bandhan_ambient.mp3',
        mime_type: 'audio/mpeg',
        duration_seconds: 120,
        category: 'devotional',
        mood: 'meditative',
        language: 'neutral',
        tags: ['temple', 'bells', 'morning', 'peaceful', 'generic'],
        is_loopable: true,
        fade_in_ms: 3000,
        fade_out_ms: 3000,
        default_volume: 0.4,
        event_slugs: ['raksha-bandhan'],
    },
    {
        slug: 'guru-gobind-singh-shabad',
        title: 'Waheguru Shabad Kirtan',
        description: 'Sacred Gurbani Shabad Kirtan for Sikh festivals',
        attribution: 'Traditional Sikh devotional music, public domain',
        filename: 'baisakhi_ambient.mp3',
        s3_key: 'audio/originals/baisakhi_ambient.mp3',
        mime_type: 'audio/mpeg',
        duration_seconds: 300,
        category: 'devotional',
        mood: 'spiritual',
        language: 'neutral',
        tags: ['sikh', 'kirtan', 'shabad', 'waheguru', 'gurbani'],
        is_loopable: true,
        fade_in_ms: 2000,
        fade_out_ms: 4000,
        default_volume: 0.55,
        event_slugs: ['guru-gobind-singh-jayanti', 'guru-nanak-jayanti', 'baisakhi'],
    },
    {
        slug: 'onam-sadya-folk',
        title: 'Onam Boat Race & Folk Music',
        description: 'Cheerful Kerala folk music for the harvest festival of Onam',
        attribution: 'Traditional Kerala folk music, public domain',
        filename: 'onam_ambient.mp3',
        s3_key: 'audio/originals/onam_ambient.mp3',
        mime_type: 'audio/mpeg',
        duration_seconds: 195,
        category: 'folk',
        mood: 'joyful',
        language: 'ml',
        tags: ['onam', 'kerala', 'folk', 'harvest', 'boat-race'],
        is_loopable: true,
        fade_in_ms: 1000,
        fade_out_ms: 2000,
        default_volume: 0.55,
        event_slugs: ['onam'],
    },
    {
        slug: 'makar-sankranti-folk',
        title: 'Sankranti Harvest Folk',
        description: 'Traditional harvest folk music for Makar Sankranti / Pongal',
        attribution: 'Traditional folk music, public domain',
        filename: 'raksha_bandhan_ambient.mp3', // Note: fallback if sankranti isn't present
        s3_key: 'audio/originals/raksha_bandhan_ambient.mp3',
        mime_type: 'audio/mpeg',
        duration_seconds: 180,
        category: 'folk',
        mood: 'joyful',
        language: 'neutral',
        tags: ['sankranti', 'pongal', 'harvest', 'folk'],
        is_loopable: true,
        fade_in_ms: 1000,
        fade_out_ms: 2000,
        default_volume: 0.5,
        event_slugs: ['makar-sankranti', 'pongal'],
    },
];

// ─── Main Seeder ──────────────────────────────────────────────────────────────

const seed = async () => {
    const isClean = process.argv.includes('--clean');

    try {
        await connectDB();
        console.log('🎵 Connected to MongoDB. Starting audio seed...\n');

        if (isClean) {
            console.log('🗑  --clean flag detected: Dropping existing AmbientAudio records...');
            await AmbientAudio.deleteMany({});
            console.log('   Done.\n');
        }

        let created = 0;
        let skipped = 0;
        let linked = 0;

        for (const audioData of AUDIO_CATALOG) {
            const { event_slugs, ...audioFields } = audioData;

            const prefix = `${process.env.S3_BASE_PATH || 'Utsav'}/${process.env.DEPLOY_ENV || 'stage'}/`;
            const fullS3Key = audioFields.s3_key.startsWith(prefix) ? audioFields.s3_key : `${prefix}${audioFields.s3_key}`;
            audioFields.s3_key = fullS3Key;

            // ── Resolve linked events ─────────────────────────────────────────
            const linkedEventIds = [];
            if (event_slugs && event_slugs.length > 0) {
                for (const slug of event_slugs) {
                    const event = await Event.findOne({ slug, is_deleted: { $ne: true } });
                    if (event) {
                        linkedEventIds.push(event._id);
                    } else {
                        console.warn(`  ⚠  Event not found for slug: "${slug}" (audio: ${audioData.slug})`);
                    }
                }
            }

            // ── Upsert audio record ───────────────────────────────────────────
            const existing = await AmbientAudio.findOne({ slug: audioData.slug });
            if (existing && !isClean) {
                // Update linked_events if changed
                await AmbientAudio.updateOne(
                    { slug: audioData.slug },
                    { $set: { linked_events: linkedEventIds } }
                );
                console.log(`  ↻  Skipped (exists): ${audioData.slug} | Updated links: [${event_slugs.join(', ')}]`);
                skipped++;
            } else {
                await AmbientAudio.create({ ...audioFields, linked_events: linkedEventIds });
                console.log(`  ✓  Created: ${audioData.slug} → linked to [${event_slugs.join(', ') || 'none'}]`);
                created++;
            }

            // ── Link back to Event.ambient_audio ─────────────────────────────
            for (const eventId of linkedEventIds) {
                const audio = await AmbientAudio.findOne({ slug: audioData.slug });
                if (audio) {
                    await Event.updateOne(
                        { _id: eventId, 'ambient_audio.s3_key': { $ne: audioFields.s3_key } },
                        {
                            $set: {
                                ambient_audio: {
                                    filename: audioData.filename,
                                    s3_key: audioFields.s3_key,
                                    duration_seconds: audioData.duration_seconds,
                                    title: audioData.title,
                                }
                            }
                        }
                    );
                    linked++;
                }
            }
        }

        console.log(`\n✅ Audio seed complete!`);
        console.log(`   Created: ${created} | Skipped: ${skipped} | Event links updated: ${linked}`);
        console.log(`\n📋 Next step: Place audio files in backend/assets/audio/ then run:`);
        console.log(`   node src/scripts/upload_audio.js`);

    } catch (err) {
        console.error('❌ Audio seed failed:', err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seed();
