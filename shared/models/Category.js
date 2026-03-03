const mongoose = require('./mongoose_provider');
const { Schema } = mongoose;
const trackChanges = require('./trackChanges');

const LocalizedString = {
    name: { type: String, required: true, trim: true }
};

const CategorySchema = new Schema({
    code: { type: String, required: true, unique: true, trim: true, lowercase: true }, // e.g., 'festival', 'national'
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
    created_at: { type: Date, default: Date.now }
}, { timestamps: true });

CategorySchema.plugin(trackChanges);

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);
