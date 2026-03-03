const mongoose = require('mongoose');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const restoreDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/utsav_share');
        console.log('MongoDB Connected');

        // Parse args
        const args = process.argv.slice(2);
        const backupArgIndex = args.indexOf('--backup');
        const modeArgIndex = args.indexOf('--mode');

        const targetBackup = backupArgIndex !== -1 ? args[backupArgIndex + 1] : null;
        const mode = modeArgIndex !== -1 ? args[modeArgIndex + 1] : 'wipe'; // 'wipe' or 'merge'

        // Find backup to restore
        const backupsDir = path.join(__dirname, '../../backups');
        if (!await fs.pathExists(backupsDir)) {
            console.error('No backups found locally.');
            process.exit(1);
        }

        let backupPath;
        if (targetBackup) {
            backupPath = path.join(backupsDir, targetBackup);
            if (!await fs.pathExists(backupPath)) {
                console.error(`Backup ${targetBackup} not found.`);
                process.exit(1);
            }
        } else {
            const dirs = await fs.readdir(backupsDir);
            // Sort by folder name (which is timestamped YYYY-MM-DD_HH-mm-ss)
            const sortedDirs = dirs.filter(d => d.includes('_')).sort().reverse();
            if (sortedDirs.length === 0) {
                // Fallback to old format if no timestamped ones exist
                const oldDirs = dirs.sort().reverse();
                if (oldDirs.length === 0) {
                    console.error('No backup folders found.');
                    process.exit(1);
                }
                backupPath = path.join(backupsDir, oldDirs[0]);
            } else {
                backupPath = path.join(backupsDir, sortedDirs[0]);
            }
        }

        console.log(`Restoring from: ${path.basename(backupPath)} (Mode: ${mode})`);

        const files = await fs.readdir(backupPath);

        for (const file of files) {
            if (!file.endsWith('.json')) continue;

            const collectionName = path.parse(file).name;
            const data = await fs.readJson(path.join(backupPath, file));

            if (data.length === 0) {
                console.log(`Skipping ${collectionName} (empty)`);
                continue;
            }

            const collection = mongoose.connection.db.collection(collectionName);

            // Fix ObjectId and Date restoration
            const { ObjectId } = require('mongodb');
            const fixedData = data.map(doc => {
                if (doc._id && typeof doc._id === 'string' && doc._id.length === 24) {
                    doc._id = new ObjectId(doc._id);
                }
                ['created_at', 'updated_at', 'date', 'deleted_at'].forEach(field => {
                    if (doc[field]) doc[field] = new Date(doc[field]);
                });
                return doc;
            });

            if (mode === 'wipe') {
                await collection.deleteMany({});
                await collection.insertMany(fixedData);
                console.log(`Restored (Wipe): ${collectionName} (${fixedData.length} docs)`);
            } else {
                // Merge (Upsert)
                const operations = fixedData.map(doc => ({
                    updateOne: {
                        filter: { _id: doc._id },
                        update: { $set: doc },
                        upsert: true
                    }
                }));
                if (operations.length > 0) {
                    await collection.bulkWrite(operations);
                }
                console.log(`Restored (Merge): ${collectionName} (${fixedData.length} docs processed)`);
            }
        }

        console.log('Restore Complete!');
        process.exit(0);
    } catch (err) {
        console.error('Restore Failed:', err);
        process.exit(1);
    }
};

restoreDB();
