import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import Trivia from '../../models/Trivia';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query } = req;

    try {
        await dbConnect();

        switch (method) {
            case 'GET':
                if (query.id) {
                    const item = await Trivia.findById(query.id);
                    if (!item) return res.status(404).json({ success: false, error: 'Trivia not found' });
                    return res.status(200).json({ success: true, data: item });
                }
                const items = await Trivia.find({}).sort({ _id: -1 });
                return res.status(200).json({ success: true, data: items });

            case 'POST':
                const created = await Trivia.create(req.body);
                return res.status(201).json({ success: true, data: created });

            case 'PUT':
                if (!query.id) return res.status(400).json({ success: false, error: 'ID is required' });
                const updated = await Trivia.findByIdAndUpdate(query.id, req.body, { new: true, runValidators: true });
                if (!updated) return res.status(404).json({ success: false, error: 'Trivia not found' });
                return res.status(200).json({ success: true, data: updated });

            case 'DELETE':
                if (!query.id) return res.status(400).json({ success: false, error: 'ID is required' });
                const deleted = await Trivia.findByIdAndDelete(query.id);
                if (!deleted) return res.status(404).json({ success: false, error: 'Trivia not found' });
                return res.status(200).json({ success: true, data: {} });

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${method} Not Allowed`);
                break;
        }
    } catch (error: any) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
