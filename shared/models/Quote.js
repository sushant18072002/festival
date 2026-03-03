const mongoose = require('./mongoose_provider');
const { Schema } = mongoose;
const trackChanges = require('./trackChanges');

// Localized Content for Quotes (text + author + source)
const LocalizedQuoteContent = {
    text: { type: String, trim: true },
    author: { type: String, trim: true },
    source: { type: String, trim: true }
};

const QuoteSchema = new Schema({
    // --- Core ---
    text: { type: String, required: true, trim: true },  // "Be the change you wish to see..."
    slug: { type: String, unique: true, sparse: true },
    author: { type: String, trim: true },                 // "Mahatma Gandhi"
    source: { type: String, trim: true },                 // "Speech at Sabarmati, 1930"

    // --- Taxonomy ---
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    vibes: [{ type: Schema.Types.ObjectId, ref: 'Vibe' }],

    // --- Featured (for Quote of the Day rotation) ---
    is_featured: { type: Boolean, default: false },

    // --- Status ---
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,

    // --- Localization (8 languages) ---
    translations: {
        hi: LocalizedQuoteContent,
        mr: LocalizedQuoteContent,
        gu: LocalizedQuoteContent,
        bn: LocalizedQuoteContent,
        ta: LocalizedQuoteContent,
        te: LocalizedQuoteContent,
        kn: LocalizedQuoteContent,
        ml: LocalizedQuoteContent
    }
}, { timestamps: true });

QuoteSchema.plugin(trackChanges);

module.exports = mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);
