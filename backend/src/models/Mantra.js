const mongoose = require('mongoose');
const { Schema } = mongoose;
const trackChanges = require('../middleware/trackChanges');

// Localized Content for Mantras (text + transliteration + meaning)
const LocalizedMantraContent = {
    text: { type: String, trim: true },
    transliteration: { type: String, trim: true },
    meaning: { type: String, trim: true }
};

const MantraSchema = new Schema({
    // --- Core ---
    text: { type: String, required: true, trim: true },          // "ॐ नमः शिवाय"
    transliteration: { type: String, trim: true },                // "Om Namah Shivaya"
    meaning: { type: String, trim: true },                        // "I bow to Lord Shiva"
    slug: { type: String, unique: true, sparse: true },
    audio_file: { type: String, trim: true },                     // S3 key: "audio/mantras/om_namah_shivaya.aac"
    language: {
        type: String,
        enum: ['sa', 'hi', 'en', 'mr', 'ta', 'neutral'],
        default: 'sa'                                             // Sanskrit by default
    },

    // --- Taxonomy ---
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    vibes: [{ type: Schema.Types.ObjectId, ref: 'Vibe' }],


    // --- Status ---
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,

    // --- Localization (8 languages) ---
    translations: {
        hi: LocalizedMantraContent,
        mr: LocalizedMantraContent,
        gu: LocalizedMantraContent,
        bn: LocalizedMantraContent,
        ta: LocalizedMantraContent,
        te: LocalizedMantraContent,
        kn: LocalizedMantraContent,
        ml: LocalizedMantraContent
    }
}, { timestamps: true });

MantraSchema.plugin(trackChanges);

module.exports = mongoose.models.Mantra || mongoose.model('Mantra', MantraSchema);
