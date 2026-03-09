import mongoose, { Schema } from 'mongoose';
import { trackChanges } from './trackChanges';

const LocalizedGreeting = { text: { type: String, trim: true } };
const GreetingSchema = new Schema({
    text: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    vibes: [{ type: Schema.Types.ObjectId, ref: 'Vibe' }],
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,
    translations: { hi: LocalizedGreeting, mr: LocalizedGreeting, gu: LocalizedGreeting, bn: LocalizedGreeting, ta: LocalizedGreeting, te: LocalizedGreeting, kn: LocalizedGreeting, ml: LocalizedGreeting }
}, { timestamps: true });
GreetingSchema.plugin(trackChanges);
export const Greeting = mongoose.models.Greeting || mongoose.model('Greeting', GreetingSchema);
