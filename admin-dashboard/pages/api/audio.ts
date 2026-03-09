import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/dbConnect';
import { AmbientAudio as AmbientAudioModel, AmbientAudioSchema } from '../../lib/models';
import mongoose from 'mongoose';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';

export const config = {
    api: {
        bodyParser: false, // Required for formidable file uploads
    },
};

const AmbientAudio = AmbientAudioModel;

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;
const BASE_PATH = process.env.S3_BASE_PATH || 'Utsav';
const DEPLOY_ENV = process.env.DEPLOY_ENV || 'stage';

const SUPPORTED_TYPES: Record<string, string> = {
    '.aac': 'audio/aac',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
};

const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> =>
    new Promise((resolve, reject) => {
        const form = formidable({ maxFileSize: 50 * 1024 * 1024 }); // 50MB limit
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB();
    const AmbientAudio = AmbientAudioModel;

    // ── GET: List all audio ────────────────────────────────────────────────────
    if (req.method === 'GET') {
        try {
            const { category, mood, is_uploaded, limit = '50', page = '0' } = req.query;
            const filter: Record<string, unknown> = { is_deleted: { $ne: true } };
            if (category) filter.category = category;
            if (mood) filter.mood = mood;
            if (is_uploaded !== undefined) filter.is_s3_uploaded = is_uploaded === 'true';

            const skip = parseInt(page as string) * parseInt(limit as string);
            const [items, total] = await Promise.all([
                AmbientAudio.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit as string)).lean(),
                AmbientAudio.countDocuments(filter),
            ]);

            const { DeployConfig } = require('../../lib/models');
            const deployConfig = await DeployConfig.findOne({ key: 'server_deployment' });
            let baseUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
            if (deployConfig && deployConfig.base_image_url) {
                baseUrl = deployConfig.base_image_url;
            }
            if (!baseUrl.endsWith('/')) baseUrl += '/';

            const itemsWithUrl = items.map((item: any) => {
                if (item.s3_key && !item.s3_key.startsWith('http')) {
                    item.s3_key = baseUrl + item.s3_key;
                }
                return item;
            });

            return res.status(200).json({ items: itemsWithUrl, total, page: parseInt(page as string), limit: parseInt(limit as string) });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return res.status(500).json({ error: message });
        }
    }

    // ── POST: Create + (optionally) upload to S3 ──────────────────────────────
    if (req.method === 'POST') {
        try {
            const { fields, files } = await parseForm(req);
            const getValue = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] : v ?? '';

            const slug = getValue(fields.slug as string | string[]);
            const title = getValue(fields.title as string | string[]);
            const category = getValue(fields.category as string | string[]);
            const mood = getValue(fields.mood as string | string[]);
            const language = getValue(fields.language as string | string[]);
            const description = getValue(fields.description as string | string[]);
            const attribution = getValue(fields.attribution as string | string[]);
            const durationSeconds = parseInt(getValue(fields.duration_seconds as string | string[]) || '0');
            const tagsRaw = getValue(fields.tags as string | string[]);
            const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
            const isLoopable = getValue(fields.is_loopable as string | string[]) !== 'false';
            const defaultVolume = parseFloat(getValue(fields.default_volume as string | string[]) || '0.6');

            if (!slug || !title) {
                return res.status(400).json({ error: 'slug and title are required' });
            }

            // Check for duplicate slug
            const existing = await AmbientAudio.findOne({ slug });
            if (existing) {
                return res.status(409).json({ error: `Audio with slug "${slug}" already exists` });
            }

            let s3Key = '';
            let filename = '';
            let fileSizeBytes = 0;
            let mimeType = 'audio/aac';
            let isUploaded = false;

            // ── Handle file upload ─────────────────────────────────────────────────
            const audioFile = files.audio_file as File | File[] | undefined;
            const uploadedFile = Array.isArray(audioFile) ? audioFile[0] : audioFile;

            if (uploadedFile) {
                const ext = path.extname(uploadedFile.originalFilename || '').toLowerCase();
                if (!SUPPORTED_TYPES[ext]) {
                    return res.status(400).json({ error: `Unsupported audio format: ${ext}. Use .aac, .mp3, .ogg, .wav, or .m4a` });
                }

                filename = `${slug}${ext}`;
                s3Key = `${BASE_PATH}/${DEPLOY_ENV}/audio/originals/${filename}`;
                mimeType = SUPPORTED_TYPES[ext];
                fileSizeBytes = uploadedFile.size;

                const fileContent = fs.readFileSync(uploadedFile.filepath);

                await s3.putObject({
                    Bucket: BUCKET_NAME,
                    Key: s3Key,
                    Body: fileContent,
                    ContentType: mimeType,
                    CacheControl: 'max-age=31536000',
                    Metadata: { 'audio-slug': slug, 'audio-title': title },
                }).promise();

                isUploaded = true;
                fs.unlinkSync(uploadedFile.filepath); // Clean up temp file
            } else {
                // No file – store metadata only, upload later via upload_audio.js
                filename = getValue(fields.filename as string | string[]) || `${slug}.aac`;
                s3Key = getValue(fields.s3_key as string | string[]) || `audio/originals/${filename}`;
            }

            const newAudio = await AmbientAudio.create({
                slug,
                title,
                description,
                attribution,
                filename,
                s3_key: s3Key,
                mime_type: mimeType,
                duration_seconds: durationSeconds,
                file_size_bytes: fileSizeBytes,
                is_s3_uploaded: isUploaded,
                category: category || 'devotional',
                mood: mood || 'spiritual',
                language: language || 'neutral',
                tags,
                is_loopable: isLoopable,
                default_volume: defaultVolume,
            });

            return res.status(201).json(newAudio);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return res.status(500).json({ error: message });
        }
    }

    // ── PATCH: Update audio metadata or link to event ─────────────────────────
    if (req.method === 'PATCH') {
        try {
            const { id } = req.query;
            const body = JSON.parse(req.body || '{}');
            const updated = await AmbientAudio.findByIdAndUpdate(id, { $set: body }, { new: true });
            return res.status(200).json(updated);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return res.status(500).json({ error: message });
        }
    }

    // ── DELETE: Soft delete ────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            await AmbientAudio.findByIdAndUpdate(id, { $set: { is_deleted: true, deleted_at: new Date() } });
            return res.status(200).json({ success: true });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return res.status(500).json({ error: message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
