const mongoose = require('mongoose');
const { Schema } = mongoose;

const AppConfigSchema = new Schema({
    key: { type: String, default: 'mobile_app', unique: true },
    support_email: { type: String, default: 'support@example.com' },
    privacy_policy_url: { type: String, default: 'https://example.com/privacy' },
    terms_url: { type: String, default: 'https://example.com/terms' },
    social_links: {
        instagram: String,
        facebook: String,
        twitter: String,
        youtube: String
    },
    contact_phone: String,
    about_us_url: String,
    share_app_message: { type: String, default: 'Check out this amazing Festival App!' },
    app_store_url: String,
    play_store_url: String
}, { timestamps: true });

module.exports = mongoose.models.AppConfig || mongoose.model('AppConfig', AppConfigSchema);
