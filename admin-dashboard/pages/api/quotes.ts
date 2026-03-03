import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import { Quote } from '../../lib/models';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            const { trash, featured } = req.query;
            let filter: any = trash === 'true' ? { is_deleted: true } : { is_deleted: { $ne: true } };
            if (featured === 'true') filter.is_featured = true;
            const total = await Quote.countDocuments(filter);
            const quotes = await Quote.find(filter)
                .populate('category', 'code translations')
                .sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: quotes, pagination: { total, page: 1, pages: 1 } });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else if (req.method === 'POST') {
        try {
            const quote = await Quote.create(req.body);
            res.status(201).json({ success: true, data: quote });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else if (req.method === 'PUT') {
        try {
            const { _id, ...updateData } = req.body;
            const quote = await Quote.findByIdAndUpdate(_id, updateData, { new: true });
            res.status(200).json({ success: true, data: quote });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id, permanent } = req.query;
            if (permanent === 'true') {
                await Quote.findByIdAndDelete(id);
                res.status(200).json({ success: true, message: 'Permanently deleted' });
            } else {
                await Quote.findByIdAndUpdate(id, { is_deleted: true, deleted_at: new Date() });
                res.status(200).json({ success: true, message: 'Moved to trash' });
            }
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
