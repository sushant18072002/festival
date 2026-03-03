/**
 * Self-contained Mongoose model definitions for the Admin Dashboard.
 * These are kept in sync with shared/models/ — do not import @festival/models directly here
 * because Next.js / Turbopack cannot resolve symlinked file: protocol packages outside the project root.
 */

import mongoose, { Schema } from 'mongoose';

// ─── trackChanges middleware ──────────────────────────────────────────────────
function trackChanges(schema: any) {
    const updateState = async () => {
        try {
            const SystemState = mongoose.models.SystemState;
            if (SystemState) {
                await SystemState.findOneAndUpdate(
                    { key: 'main' },
                    { $set: { last_modified_at: new Date() } },
                    { upsert: true }
                );
            }
        } catch (_) { /* non-critical */ }
    };
    ['save', 'findOneAndUpdate', 'updateOne', 'updateMany'].forEach(hook => {
        schema.post(hook, () => { updateState(); });
    });
}

// ─── AppConfig ────────────────────────────────────────────────────────────────
const AppConfigSchema = new Schema({
    key: { type: String, default: 'mobile_app', unique: true },
    base_image_url: String,
    cdn_base_url: String,
    app_store_url: String,
    play_store_url: String,
    social_links: {
        instagram: String,
        twitter: String,
        facebook: String,
    },
    support_email: String,
    privacy_policy_url: String,
    terms_url: String,
}, { timestamps: true });
AppConfigSchema.plugin(trackChanges);
export const AppConfig = mongoose.models.AppConfig || mongoose.model('AppConfig', AppConfigSchema);

// ─── DeployConfig ─────────────────────────────────────────────────────────────
const DeployConfigSchema = new Schema({
    key: { type: String, required: true, unique: true },
    environment: { type: String, enum: ['local', 'stage', 'production'], default: 'local' },
    deploy_env: String,
    s3_base_path: String,
    cloudfront_distribution_id: String,
}, { timestamps: true });
DeployConfigSchema.plugin(trackChanges);
export const DeployConfig = mongoose.models.DeployConfig || mongoose.model('DeployConfig', DeployConfigSchema);

// ─── Category ─────────────────────────────────────────────────────────────────
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

// ─── Tag ──────────────────────────────────────────────────────────────────────
const TagSchema = new Schema({
    code: { type: String, required: true, unique: true, trim: true, lowercase: true },
    translations: { en: LocalizedStr, hi: LocalizedStr, mr: LocalizedStr, gu: LocalizedStr, bn: LocalizedStr, ta: LocalizedStr, te: LocalizedStr, kn: LocalizedStr, ml: LocalizedStr },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
}, { timestamps: true });
TagSchema.plugin(trackChanges);
export const Tag = mongoose.models.Tag || mongoose.model('Tag', TagSchema);

// ─── Vibe ─────────────────────────────────────────────────────────────────────
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

// ─── LottieOverlay ────────────────────────────────────────────────────────────
const LottieOverlaySchema = new Schema({
    name: { type: String, required: true },
    filename: { type: String, required: true, unique: true },
    description: String,
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
}, { timestamps: true });
LottieOverlaySchema.plugin(trackChanges);
export const LottieOverlay = mongoose.models.LottieOverlay || mongoose.model('LottieOverlay', LottieOverlaySchema);

// ─── SystemState ──────────────────────────────────────────────────────────────
const SystemStateSchema = new Schema({
    key: { type: String, required: true, unique: true, default: 'main' },
    is_maintenance_mode: { type: Boolean, default: false },
    last_deployed_at: Date,
    last_modified_at: Date,
    app_version: { type: String, default: '1.0.0' },
    build_number: { type: Number, default: 1 },
}, { timestamps: true });
SystemStateSchema.plugin(trackChanges);
export const SystemState = mongoose.models.SystemState || mongoose.model('SystemState', SystemStateSchema);

// ─── Greeting ─────────────────────────────────────────────────────────────────
const LocalizedGreeting = { text: { type: String, trim: true } };
const GreetingSchema = new Schema({
    text: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    vibes: [{ type: Schema.Types.ObjectId, ref: 'Vibe' }],
    event_id: { type: Schema.Types.ObjectId, ref: 'Event' },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,
    translations: { hi: LocalizedGreeting, mr: LocalizedGreeting, gu: LocalizedGreeting, bn: LocalizedGreeting, ta: LocalizedGreeting, te: LocalizedGreeting, kn: LocalizedGreeting, ml: LocalizedGreeting }
}, { timestamps: true });
GreetingSchema.plugin(trackChanges);
export const Greeting = mongoose.models.Greeting || mongoose.model('Greeting', GreetingSchema);

// ─── Quote ────────────────────────────────────────────────────────────────────
const LocalizedQuote = { text: { type: String, trim: true }, author: { type: String, trim: true }, source: { type: String, trim: true } };
const QuoteSchema = new Schema({
    text: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true },
    author: { type: String, trim: true },
    source: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    vibes: [{ type: Schema.Types.ObjectId, ref: 'Vibe' }],
    event_id: { type: Schema.Types.ObjectId, ref: 'Event' },
    is_featured: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,
    translations: { hi: LocalizedQuote, mr: LocalizedQuote, gu: LocalizedQuote, bn: LocalizedQuote, ta: LocalizedQuote, te: LocalizedQuote, kn: LocalizedQuote, ml: LocalizedQuote }
}, { timestamps: true });
QuoteSchema.plugin(trackChanges);
export const Quote = mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);

