import mongoose, { Schema } from 'mongoose';
import { trackChanges } from './trackChanges';

const LocalizedStr = { name: { type: String, trim: true } };
const CategorySchema = new Schema({
    code: { type: String, required: true, unique: true, trim: true, lowercase: true },
    icon: String,
    color: String,
    translations: { en: LocalizedStr, hi: LocalizedStr, mr: LocalizedStr, gu: LocalizedStr, bn: LocalizedStr, ta: LocalizedStr, te: LocalizedStr, kn: LocalizedStr, ml: LocalizedStr },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
}, { timestamps: true });
CategorySchema.plugin(trackChanges);
export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
