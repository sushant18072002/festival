const mongoose = require('mongoose');
const { Schema } = mongoose;
const trackChanges = require('../middleware/trackChanges');

const LocalizedString = {
    name: { type: String, required: true, trim: true }
};

const VibeSchema = new Schema({
    code: { type: String, required: true, unique: true, trim: true, lowercase: true }, // e.g., 'spiritual', 'joyful'
    icon: { type: String }, // Lucide icon name or URL
    color: { type: String }, // Hex code or Tailwind class
    translations: {
        en: LocalizedString,
        hi: LocalizedString,
        mr: LocalizedString,
        gu: LocalizedString,
        bn: LocalizedString,
        ta: LocalizedString,
        te: LocalizedString,
        kn: LocalizedString,
        ml: LocalizedString
    },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
}, { timestamps: true });

VibeSchema.plugin(trackChanges);

module.exports = mongoose.models.Vibe || mongoose.model('Vibe', VibeSchema);
