import mongoose, { Schema } from 'mongoose';
import { trackChanges } from './trackChanges';

const DeployConfigSchema = new Schema({
    key: { type: String, required: true, unique: true },
    environment: { type: String, enum: ['local', 'stage', 'production'], default: 'local' },
    deploy_env: String,
    s3_base_path: String,
    cloudfront_distribution_id: String,
}, { timestamps: true });
DeployConfigSchema.plugin(trackChanges);
export const DeployConfig = mongoose.models.DeployConfig || mongoose.model('DeployConfig', DeployConfigSchema);
