import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { backupId, mode } = req.body;

    if (!backupId || !['wipe', 'merge'].includes(mode)) {
        return res.status(400).json({ success: false, error: 'Invalid parameters' });
    }

    const backendDir = path.join(process.cwd(), '../backend');

    // 1. Auto-Backup First
    console.log('Starting Auto-Backup...');
    exec('npm run backup', { cwd: backendDir }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Auto-Backup failed: ${error}`);
            return res.status(500).json({ success: false, error: 'Auto-Backup failed. Restore aborted.', details: stderr });
        }
        console.log('Auto-Backup complete.');

        // 2. Trigger Restore
        const restoreCommand = `node src/scripts/restore_db.js --backup "${backupId}" --mode ${mode}`;
        console.log(`Executing Restore: ${restoreCommand}`);

        exec(restoreCommand, { cwd: backendDir }, (rError, rStdout, rStderr) => {
            if (rError) {
                console.error(`Restore failed: ${rError}`);
                return res.status(500).json({ success: false, error: rError.message, details: rStderr });
            }
            console.log(`Restore Output: ${rStdout}`);
            res.status(200).json({ success: true, message: 'Restore completed successfully', output: rStdout });
        });
    });
}
