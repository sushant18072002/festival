const mongoose = require('./mongoose_provider');
const { Schema } = mongoose;
const trackChanges = require('./trackChanges');

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
    created_at: { type: Date, default: Date.now }
}, { timestamps: true });

TagSchema.plugin(trackChanges);

module.exports = mongoose.models.Tag || mongoose.model('Tag', TagSchema);
