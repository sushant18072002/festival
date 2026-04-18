import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import { Event, Image, Category, Tag, Vibe, Mantra } from '../../lib/models';

// Helper to generate slug
const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')  // Remove all non-word chars
        .replace(/--+/g, '-');    // Replace multiple - with single -
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;
            const { trash, search } = req.query;

            const filter: any = trash === 'true' ? { is_deleted: true } : { is_deleted: { $ne: true } };

            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } }
                ];
            }

            const events = await Event.find(filter)
                .sort({ date: 1 })
                .skip(skip)
                .limit(limit);

            const total = await Event.countDocuments(filter);

            res.status(200).json({
                success: true,
                data: events,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else if (req.method === 'POST' || req.method === 'PUT') {
        try {
            const body = req.body;

            // Generate slug if missing
            if (!body.slug && body.title) {
                body.slug = slugify(body.title);
            }

            // Helper to resolve Tags/Categories from strings to ObjectIds
            const resolveTaxonomy = async (data: any) => {
                // Handle Category
                if (typeof data.category === 'string' && data.category.length > 20) {
                    // Likely an ObjectId, do nothing
                } else if (typeof data.category === 'string') {
                    const code = data.category.toLowerCase().trim();
                    let cat = await Category.findOne({ code });
                    if (!cat) {
                        cat = await Category.create({
                            code,
                            translations: { en: { name: data.category } }
                        });
                    }
                    data.category = cat._id;
                }

                // Handle Tags
                if (Array.isArray(data.tags)) {
                    const resolvedTags = [];
                    for (const tagInput of data.tags) {
                        if (typeof tagInput === 'string' && tagInput.length > 20) {
                            resolvedTags.push(tagInput);
                        } else if (typeof tagInput === 'string') {
                            const code = tagInput.toLowerCase().trim();
                            let tag = await Tag.findOne({ code });
                            if (!tag) {
                                tag = await Tag.create({
                                    code,
                                    translations: { en: { name: tagInput } }
                                });
                            }
                            resolvedTags.push(tag._id);
                        }
                    }
                    data.tags = resolvedTags;
                }

                // Handle Vibes
                if (Array.isArray(data.vibes)) {
                    const resolvedVibes = [];
                    for (const vibeInput of data.vibes) {
                        if (typeof vibeInput === 'string' && vibeInput.length > 20) {
                            resolvedVibes.push(vibeInput);
                        } else if (typeof vibeInput === 'string') {
                            const code = vibeInput.toLowerCase().trim();
                            let vibe = await Vibe.findOne({ code });
                            if (!vibe) {
                                vibe = await Vibe.create({
                                    code,
                                    translations: { en: { name: vibeInput } }
                                });
                            }
                            resolvedVibes.push(vibe._id);
                        }
                    }
                    data.vibes = resolvedVibes;
                }

                // Handle Mantras
                if (Array.isArray(data.mantras)) {
                    const resolvedMantras = [];
                    for (const mantraInput of data.mantras) {
                        if (typeof mantraInput === 'string' && mantraInput.length > 20) {
                            resolvedMantras.push(mantraInput);
                        } else if (typeof mantraInput === 'string') {
                            const slug = mantraInput.toLowerCase().trim();
                            let mantra = await Mantra.findOne({ slug });
                            if (!mantra) {
                                mantra = await Mantra.create({
                                    text: mantraInput,
                                    slug,
                                    translations: { en: { text: mantraInput } }
                                });
                            }
                            resolvedMantras.push(mantra._id);
                        }
                    }
                    data.mantras = resolvedMantras;
                }

                // Cleanup empty ObjectIds before passing to MongoDB
                if (data.lottie_overlay === '') delete data.lottie_overlay;
                if (data.ambient_audio === '') delete data.ambient_audio;
                if (data.category === '') delete data.category;

                return data;
            };

            const processedBody = await resolveTaxonomy(body);

            if (req.method === 'POST') {
                const event = await Event.create(processedBody);
                res.status(201).json({ success: true, data: event });
            } else {
                const { _id, images, ...updateData } = processedBody; // Exclude images to prevent overwriting linked images
                const event = await Event.findByIdAndUpdate(_id, updateData, { new: true });
                res.status(200).json({ success: true, data: event });
            }
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id, permanent } = req.query;

            if (permanent === 'true') {
                // Unlink images first
                await Image.updateMany({ event_id: id }, { $set: { event_id: null } });

                await Event.findByIdAndDelete(id);
                res.status(200).json({ success: true, message: 'Permanently deleted and unlinked images' });
            } else {
                await Event.findByIdAndUpdate(id, { is_deleted: true });
                res.status(200).json({ success: true, message: 'Moved to trash' });
            }
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
