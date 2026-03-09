import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import { GamificationConfig } from '../../lib/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        await dbConnect();

        switch (method) {
            case 'GET':
                // We only use version 1 for now
                let config = await GamificationConfig.findOne({ version: 1 });
                if (!config) {
                    // Auto-initialize if empty
                    config = await GamificationConfig.create({ version: 1, avatarTiers: [], trophies: [] });
                }
                return res.status(200).json({ success: true, data: config });

            case 'PUT':
                const updated = await GamificationConfig.findOneAndUpdate(
                    { version: 1 },
                    req.body,
                    { new: true, runValidators: true, upsert: true }
                );
                return res.status(200).json({ success: true, data: updated });

            default:
                res.setHeader('Allow', ['GET', 'PUT']);
                res.status(405).end(`Method ${method} Not Allowed`);
                break;
        }
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
