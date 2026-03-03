const mongoose = require('./mongoose_provider');
const { Schema } = mongoose;
const trackChanges = require('./trackChanges');

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

    // --- Taxonomy ---
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    vibes: [{ type: Schema.Types.ObjectId, ref: 'Vibe' }],

    // --- Event Link ---
    event_id: { type: Schema.Types.ObjectId, ref: 'Event' },

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
