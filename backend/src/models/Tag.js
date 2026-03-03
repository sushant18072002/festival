const mongoose = require('mongoose');
const { Schema } = mongoose;
const trackChanges = require('../middleware/trackChanges');

const LocalizedString = {
    name: { type: String, required: true, trim: true }
};

const TagSchema = new Schema({
    code: { type: String, required: true, unique: true, trim: true, lowercase: true }, // e.g., 'lights', 'colors'
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

TagSchema.plugin(trackChanges);

module.exports = mongoose.models.Tag || mongoose.model('Tag', TagSchema);
