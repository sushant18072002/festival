import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import { Event, Image, Quote } from '../../../lib/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

    try {
        await dbConnect();

        // Get all active event IDs to compute coverage
        const allEvents = await Event.find({ is_deleted: { $ne: true } }, { _id: 1 }).lean();
        const allEventIds: string[] = (allEvents as any[]).map((e) => e._id.toString());

        // Run all health checks
        const [
            orphanedImages,
            eventsMissingImages,
            eventsMissingTranslations,
            quotesMissingAuthor,
            imagesMissingCaption,
        ] = await Promise.all([
            // Images with no linked event
            Image.countDocuments({ event_id: { $in: [null, undefined] }, is_deleted: { $ne: true } }),

            // Events that have no images linked via Image.event_id
            (async () => {
                const eventsWithImages = await Image.distinct('event_id', {
                    event_id: { $ne: null },
                    is_deleted: { $ne: true },
                });
                const eventsWithImagesSet = new Set((eventsWithImages as any[]).map((id) => id.toString()));
                return allEventIds.filter((id) => !eventsWithImagesSet.has(id)).length;
            })(),

            // Events missing Hindi translation title (coverage heuristic)
            Event.countDocuments({
                $or: [
                    { 'translations.hi.title': { $exists: false } },
                    { 'translations.hi.title': null },
                    { 'translations.hi.title': '' },
                ],
                is_deleted: { $ne: true },
            }),

            // Quotes missing author field
            Quote.countDocuments({ author: { $in: [null, ''] } }),

            // Images missing caption (data quality metric)
            Image.countDocuments({ caption: { $in: [null, ''] }, is_deleted: { $ne: true } }),
        ]);

        return res.status(200).json({
            success: true,
            health: {
                orphanedImages,
                eventsMissingImages,
                eventsMissingTranslations,
                quotesMissingAuthor,
                imagesMissingCaption,
            },
        });
    } catch (error: any) {
        console.error('[health] Error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
}
