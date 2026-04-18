import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import { Greeting } from '../../lib/models';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            const { trash, search, limit = '50', page = '1' } = req.query;
            const filter: Record<string, any> = trash === 'true' ? { is_deleted: true } : { is_deleted: { $ne: true } };
            
            if (search) {
                filter.$or = [
                    { text: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } }
                ];
            }

            const limitInt = parseInt(limit as string);
            const pageInt = parseInt(page as string);
            const skip = (pageInt - 1) * limitInt;

            const total = await Greeting.countDocuments(filter);
            const greetings = await Greeting.find(filter)
                .populate('category', 'code translations')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitInt);

            res.status(200).json({ 
                success: true, 
                data: greetings, 
                pagination: { 
                    total, 
                    page: pageInt, 
                    pages: Math.ceil(total / limitInt) 
                } 
            });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else if (req.method === 'POST') {
        try {
            const greeting = await Greeting.create(req.body);
            res.status(201).json({ success: true, data: greeting });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else if (req.method === 'PUT') {
        try {
            const { _id, ...updateData } = req.body;
            const greeting = await Greeting.findByIdAndUpdate(_id, updateData, { new: true });
            res.status(200).json({ success: true, data: greeting });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id, permanent } = req.query;
            if (permanent === 'true') {
                await Greeting.findByIdAndDelete(id);
                res.status(200).json({ success: true, message: 'Permanently deleted' });
            } else {
                await Greeting.findByIdAndUpdate(id, { is_deleted: true, deleted_at: new Date() });
                res.status(200).json({ success: true, message: 'Moved to trash' });
            }
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