// ─── Mantra ───────────────────────────────────────────────────────────────────
const LocalizedMantra = { text: { type: String, trim: true }, transliteration: { type: String, trim: true }, meaning: { type: String, trim: true } };
const MantraSchema = new Schema({
    text: { type: String, required: true, trim: true },
    transliteration: { type: String, trim: true },
    meaning: { type: String, trim: true },
    slug: { type: String, unique: true, sparse: true },
    event_id: { type: Schema.Types.ObjectId, ref: 'Event' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,
    translations: { hi: LocalizedMantra, mr: LocalizedMantra, gu: LocalizedMantra, bn: LocalizedMantra, ta: LocalizedMantra, te: LocalizedMantra, kn: LocalizedMantra, ml: LocalizedMantra }
}, { timestamps: true });
MantraSchema.plugin(trackChanges);
export const Mantra = mongoose.models.Mantra || mongoose.model('Mantra', MantraSchema);

// ─── Event ────────────────────────────────────────────────────────────────────
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
        puja_time: String, type: String, description: String,
        translations: { hi: { puja_time: String, type: String, description: String }, mr: { puja_time: String, type: String, description: String } }
    },
    ambient_audio: { filename: String, s3_key: String, duration_seconds: Number, title: String },
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

// ─── Image ────────────────────────────────────────────────────────────────────
const LocalizedImageContent = { caption: { type: String, trim: true }, share_text: { type: String, trim: true } };
const OverlayConfig = {
    position: { type: String, enum: ['top', 'center', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'], default: 'bottom' },
    font_size: { type: Number, default: 24 }, font_family: { type: String, default: 'DM Serif Display' },
    font_weight: { type: Number, default: 400 }, color: { type: String, default: '#FFFFFF' },
    shadow: { type: Boolean, default: true }, glass_bg: { type: Boolean, default: false },
    glass_opacity: { type: Number, default: 0.2 }, padding: { type: Number, default: 16 },
    animation: { type: String, enum: ['none', 'fade', 'slide-up', 'typewriter'], default: 'none' }
};
const ImageSchema = new Schema({
    filename: { type: String, required: true, unique: true },
    s3_key: { type: String, required: true },
    event_id: { type: Schema.Types.ObjectId, ref: 'Event' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    media_type: { type: String, enum: ['image', 'video', 'gif'], default: 'image' },
    language: { type: String, enum: ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml', 'neutral'], default: 'neutral' },
    mime_type: String,
    is_optimized: { type: Boolean, default: false },
    is_s3_uploaded: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,
    is_standalone: { type: Boolean, default: false },
    standalone_category: { type: String, enum: ['morning', 'spiritual', 'motivational', 'nature', 'gratitude', 'evening', 'weekend'] },
    greeting_id: { type: Schema.Types.ObjectId, ref: 'Greeting' },
    greeting_config: OverlayConfig,
    quote_id: { type: Schema.Types.ObjectId, ref: 'Quote' },
    quote_config: OverlayConfig,
    has_overlay: { type: Boolean, default: false },
    show_watermark: { type: Boolean, default: true },
    dominant_colors: [{ type: String }],
    aspect_ratio: { type: Number, default: 1.0 },
    downloads_count: { type: Number, default: 0 },
    shares_count: { type: Number, default: 0 },
    likes_count: { type: Number, default: 0 },
    caption: String, share_text: String, credits: String,
    translations: {
        hi: { ...LocalizedImageContent, alt_text: String }, mr: { ...LocalizedImageContent, alt_text: String },
        gu: { ...LocalizedImageContent, alt_text: String }, bn: { ...LocalizedImageContent, alt_text: String },
        ta: { ...LocalizedImageContent, alt_text: String }, te: { ...LocalizedImageContent, alt_text: String },
        kn: { ...LocalizedImageContent, alt_text: String }, ml: { ...LocalizedImageContent, alt_text: String }
    },
    created_at: { type: Date, default: Date.now }
}, { timestamps: true });
ImageSchema.plugin(trackChanges);
export const Image = mongoose.models.Image || mongoose.model('Image', ImageSchema);

// ─── AmbientAudio ─────────────────────────────────────────────────────────────
export const AmbientAudioSchema = new Schema({
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    attribution: { type: String, trim: true },
    filename: { type: String, required: true },
    s3_key: { type: String, required: true },
    mime_type: {
        type: String,
        enum: ['audio/aac', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4'],
        default: 'audio/aac'
    },
    file_size_bytes: { type: Number, default: 0 },
    duration_seconds: { type: Number, default: 0 },
    is_s3_uploaded: { type: Boolean, default: false },
    category: {
        type: String,
        enum: ['devotional', 'folk', 'classical', 'nature', 'mantras', 'instrumental', 'celebration'],
        default: 'devotional',
    },
    mood: {
        type: String,
        enum: ['peaceful', 'joyful', 'spiritual', 'festive', 'meditative'],
        default: 'spiritual',
    },
    language: {
        type: String,
        enum: ['neutral', 'hi', 'mr', 'sa', 'ta', 'te', 'kn', 'ml', 'gu', 'bn'],
        default: 'neutral',
    },
    tags: [{ type: String }],
    is_loopable: { type: Boolean, default: true },
    fade_in_ms: { type: Number, default: 1500 },
    fade_out_ms: { type: Number, default: 2000 },
    default_volume: { type: Number, default: 0.6 },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,
    plays_count: { type: Number, default: 0 },
    linked_events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    created_at: { type: Date, default: Date.now },
}, { timestamps: true });
AmbientAudioSchema.plugin(trackChanges);
export const AmbientAudio = mongoose.models.AmbientAudio || mongoose.model('AmbientAudio', AmbientAudioSchema);
