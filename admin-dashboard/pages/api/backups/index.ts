import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import path from 'path';
import dbConnect from '../../../lib/dbConnect';
import { SystemState } from '../../../lib/models'; // We need to define this in lib/models.ts or import from backend? 
// Better to define in lib/models.ts to keep frontend clean, but for now we can use mongoose.models if connected.
// Actually, let's just read the file system for backups.

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const backupsDir = path.join(process.cwd(), '../backend/backups');

        // Ensure dir exists
        if (!await fs.pathExists(backupsDir)) {
            return res.status(200).json({ success: true, backups: [] });
        }

        const items = await fs.readdir(backupsDir);
        const backups = [];

        for (const item of items) {
            const itemPath = path.join(backupsDir, item);
            const stats = await fs.stat(itemPath);
            if (stats.isDirectory()) {
                // Parse date from folder name YYYY-MM-DD_HH-mm-ss
                const [datePart, timePart] = item.split('_');
                const formattedDate = timePart
                    ? `${datePart}T${timePart.replace(/-/g, ':')}`
                    : datePart;

                backups.push({
                    id: item,
                    name: item,
                    date: new Date(formattedDate).toISOString(),
                    size: 0
                });
            }
        }

        // Sort lexicographically desc (works for YYYY-MM-DD_HH-mm-ss)
        backups.sort((a, b) => b.name.localeCompare(a.name));

        res.status(200).json({ success: true, backups });
    } catch (error: any) {
        console.error('Error listing backups:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
