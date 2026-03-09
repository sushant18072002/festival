import mongoose, { Schema } from 'mongoose';
import { trackChanges } from './trackChanges';

const LocalizedHomeGreeting = { text: { type: String, trim: true } };
const HomeGreetingSchema = new Schema({
    type: { type: String, required: true, enum: ['morning', 'afternoon', 'evening', 'night', 'festival', 'general'], default: 'general' },
    tags: [{ type: String, trim: true, lowercase: true }],
    text: { type: String, required: true, trim: true },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,
    translations: { hi: LocalizedHomeGreeting, mr: LocalizedHomeGreeting, gu: LocalizedHomeGreeting, bn: LocalizedHomeGreeting, ta: LocalizedHomeGreeting, te: LocalizedHomeGreeting, kn: LocalizedHomeGreeting, ml: LocalizedHomeGreeting }
}, { timestamps: true });
HomeGreetingSchema.plugin(trackChanges);
export const HomeGreeting = mongoose.models.HomeGreeting || mongoose.model('HomeGreeting', HomeGreetingSchema);
