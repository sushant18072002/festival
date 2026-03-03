const mongoose = require('./mongoose_provider');
const { Schema } = mongoose;
const trackChanges = require('./trackChanges');

const LocalizedString = {
    name: { type: String, required: true, trim: true }
};

const VibeSchema = new Schema({
    code: { type: String, required: true, unique: true, trim: true, lowercase: true }, // e.g., 'spiritual', 'joyful'
    icon: { type: String }, // Lucide icon name or URL
    color: { type: String }, // Hex code or Tailwind class
    translations: {
        en: LocalizedString,
        hi: { name: String },
        mr: { name: String },
        gu: { name: String },
        bn: { name: String },
        ta: { name: String },
        te: { name: String },
        kn: { name: String },
        ml: { name: String }
    },
    created_at: { type: Date, default: Date.now }
}, { timestamps: true });

VibeSchema.plugin(trackChanges);

module.exports = mongoose.models.Vibe || mongoose.model('Vibe', VibeSchema);
