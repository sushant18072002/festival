import mongoose, { Schema } from 'mongoose';
import { trackChanges } from './trackChanges';

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
