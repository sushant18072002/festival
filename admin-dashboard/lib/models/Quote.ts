import mongoose, { Schema } from 'mongoose';
import { trackChanges } from './trackChanges';

const LocalizedQuote = { text: { type: String, trim: true }, author: { type: String, trim: true }, source: { type: String, trim: true } };
const QuoteSchema = new Schema({
    text: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true },
    author: { type: String, trim: true },
    source: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    vibes: [{ type: Schema.Types.ObjectId, ref: 'Vibe' }],
    is_featured: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,
    translations: { hi: LocalizedQuote, mr: LocalizedQuote, gu: LocalizedQuote, bn: LocalizedQuote, ta: LocalizedQuote, te: LocalizedQuote, kn: LocalizedQuote, ml: LocalizedQuote }
}, { timestamps: true });
QuoteSchema.plugin(trackChanges);
export const Quote = mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);
