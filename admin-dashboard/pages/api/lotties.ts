import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs-extra';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dbConnect from '../../lib/dbConnect';
import { LottieOverlay } from '../../lib/models';

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
            const data = await LottieOverlay.find({}).sort({ createdAt: -1 });
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    } else if (req.method === 'POST') {
        const form = formidable({
            multiples: false,
            keepExtensions: true,
        });

        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(500).json({ error: 'Form parsing failed' });

            try {
                const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
                const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
                const lottieFile = Array.isArray(files.lottie_file) ? files.lottie_file[0] : files.lottie_file;

                if (!lottieFile) {
                    return res.status(400).json({ error: 'No Lottie file uploaded' });
                }

                const filename = lottieFile.originalFilename || `lottie-${Date.now()}.json`;
                const s3Key = `${BASE_PATH}/${DEPLOY_ENV}/lotties/${filename}`;
                const fileContent = await fs.readFile(lottieFile.filepath);

                // 1. Upload to S3
                await s3Client.send(new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: s3Key,
                    Body: fileContent,
                    ContentType: 'application/json',
                }));

                // 2. Save locally for fallback/development
                const localPath = path.join(process.cwd(), '../backend/assets/lotties', filename);
                await fs.ensureDir(path.dirname(localPath));
                await fs.copy(lottieFile.filepath, localPath);

                // 3. Create database record
                const lottie = await LottieOverlay.create({
                    name,
                    filename,
                    description,
                    is_active: true
                });

                res.status(201).json({ success: true, data: lottie });
            } catch (error: any) {
                console.error('[lotties-api] Error:', error);
                res.status(400).json({ success: false, error: error.message });
            }
        });
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            const lottie = await LottieOverlay.findByIdAndDelete(id);
            res.status(200).json({ success: true, message: 'Lottie deleted', data: lottie });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
