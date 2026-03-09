import mongoose, { Schema } from 'mongoose';
import { trackChanges } from './trackChanges';

const LocalizedStr = { name: { type: String, trim: true } };
const TagSchema = new Schema({
    code: { type: String, required: true, unique: true, trim: true, lowercase: true },
    translations: { en: LocalizedStr, hi: LocalizedStr, mr: LocalizedStr, gu: LocalizedStr, bn: LocalizedStr, ta: LocalizedStr, te: LocalizedStr, kn: LocalizedStr, ml: LocalizedStr },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
}, { timestamps: true });
TagSchema.plugin(trackChanges);
export const Tag = mongoose.models.Tag || mongoose.model('Tag', TagSchema);
