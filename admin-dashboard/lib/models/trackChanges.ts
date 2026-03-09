import mongoose from 'mongoose';

export function trackChanges(schema: any) {
    const updateState = async () => {
        try {
            const SystemState = mongoose.models.SystemState;
            if (SystemState) {
                await SystemState.findOneAndUpdate(
                    { key: 'main' },
                    { $set: { last_modified_at: new Date() } },
                    { upsert: true }
                );
            }
        } catch (_) { /* non-critical */ }
    };
    ['save', 'findOneAndUpdate', 'updateOne', 'updateMany'].forEach(hook => {
        schema.post(hook, () => { updateState(); });
    });
}
