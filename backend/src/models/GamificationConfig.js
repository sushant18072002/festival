const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const avatarTierSchema = new Schema({
    name: { type: String, required: true },
    baseKarma: { type: Number, required: true },
    paths: [{ type: String, required: true }] // Array of asset paths
}, { _id: false });

const trophySchema = new Schema({
    name: { type: String, required: true },
    icon: { type: String, required: true },
    description: { type: String, required: true },
    // Rule defining how this is unlocked (interpreted by Flutter)
    unlockRuleType: { type: String, enum: ['karma', 'share', 'explore', 'streak', 'time', 'signup'], required: true },
    unlockThreshold: { type: Number, required: true }
}, { _id: false });

// This defines the singular global gamification configuration object
const gamificationConfigSchema = new Schema({
    version: { type: Number, required: true, default: 1 },
    isActive: { type: Boolean, default: true },
    avatarTiers: [avatarTierSchema],
    trophies: [trophySchema]
}, {
    timestamps: true,
    collection: 'gamification_configs'
});

module.exports = mongoose.models.GamificationConfig || mongoose.model('GamificationConfig', gamificationConfigSchema);
