import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import { Event, Image, Greeting } from '../../../lib/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

    try {
        await dbConnect();

        // ── Step 1: Get all active events ──────────────────────────────────────────
        const [totalEvents, eventsWithRituals, eventsWithMuhurat, eventsWithAudio] = await Promise.all([
            Event.countDocuments({ is_deleted: { $ne: true } }),

            // Events with at least one ritual step
            Event.countDocuments({
                'ritual_steps.0': { $exists: true },
                is_deleted: { $ne: true }
            }),

            // Events with muhurat data (muhurat.puja_time filled in)
            Event.countDocuments({
                'muhurat.puja_time': { $exists: true, $ne: null },
                is_deleted: { $ne: true }
            }),

            // Events with ambient audio linked
            Event.countDocuments({
                'ambient_audio.s3_key': { $exists: true, $ne: null },
                is_deleted: { $ne: true }
            }),
        ]);

        const allEvents = await Event.find({ is_deleted: { $ne: true } }, { _id: 1, images: 1, greetings: 1 }).lean();
        const eventsWithImages = (allEvents as any[]).filter(e => e.images?.length > 0).length;
        const eventsWithGreetings = (allEvents as any[]).filter(e => e.greetings?.length > 0).length;

        return res.status(200).json({
            success: true,
            coverage: {
                totalEvents,
                eventsWithImages,
                eventsWithGreetings,
                eventsWithRituals,
                eventsWithMuhurat,
                eventsWithAudio,
            }
        });
    } catch (error: any) {
        console.error('[coverage] Error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
}
