const mongoose = require('./mongoose_provider');
const { Schema } = mongoose;

const DeployConfigSchema = new Schema({
    key: { type: String, default: 'server_deployment', unique: true },
    base_image_url: { type: String, default: 'https://cdn.example.com/' },
    environment: { type: String, enum: ['local', 'production'], default: 'local' }
}, { timestamps: true });

module.exports = mongoose.models.DeployConfig || mongoose.model('DeployConfig', DeployConfigSchema);
