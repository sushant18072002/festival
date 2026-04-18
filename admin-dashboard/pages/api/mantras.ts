import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs-extra';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dbConnect from '../../lib/dbConnect';
import { Mantra } from '../../lib/models';

export const config = {
    api: {
        bodyParser: false,
    },
};

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;
const DEPLOY_ENV = process.env.DEPLOY_ENV || 'stage';
const BASE_PATH = process.env.S3_BASE_PATH || 'Utsav';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            const { id, trash, search, limit = '50', page = '1' } = req.query;
            if (id) {
                const mantra = await Mantra.findById(id).populate('category');
                return res.status(200).json({ success: true, data: mantra });
            }

            const filter: Record<string, any> = trash === 'true' ? { is_deleted: true } : { is_deleted: { $ne: true } };
            
            if (search) {
                filter.$or = [
                    { text: { $regex: search, $options: 'i' } },
                    { transliteration: { $regex: search, $options: 'i' } },
                    { meaning: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } }
                ];
            }

            const limitInt = parseInt(limit as string);
            const pageInt = parseInt(page as string);
            const skip = (pageInt - 1) * limitInt;

            const total = await Mantra.countDocuments(filter);
            const mantras = await Mantra.find(filter)
                .populate('category')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitInt);

            res.status(200).json({ 
                success: true, 
                data: mantras,
                pagination: {
                    total,
                    page: pageInt,
                    pages: Math.ceil(total / limitInt)
                }
            });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    } else if (req.method === 'POST' || req.method === 'PUT') {
        const form = formidable({
            multiples: false,
            keepExtensions: true,
        });

        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(500).json({ error: 'Form parsing failed' });

            try {
                const isUpdate = req.method === 'PUT';
                const id = Array.isArray(fields._id) ? fields._id[0] : fields._id;
                
                const mantraData: any = {};
                Object.entries(fields).forEach(([k, v]) => {
                    if (k === '_id' || k === 'audio_file') return;
                    mantraData[k] = Array.isArray(v) ? v[0] : v;
                });

                // Parse translations if present
                if (typeof mantraData.translations === 'string') {
                    mantraData.translations = JSON.parse(mantraData.translations);
                }

                let audioFile = Array.isArray(files.audio_file) ? files.audio_file[0] : files.audio_file;
                
                if (audioFile) {
                    const filename = audioFile.originalFilename || `mantra-${Date.now()}.aac`;
                    const s3Key = `${BASE_PATH}/${DEPLOY_ENV}/audio/mantras/${filename}`;
                    const fileContent = await fs.readFile(audioFile.filepath);

                    await s3Client.send(new PutObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: s3Key,
                        Body: fileContent,
                        ContentType: audioFile.mimetype || 'audio/aac',
                        Metadata: {
                            'asset-type': 'mantra',
                            'slug': mantraData.slug || 'untitled'
                        }
                    }));

                    mantraData.audio_file = s3Key;
                    mantraData.is_s3_uploaded = true;
                    mantraData.file_size_bytes = audioFile.size;

                    // Also save locally for development sync consistency
                    const localPath = path.join(process.cwd(), '../backend/assets/audio/mantras', filename);
                    await fs.ensureDir(path.dirname(localPath));
                    await fs.copy(audioFile.filepath, localPath);
                }

                let mantra;
                if (isUpdate && id) {
                    mantra = await Mantra.findByIdAndUpdate(id, mantraData, { new: true });
                } else {
                    mantra = await Mantra.create(mantraData);
                }

                res.status(isUpdate ? 200 : 201).json({ success: true, data: mantra });
            } catch (error: any) {
                console.error('[mantra-api] Error:', error);
                res.status(400).json({ success: false, error: error.message });
            }
        });
    } else if (req.method === 'DELETE') {
        try {
            const { id, permanent } = req.query;
            if (permanent === 'true') {
                await Mantra.findByIdAndDelete(id);
                res.status(200).json({ success: true, message: 'Permanently deleted' });
            } else {
                await Mantra.findByIdAndUpdate(id, { is_deleted: true, deleted_at: new Date() });
                res.status(200).json({ success: true, message: 'Moved to trash' });
            }
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
