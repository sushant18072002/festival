const mongoose = require('mongoose');
const { Schema } = mongoose;

const AppConfigSchema = new Schema({
    key: { type: String, default: 'mobile_app', unique: true },
    support_url: { type: String, default: '' },
    support_email: { type: String, default: 'support@example.com' },
    contact_email: { type: String, default: '' },
    privacy_policy_url: { type: String, default: 'https://example.com/privacy' },
    terms_url: { type: String, default: 'https://example.com/terms' },
    about_us_url: String,
    contact_phone: String,
    share_app_message: { type: String, default: 'Check out this amazing Festival App!' },
    social_links: {
        instagram: String,
        facebook: String,
        twitter: String,
        youtube: String
    },
    store_urls: {
        android: String,
        ios: String
    },
    feature_flags: { type: Map, of: Boolean, default: {} },
    app_store_url: String,
    play_store_url: String
}, { timestamps: true });

module.exports = mongoose.models.AppConfig || mongoose.model('AppConfig', AppConfigSchema);
