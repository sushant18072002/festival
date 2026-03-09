import mongoose, { Schema } from 'mongoose';
import { trackChanges } from './trackChanges';

const RootTranslation = { title: { type: String, trim: true }, description: { type: String, trim: true } };
const FactTranslation = { fact: { type: String, trim: true } };
const RitualStepTranslation = { title: { type: String, trim: true }, description: { type: String, trim: true } };
const RecipeTranslation = { name: { type: String, trim: true }, description: { type: String, trim: true } };

const EventSchema = new Schema({
    slug: { type: String, unique: true, sparse: true },
    title: { type: String, required: true },
    description: String,
    wiki_link: String,
    lottie_overlay: { type: Schema.Types.ObjectId, ref: 'LottieOverlay' },
    notification_templates: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    date: Date,
    dates: [{ year: Number, date: Date }],
    priority: { type: Number, default: 0 },
    vibes: [{ type: Schema.Types.ObjectId, ref: 'Vibe' }],
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    mantras: [{ type: Schema.Types.ObjectId, ref: 'Mantra' }],
    quotes: [{ type: Schema.Types.ObjectId, ref: 'Quote' }],
    greetings: [{ type: Schema.Types.ObjectId, ref: 'Greeting' }],
    images: [{ type: Schema.Types.ObjectId, ref: 'Image' }],
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,
    translations: { hi: RootTranslation, mr: RootTranslation, gu: RootTranslation, bn: RootTranslation, ta: RootTranslation, te: RootTranslation, kn: RootTranslation, ml: RootTranslation },
    historical_significance: [{
        year: Number, fact: String, source: String,
        translations: { hi: FactTranslation, mr: FactTranslation, gu: FactTranslation, bn: FactTranslation, ta: FactTranslation, te: FactTranslation, kn: FactTranslation, ml: FactTranslation }
    }],
    ritual_steps: [{
        order: { type: Number, required: true }, title: { type: String, required: true },
        description: String, timing: String, items_needed: [{ type: String }],
        translations: { hi: RitualStepTranslation, mr: RitualStepTranslation, gu: RitualStepTranslation, bn: RitualStepTranslation, ta: RitualStepTranslation, te: RitualStepTranslation, kn: RitualStepTranslation, ml: RitualStepTranslation }
    }],
    muhurat: {
        puja_time: String, type: { type: String }, description: String,
        translations: { hi: { puja_time: String, type: { type: String }, description: String }, mr: { puja_time: String, type: { type: String }, description: String } }
    },
    ambient_audio: { type: Schema.Types.ObjectId, ref: 'AmbientAudio' },
    countdown_config: { enabled: { type: Boolean, default: true }, prep_days: { type: Number, default: 3 }, show_hours: { type: Boolean, default: true } },
    recipes: [{
        name: String, description: String, ingredients: [{ type: String }], steps: [{ type: String }],
        translations: { hi: RecipeTranslation, mr: RecipeTranslation, gu: RecipeTranslation, bn: RecipeTranslation, ta: RecipeTranslation, te: RecipeTranslation, kn: RecipeTranslation, ml: RecipeTranslation }
    }],
    dress_guide: { description: String, colors: [{ type: String }], translations: { hi: { description: String }, mr: { description: String } } },
    playlist_links: [{ platform: { type: String, enum: ['spotify', 'youtube', 'apple_music'] }, url: String, title: String }]
}, { timestamps: true });
EventSchema.plugin(trackChanges);
export const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
