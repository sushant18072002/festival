import mongoose, { Schema } from 'mongoose';
import { trackChanges } from './trackChanges';

const LocalizedStr = { name: { type: String, trim: true } };
const VibeSchema = new Schema({
    code: { type: String, required: true, unique: true, trim: true, lowercase: true },
    label: { type: String, required: true },
    emoji: String,
    translations: { en: LocalizedStr, hi: LocalizedStr, mr: LocalizedStr, gu: LocalizedStr, bn: LocalizedStr, ta: LocalizedStr, te: LocalizedStr, kn: LocalizedStr, ml: LocalizedStr },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
}, { timestamps: true });
VibeSchema.plugin(trackChanges);
export const Vibe = mongoose.models.Vibe || mongoose.model('Vibe', VibeSchema);
