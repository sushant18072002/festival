const SystemState = require('../models/SystemState');

module.exports = function trackChanges(schema) {
    const updateTimestamp = async function () {
        try {
            await SystemState.findOneAndUpdate(
                { key: 'main' },
                { $set: { last_modified_at: new Date() } },
                { upsert: true }
            );
        } catch (err) {
            console.error('Error updating last_modified_at:', err);
        }
    };

    schema.post('save', updateTimestamp);
    schema.post('findOneAndUpdate', updateTimestamp);
    schema.post('findOneAndDelete', updateTimestamp);
    schema.post('remove', updateTimestamp);
    schema.post('deleteMany', updateTimestamp);
    schema.post('insertMany', updateTimestamp);
    schema.post('updateOne', updateTimestamp);
    schema.post('updateMany', updateTimestamp);
};
