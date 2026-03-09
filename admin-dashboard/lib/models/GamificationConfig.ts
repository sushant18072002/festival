import mongoose, { Schema } from 'mongoose';

const AvatarTierSchema = new Schema({
    name: { type: String, required: true },
    baseKarma: { type: Number, required: true },
    paths: [{ type: String }],
}, { _id: false });

const TrophySchema = new Schema({
    name: { type: String, required: true },
    icon: { type: String, default: '🏆' },
    description: { type: String },
    unlockRuleType: { type: String, enum: ['karma', 'explore', 'share', 'streak', 'signup', 'time'], default: 'karma' },
    unlockThreshold: { type: Number, default: 100 },
}, { _id: false });

const GamificationConfigSchema = new Schema({
    version: { type: Number, default: 1, unique: true },
    avatarTiers: [AvatarTierSchema],
    trophies: [TrophySchema],
}, { timestamps: true });
export const GamificationConfig = mongoose.models.GamificationConfig || mongoose.model('GamificationConfig', GamificationConfigSchema);
