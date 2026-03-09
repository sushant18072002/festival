const mongoose = require('mongoose');
const { Schema } = mongoose;
const trackChanges = require('../middleware/trackChanges');

// Localized Content for Greetings
const LocalizedGreetingContent = {
    text: { type: String, trim: true }
};

const GreetingSchema = new Schema({
    // --- Core ---
    text: { type: String, required: true, trim: true },  // "Happy Diwali! 🪔"
    slug: { type: String, unique: true, sparse: true },

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
        hi: LocalizedGreetingContent,
        mr: LocalizedGreetingContent,
        gu: LocalizedGreetingContent,
        bn: LocalizedGreetingContent,
        ta: LocalizedGreetingContent,
        te: LocalizedGreetingContent,
        kn: LocalizedGreetingContent,
        ml: LocalizedGreetingContent
    }
}, { timestamps: true });

GreetingSchema.plugin(trackChanges);

module.exports = mongoose.models.Greeting || mongoose.model('Greeting', GreetingSchema);
