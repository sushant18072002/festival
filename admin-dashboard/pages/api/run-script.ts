import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { script } = req.body;

    if (!script) {
        return res.status(400).json({ success: false, error: 'Script name required' });
    }

    // Whitelist allowed scripts for security
    const ALLOWED_SCRIPTS: { [key: string]: string } = {
        'optimize': 'optimize_images.js',
        'seed-taxonomy': 'seed_taxonomy.js',
        'seed-events': 'seed_events.js',
        'check-data': 'check_data.js',
        'generate-feed': 'generate_feed.js'
    };

    const scriptFile = ALLOWED_SCRIPTS[script];

    if (!scriptFile) {
        return res.status(400).json({ success: false, error: 'Invalid script' });
    }

    const scriptPath = path.join(process.cwd(), '../backend/src/scripts', scriptFile);
    const lockFile = path.join(process.cwd(), '../backend/script.lock');

    if (fs.existsSync(lockFile)) {
        return res.status(423).json({ success: false, error: 'Another script is already running' });
    }

    fs.writeFileSync(lockFile, script);

    // Construct command
    const command = `node "${scriptPath}"`;

    console.log(`Executing: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);

        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ success: false, error: error.message, details: stderr });
        }
        console.log(`stdout: ${stdout}`);
        res.status(200).json({ success: true, output: stdout });
    });
}
