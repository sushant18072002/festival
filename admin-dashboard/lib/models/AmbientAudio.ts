import mongoose, { Schema } from 'mongoose';
import { trackChanges } from './trackChanges';

export const AmbientAudioSchema = new Schema({
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    attribution: { type: String, trim: true },
    filename: { type: String, required: true },
    s3_key: { type: String, required: true },
    mime_type: {
        type: String,
        enum: ['audio/aac', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4'],
        default: 'audio/aac'
    },
    file_size_bytes: { type: Number, default: 0 },
    duration_seconds: { type: Number, default: 0 },
    is_s3_uploaded: { type: Boolean, default: false },
    category: {
        type: String,
        enum: ['devotional', 'folk', 'classical', 'nature', 'mantras', 'instrumental', 'celebration'],
        default: 'devotional',
    },
    mood: {
        type: String,
        enum: ['peaceful', 'joyful', 'spiritual', 'festive', 'meditative'],
        default: 'spiritual',
    },
    language: {
        type: String,
        enum: ['neutral', 'hi', 'mr', 'sa', 'ta', 'te', 'kn', 'ml', 'gu', 'bn'],
        default: 'neutral',
    },
    tags: [{ type: String }],
    is_loopable: { type: Boolean, default: true },
    fade_in_ms: { type: Number, default: 1500 },
    fade_out_ms: { type: Number, default: 2000 },
    default_volume: { type: Number, default: 0.6 },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,
    plays_count: { type: Number, default: 0 },
    linked_events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    created_at: { type: Date, default: Date.now },
}, { timestamps: true });
AmbientAudioSchema.plugin(trackChanges);
export const AmbientAudio = mongoose.models.AmbientAudio || mongoose.model('AmbientAudio', AmbientAudioSchema);
