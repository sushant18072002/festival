import mongoose, { Schema } from 'mongoose';
import { trackChanges } from './trackChanges';

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
