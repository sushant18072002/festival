const mongoose = require('mongoose');
const { Schema } = mongoose;
const trackChanges = require('../middleware/trackChanges');

// Localized Content for Home UI text
const LocalizedHomeGreeting = {
    text: { type: String, trim: true } // "Rise and shine ✨"
};

const HomeGreetingSchema = new Schema({
    // Type of greeting: 'morning', 'afternoon', 'evening', 'night', 'festival', 'general'
    type: {
        type: String,
        required: true,
        enum: ['morning', 'afternoon', 'evening', 'night', 'festival', 'general'],
        default: 'general'
    },

    // Optional: If type is 'festival', which specific festival is this for? (e.g., 'diwali', 'holi')
    // This allows the feed generator to prioritize these greetings on those specific days.
    tags: [{ type: String, trim: true, lowercase: true }],

    // English Text (acts as default/fallback)
    text: { type: String, required: true, trim: true },

    // Status
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },

    // Localization (8 Indian languages)
    translations: {
        hi: LocalizedHomeGreeting,
        mr: LocalizedHomeGreeting,
        gu: LocalizedHomeGreeting,
        bn: LocalizedHomeGreeting,
        ta: LocalizedHomeGreeting,
        te: LocalizedHomeGreeting,
        kn: LocalizedHomeGreeting,
        ml: LocalizedHomeGreeting
    }
}, { timestamps: true });

HomeGreetingSchema.plugin(trackChanges);

module.exports = mongoose.models.HomeGreeting || mongoose.model('HomeGreeting', HomeGreetingSchema);
