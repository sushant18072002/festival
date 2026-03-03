import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import path from 'path';
import mime from 'mime-types';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';

/**
 * Image Proxy — serves images for the admin dashboard.
 *
 * Priority order:
 *  1. Local backend/assets/optimized/original or /thumb  (newly uploaded, not yet on S3)
 *  2. Local backend/assets/raw                           (raw fallback)
 *  3. Stream directly from S3                            (S3-seeded images, bucket stays private)
 *
 * Usage: <img src={`/api/image-proxy?key=${encodeURIComponent(s3Key)}`} />
 * The s3Key is the full S3 path, e.g. "Utsav/stage/image/original/foo.webp"
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { key } = req.query;
    if (!key || typeof key !== 'string') {
        return res.status(400).json({ error: 'Missing key parameter' });
    }

    // Sanitize to prevent path traversal
    const safeKey = key.replace(/\.\.[/\\]/g, '');
    const filename = path.basename(safeKey);
    const isThumb = safeKey.includes('/thumb/');
    const subDir = isThumb ? 'thumb' : 'original';

    // ── 1. Try optimized local file ──────────────────────────────────────────
    const optimizedPath = path.join(process.cwd(), '../backend/assets/optimized', subDir, filename);
    if (await fs.pathExists(optimizedPath)) {
        const contentType = (mime.lookup(optimizedPath) as string) || 'image/webp';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
        return fs.createReadStream(optimizedPath).pipe(res as any);
    }

    // ── 2. Try raw local file ────────────────────────────────────────────────
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

    // ── 3. Stream directly from S3 (private bucket — no redirect, no signed URL) ──
    if (!BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID) {
        return res.status(404).json({ error: 'Image not found locally and AWS credentials not configured' });
    }

    try {
        const s3Object = await s3.getObject({
            Bucket: BUCKET_NAME,
            Key: safeKey,
        }).promise();

        const contentType = (s3Object.ContentType as string) || (mime.lookup(filename) as string) || 'image/webp';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 1 day in browser
        res.setHeader('Content-Length', String(s3Object.ContentLength || ''));

        return res.send(s3Object.Body);
    } catch (err: any) {
        if (err.code === 'NoSuchKey') {
            return res.status(404).json({ error: `Image not found on S3: ${safeKey}` });
        }
        if (err.code === 'InvalidAccessKeyId' || err.code === 'SignatureDoesNotMatch') {
            console.error('[image-proxy] AWS credentials invalid:', err.message);
            return res.status(500).json({ error: 'AWS credentials error — update .env.local' });
        }
        console.error('[image-proxy] S3 error:', err.message);
        return res.status(500).json({ error: 'Failed to load image from S3' });
    }
}
