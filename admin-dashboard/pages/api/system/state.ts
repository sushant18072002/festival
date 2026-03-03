import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import { SystemState } from '../../../lib/models';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            const state = await SystemState.findOne({ key: 'main' });

            res.status(200).json({
                success: true,
                state: state || {
                    last_backup_at: null,
                    last_deployed_at: null,
                    last_modified_at: null,
                    last_feed_generated_at: null,
                    is_maintenance_mode: false,
                    min_app_version: '1.0.0',
                    update_url: ''
                }
            });
        } catch (error: any) {
            console.error('Error fetching system state:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    } else if (req.method === 'POST') {
        try {
            const { is_maintenance_mode, min_app_version, update_url } = req.body;
            const update: any = {};
            if (is_maintenance_mode !== undefined) update.is_maintenance_mode = is_maintenance_mode;
            if (min_app_version !== undefined) update.min_app_version = min_app_version;
            if (update_url !== undefined) update.update_url = update_url;

            const state = await SystemState.findOneAndUpdate(
                { key: 'main' },
                { $set: update },
                { upsert: true, new: true }
            );

            res.status(200).json({ success: true, state });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
