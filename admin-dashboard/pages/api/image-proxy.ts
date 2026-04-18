import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import path from 'path';
import mime from 'mime-types';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { key, type } = req.query;
    if (!key || typeof key !== 'string') {
        return res.status(400).json({ error: 'Missing key parameter' });
    }

    const safeKey = key.replace(/\.\.[/\\]/g, '');
    const filename = path.basename(safeKey);

    // ── 1. Handle Audio Assets (If requested or inferred) ───────────────────
    if (type === 'audio' || safeKey.includes('/audio/')) {
        const isMantra = safeKey.includes('/mantras/');
        const subFolder = isMantra ? 'mantras' : 'originals';
        const localAudioPath = path.join(process.cwd(), '../backend/assets/audio', subFolder, filename);

        if (await fs.pathExists(localAudioPath)) {
            const contentType = (mime.lookup(localAudioPath) as string) || 'audio/aac';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return fs.createReadStream(localAudioPath).pipe(res as any);
        }
    }

    // ── 2. Handle Lottie Animations (JSON) ──────────────────────────────
    if (safeKey.includes('/lotties/') || filename.endsWith('.json')) {
        const localLottiePath = path.join(process.cwd(), '../backend/assets/lotties', filename);
        if (await fs.pathExists(localLottiePath)) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return fs.createReadStream(localLottiePath).pipe(res as any);
        }
    }

    // ── 2. Handle Image Assets (Legacy behavior) ───────────────────────────
    if (!type || type === 'image') {
        const isThumb = safeKey.includes('/thumb/');
        const subDir = isThumb ? 'thumb' : 'original';

        // Try optimized local file
        const optimizedPath = path.join(process.cwd(), '../backend/assets/optimized', subDir, filename);
        if (await fs.pathExists(optimizedPath)) {
            const contentType = (mime.lookup(optimizedPath) as string) || 'image/webp';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return fs.createReadStream(optimizedPath).pipe(res as any);
        }

        // Try raw local file
        const rawDir = path.join(process.cwd(), '../backend/assets/raw');
        if (await fs.pathExists(rawDir)) {
            const rawFiles = await fs.readdir(rawDir);
            const baseName = path.parse(filename).name.replace('_thumb', '');
            const rawFile = rawFiles.find(f => path.parse(f).name === baseName);
            if (rawFile) {
                const rawPath = path.join(rawDir, rawFile);
                const contentType = (mime.lookup(rawPath) as string) || 'image/webp';
                res.setHeader('Content-Type', contentType);
                res.setHeader('Cache-Control', 'public, max-age=3600');
                return fs.createReadStream(rawPath).pipe(res as any);
            }
        }
    }

    // ── 3. Stream directly from S3 (Fallback) ───────────────────────────────
    if (!BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID) {
        return res.status(404).json({ error: 'Asset not found locally and AWS credentials not configured' });
    }

    try {
        const response = await s3Client.send(new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: safeKey,
        }));

        const contentType = response.ContentType || (mime.lookup(filename) as string) || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        if (response.ContentLength) {
            res.setHeader('Content-Length', String(response.ContentLength));
        }

        if (response.Body instanceof Readable) {
            return response.Body.pipe(res as any);
        } else {
            const body = await response.Body?.transformToByteArray();
            if (body) {
                return res.send(Buffer.from(body));
            }
            throw new Error('Unexpected S3 response body type');
        }
    } catch (err: any) {
        if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
            return res.status(404).json({ error: `Asset not found on S3: ${safeKey}` });
        }
        console.error('[asset-proxy] S3 error:', err.message);
        return res.status(500).json({ error: 'Failed to load asset from S3' });
    }
}
