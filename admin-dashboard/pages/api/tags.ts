import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import { Tag } from '../../lib/models';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            const tags = await Tag.find({}).sort({ code: 1 });
            res.status(200).json({ success: true, data: tags });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else if (req.method === 'POST') {
        try {
            const tag = await Tag.create(req.body);
            res.status(201).json({ success: true, data: tag });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else if (req.method === 'PUT') {
        try {
            const { _id, ...updateData } = req.body;
            const tag = await Tag.findByIdAndUpdate(_id, updateData, { new: true });
            res.status(200).json({ success: true, data: tag });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            await Tag.findByIdAndDelete(id);
            res.status(200).json({ success: true, message: 'Deleted successfully' });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
