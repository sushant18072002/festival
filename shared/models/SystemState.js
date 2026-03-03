const mongoose = require('./mongoose_provider');
const { Schema } = mongoose;

const SystemStateSchema = new Schema({
    key: { type: String, required: true, unique: true, default: 'main' }, // Singleton
    last_backup_at: { type: Date },
    last_deployed_at: { type: Date },
    last_modified_at: { type: Date },
    last_feed_generated_at: { type: Date },
    is_maintenance_mode: { type: Boolean, default: false },
    min_app_version: { type: String, default: '1.0.0' },
    update_url: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.SystemState || mongoose.model('SystemState', SystemStateSchema);
