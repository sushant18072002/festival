const mongoose = require('mongoose');
const { Schema } = mongoose;
const trackChanges = require('../middleware/trackChanges');

// Standardized Localized Content Schema for Images
// Images don't have complex lists, so Field-Mirroring is sufficient.
const LocalizedImageContent = {
    caption: { type: String, trim: true },
    share_text: { type: String, trim: true }
};

const OverlayConfig = {
    // Layout
    position: { type: String, enum: ['top', 'center', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'], default: 'bottom' },
    padding: { type: Number, default: 16 },
    max_width: { type: Number, default: 80 },
    margin_top: { type: Number, default: 0 },
    margin_bottom: { type: Number, default: 0 },
    margin_left: { type: Number, default: 0 },
    margin_right: { type: Number, default: 0 },

    // Typography
    font_size: { type: Number, default: 24 },
    font_family: { type: String, default: 'DM Serif Display' },
    font_weight: { type: Number, default: 400 },
    font_style: { type: String, enum: ['normal', 'italic'], default: 'normal' },
    text_align: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
    letter_spacing: { type: Number, default: 0 },
    line_height: { type: Number, default: 14 }, // e.g. 14 = 1.4

    // Visual
    color: { type: String, default: '#FFFFFF' },
    shadow: { type: Boolean, default: true },
    glass_bg: { type: Boolean, default: false },
    glass_opacity: { type: Number, default: 0.25 },
    glass_blur: { type: Number, default: 8 },

    animation: { type: String, enum: ['none', 'fade', 'slide-up', 'typewriter'], default: 'none' }
};

const ImageSchema = new Schema({
    // --- Metadata ---
    filename: { type: String, required: true, unique: true },
    s3_key: { type: String, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    media_type: {
        type: String,
        enum: ['image', 'video', 'gif'],
        default: 'image'
    },
    language: {
        type: String,
        enum: ['en', 'hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml', 'neutral'],
        default: 'neutral'
    },
    mime_type: String,
    is_optimized: { type: Boolean, default: false },
    is_s3_uploaded: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,

    // --- Standalone Image (not linked to any event) ---
    is_standalone: { type: Boolean, default: false },
    standalone_category: {
        type: String,
        enum: ['morning', 'spiritual', 'motivational', 'nature', 'gratitude', 'evening', 'weekend'],
    },

    // --- Overlay Engine (greeting + quote on image) ---
    greeting_id: { type: Schema.Types.ObjectId, ref: 'Greeting' },
    greeting_config: OverlayConfig,
    quote_id: { type: Schema.Types.ObjectId, ref: 'Quote' },
    quote_config: OverlayConfig,
    has_overlay: { type: Boolean, default: false },
    show_watermark: { type: Boolean, default: true },

    // --- Visual Data ---
    dominant_colors: [{ type: String }],  // Extracted hex colors e.g. ['#FFD700', '#1A0B2E']
    aspect_ratio: { type: Number, default: 1.0 },

    // --- Metrics ---
    downloads_count: { type: Number, default: 0 },
    shares_count: { type: Number, default: 0 },
    likes_count: { type: Number, default: 0 },

    // --- Primary Content (English/Default) ---
    caption: String,
    share_text: String,
    credits: String,

    // --- Localized Content (Field-Mirroring) ---
    translations: {
        hi: { ...LocalizedImageContent, alt_text: String },
        mr: { ...LocalizedImageContent, alt_text: String },
        gu: { ...LocalizedImageContent, alt_text: String },
        bn: { ...LocalizedImageContent, alt_text: String },
        ta: { ...LocalizedImageContent, alt_text: String },
        te: { ...LocalizedImageContent, alt_text: String },
        kn: { ...LocalizedImageContent, alt_text: String },
        ml: { ...LocalizedImageContent, alt_text: String }
    },

    created_at: { type: Date, default: Date.now }
}, { timestamps: true });

ImageSchema.plugin(trackChanges);

module.exports = mongoose.models.Image || mongoose.model('Image', ImageSchema);
