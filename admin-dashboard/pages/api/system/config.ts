import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/dbConnect';
import { AppConfig } from '../../../lib/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB();

    if (req.method === 'GET') {
        try {
            let config = await AppConfig.findOne({ key: 'mobile_app' });
            if (!config) {
                config = await AppConfig.create({ key: 'mobile_app' });
            }
            return res.status(200).json({ success: true, config });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const updateData = req.body;
            delete updateData._id; // Prevent ID modification
            delete updateData.key; // Prevent key modification

            const config = await AppConfig.findOneAndUpdate(
                { key: 'mobile_app' },
                { $set: updateData },
                { new: true, upsert: true }
            );

            return res.status(200).json({ success: true, config });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
