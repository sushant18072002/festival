const mongoose = require('mongoose');
const { Schema } = mongoose;
const trackChanges = require('../middleware/trackChanges');

/**
 * AmbientAudio — Master library of festival ambient sounds.
 *
 * Strategy: Store audio once, reference from multiple events.
 * Audio lives on S3 under: audio/originals/<slug>.<ext>
 * HLS streams (optional): audio/hls/<slug>/index.m3u8
 */
const AmbientAudioSchema = new Schema({
    // ── Identity ──────────────────────────────────────────────────────────────
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    attribution: { type: String, trim: true },   // "Recorded at Siddhivinayak Mandir"

    // ── Storage ───────────────────────────────────────────────────────────────
    filename: { type: String, required: true },  // "diwali_bells.aac"
    s3_key: { type: String, required: true },    // "audio/originals/diwali_bells.aac"
    mime_type: {
        type: String,
        enum: ['audio/aac', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4'],
        default: 'audio/aac'
    },
    file_size_bytes: { type: Number, default: 0 },
    duration_seconds: { type: Number, default: 0 },
    is_s3_uploaded: { type: Boolean, default: false },

    // ── Classification ────────────────────────────────────────────────────────
    category: {
        type: String,
        enum: ['devotional', 'folk', 'classical', 'nature', 'mantras', 'instrumental', 'celebration'],
        default: 'devotional'
    },
    mood: {
        type: String,
        enum: ['peaceful', 'joyful', 'spiritual', 'festive', 'meditative'],
        default: 'spiritual'
    },
    language: {
        type: String,
        enum: ['neutral', 'hi', 'mr', 'sa', 'ta', 'te', 'kn', 'ml', 'gu', 'bn'],
        default: 'neutral'
    },
    tags: [{ type: String }],  // ["aarti", "bells", "diwali"]

    // ── Playback ──────────────────────────────────────────────────────────────
    is_loopable: { type: Boolean, default: true },
    fade_in_ms: { type: Number, default: 1500 },
    fade_out_ms: { type: Number, default: 2000 },
    default_volume: { type: Number, default: 0.6 },  // 0.0 - 1.0

    // ── Status ────────────────────────────────────────────────────────────────
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,

    // ── Usage Tracking ────────────────────────────────────────────────────────
    plays_count: { type: Number, default: 0 },
    linked_events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],

    created_at: { type: Date, default: Date.now },
}, { timestamps: true });

AmbientAudioSchema.plugin(trackChanges);

// Index for common queries
AmbientAudioSchema.index({ category: 1, mood: 1, is_active: 1 });
AmbientAudioSchema.index({ slug: 1 });

module.exports = mongoose.models.AmbientAudio || mongoose.model('AmbientAudio', AmbientAudioSchema);
