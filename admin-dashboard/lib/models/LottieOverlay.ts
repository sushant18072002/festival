import mongoose, { Schema } from 'mongoose';
import { trackChanges } from './trackChanges';

const LottieOverlaySchema = new Schema({
    name: { type: String, required: true },
    filename: { type: String, required: true, unique: true },
    description: String,
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
}, { timestamps: true });
LottieOverlaySchema.plugin(trackChanges);
export const LottieOverlay = mongoose.models.LottieOverlay || mongoose.model('LottieOverlay', LottieOverlaySchema);
