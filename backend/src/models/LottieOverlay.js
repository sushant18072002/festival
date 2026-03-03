const mongoose = require('mongoose');
const { Schema } = mongoose;
const trackChanges = require('../middleware/trackChanges');

const LottieOverlaySchema = new Schema({
    title: { type: String, required: true }, // E.g., "Holi Color Burst"
    filename: { type: String, required: true, unique: true }, // E.g., "holi.json"
    asset_path: { type: String, required: true }, // E.g., "assets/lottie/holi.json"
    is_active: { type: Boolean, default: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    // Soft Delete
    is_deleted: { type: Boolean, default: false },
    deleted_at: Date,
    created_at: { type: Date, default: Date.now }
}, { timestamps: true });

LottieOverlaySchema.plugin(trackChanges);

module.exports = mongoose.models.LottieOverlay || mongoose.model('LottieOverlay', LottieOverlaySchema);
