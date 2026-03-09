import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs-extra';
import path from 'path';
import dbConnect from '../../lib/dbConnect';
import { Image, Event, Tag, Category } from '../../lib/models';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            const { trash, is_optimized, search } = req.query;
            const filter: any = trash === 'true' ? { is_deleted: true } : { is_deleted: { $ne: true } };

            if (is_optimized === 'true') filter.is_optimized = true;
            if (is_optimized === 'false') filter.is_optimized = { $ne: true };
            if (search) filter.caption = { $regex: search, $options: 'i' };

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 100; // Default high for gallery
            const skip = (page - 1) * limit;

            let images = [];
            let total = 0;

            if (req.query.event_id) {
                // Schema Inversion Proxy: The frontend asks for images "belonging" to an event
                const event = await Event.findById(req.query.event_id)
                    .populate({
                        path: 'images',
                        match: filter,
                        options: { sort: { created_at: -1 } }
                    })
                    .lean();
                images = event?.images || [];
                total = images.length;
            } else {
                images = await Image.find(filter)
                    .populate('greeting_id', 'text translations')
                    .populate('quote_id', 'text author translations')
                    .sort({ created_at: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

                total = await Image.countDocuments(filter);
            }

            const { DeployConfig } = require('../../lib/models');
            const deployConfig = await DeployConfig.findOne({ key: 'server_deployment' });
            let baseUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
            if (deployConfig && deployConfig.base_image_url) {
                baseUrl = deployConfig.base_image_url;
            }
            if (!baseUrl.endsWith('/')) baseUrl += '/';

            const itemsWithUrl = images.map((item: any) => {
                if (item.s3_key && !item.s3_key.startsWith('http')) {
                    item.s3_key = baseUrl + item.s3_key;
                }
                return item;
            });

            res.status(200).json({
                success: true,
                data: itemsWithUrl,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('GET /api/images Error:', error);
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else if (req.method === 'POST') {
        const form = new IncomingForm();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.parse(req, async (err: any, fields: any, files: any) => {
            if (err) {
                return res.status(500).json({ success: false, error: 'File upload failed' });
            }

            try {
                const file = Array.isArray(files.file) ? files.file[0] : files.file;
                if (!file) throw new Error('No file uploaded');

                // Move file to backend/assets/raw
                const rawDir = path.join(process.cwd(), '../backend/assets/raw');
                await fs.ensureDir(rawDir);

                const filename = `${Date.now()}_${file.originalFilename}`;
                const newPath = path.join(rawDir, filename);

                await fs.move(file.filepath, newPath);

                const env = process.env.DEPLOY_ENV || 'stage';
                const base = process.env.S3_BASE_PATH || 'Utsav';
                const s3Key = `${base}/${env}/image/original/${filename.replace(path.extname(filename), '.webp')}`;

                const imageDoc = await Image.create({
                    filename: filename,
                    s3_key: s3Key,
                    caption: Array.isArray(fields.caption) ? fields.caption[0] : fields.caption,
                    language: Array.isArray(fields.language) ? fields.language[0] : (fields.language || 'neutral'),
                    tags: Array.isArray(fields.tags) ? fields.tags[0]?.split(',') : [],
                    categories: Array.isArray(fields.categories) ? fields.categories[0]?.split(',') : [],
                    credits: Array.isArray(fields.credits) ? fields.credits[0] : fields.credits,
                });

                res.status(201).json({ success: true, data: imageDoc });
            } catch (error) {
                res.status(400).json({ success: false, error: (error as Error).message });
            }
        });
    } else if (req.method === 'PUT') {
        try {
            const chunks: any[] = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', async () => {
                const body = JSON.parse(Buffer.concat(chunks).toString());
                const { _id, event_id, ...updateData } = body;

                // Allow omitting _id if we want to do bulk operations eventually, but for now _id is required
                const image = await Image.findByIdAndUpdate(_id, updateData, { new: true });

                // Proxy relations to Event master array
                if (event_id !== undefined) {
                    if (event_id === null) {
                        // Unlink request: Pull this image ID from all Events
                        await Event.updateMany({}, { $pull: { images: _id } });
                    } else {
                        // Link request: Push this image ID to the specific Event
                        await Event.findByIdAndUpdate(event_id, { $addToSet: { images: _id } });
                    }
                }

                res.status(200).json({ success: true, data: image });
            });
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id, permanent } = req.query;

            if (permanent === 'true') {
                const image = await Image.findById(id);
                if (image) {
                    // 1. Delete from S3 explicitly if s3_key exists
                    if (image.s3_key && BUCKET_NAME) {
                        try {
                            await s3.deleteObject({ Bucket: BUCKET_NAME, Key: image.s3_key }).promise();
                            const thumbKey = image.s3_key.replace('/original/', '/thumb/').replace('.webp', '_thumb.webp');
                            await s3.deleteObject({ Bucket: BUCKET_NAME, Key: thumbKey }).promise();
                            console.log(`[AWS S3] Successfully deleted explicitly: ${image.s3_key}`);
                        } catch (s3Err) {
                            console.error('[AWS S3 Error] Failed to delete explicit object:', s3Err);
                        }
                    }

                    // 2. Delete from local backend asset folders (raw/optimized) to prevent floating files
                    if (image.filename) {
                        const rawPath = path.join(process.cwd(), '../backend/assets/raw', image.filename);
                        const optName = image.filename.replace(path.extname(image.filename), '.webp');
                        const optPath = path.join(process.cwd(), '../backend/assets/optimized/original', optName);
                        const thumbPath = path.join(process.cwd(), '../backend/assets/optimized/thumb', optName.replace('.webp', '_thumb.webp'));

                        try {
                            if (await fs.pathExists(rawPath)) await fs.remove(rawPath);
                            if (await fs.pathExists(optPath)) await fs.remove(optPath);
                            if (await fs.pathExists(thumbPath)) await fs.remove(thumbPath);
                        } catch (fsErr) {
                            console.error('[Local FS Error] Failed to wipe local images:', fsErr);
                        }
                    }
                }
                await Image.findByIdAndDelete(id);
                res.status(200).json({ success: true, message: 'Permanently deleted from DB, Local Node, and S3' });
            } else {
                await Image.findByIdAndUpdate(id, { is_deleted: true, deleted_at: new Date() });
                res.status(200).json({ success: true, message: 'Moved to trash' });
            }
        } catch (error) {
            res.status(400).json({ success: false, error: (error as Error).message });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
