import mongoose, { Schema } from 'mongoose';
import { trackChanges } from './trackChanges';

const LocalizedMantra = { text: { type: String, trim: true }, transliteration: { type: String, trim: true }, meaning: { type: String, trim: true } };
const MantraSchema = new Schema({
    text: { type: String, required: true, trim: true },
    transliteration: { type: String, trim: true },
    meaning: { type: String, trim: true },
    slug: { type: String, unique: true, sparse: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,
    translations: { hi: LocalizedMantra, mr: LocalizedMantra, gu: LocalizedMantra, bn: LocalizedMantra, ta: LocalizedMantra, te: LocalizedMantra, kn: LocalizedMantra, ml: LocalizedMantra }
}, { timestamps: true });
MantraSchema.plugin(trackChanges);
export const Mantra = mongoose.models.Mantra || mongoose.model('Mantra', MantraSchema);
