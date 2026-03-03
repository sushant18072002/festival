import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import Quiz from '../../models/Quiz';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query } = req;

    try {
        await dbConnect();

        switch (method) {
            case 'GET':
                if (query.id) {
                    const quiz = await Quiz.findById(query.id);
                    if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found' });
                    return res.status(200).json({ success: true, data: quiz });
                }
                const quizzes = await Quiz.find({}).sort({ _id: -1 });
                return res.status(200).json({ success: true, data: quizzes });

            case 'POST':
                const created = await Quiz.create(req.body);
                return res.status(201).json({ success: true, data: created });

            case 'PUT':
                if (!query.id) return res.status(400).json({ success: false, error: 'ID is required' });
                const updated = await Quiz.findByIdAndUpdate(query.id, req.body, { new: true, runValidators: true });
                if (!updated) return res.status(404).json({ success: false, error: 'Quiz not found' });
                return res.status(200).json({ success: true, data: updated });

            case 'DELETE':
                if (!query.id) return res.status(400).json({ success: false, error: 'ID is required' });
                const deleted = await Quiz.findByIdAndDelete(query.id);
                if (!deleted) return res.status(404).json({ success: false, error: 'Quiz not found' });
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
