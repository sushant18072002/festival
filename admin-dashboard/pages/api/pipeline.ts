import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

const backendDir = path.join(process.cwd(), '../backend');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { action } = req.body;
    
    let scriptPath = '';
    let args: string[] = [];

    switch (action) {
        case 'health_deep':
            scriptPath = 'src/scripts/utils/health.js';
            args = ['--deep'];
            break;
        case 'backup':
            scriptPath = 'src/scripts/utils/backup_db.js';
            break;
        case 'deploy':
            scriptPath = 'src/scripts/deploy_pipeline.js';
            break;
        case 'rehydrate':
            scriptPath = 'src/scripts/utils/health.js';
            args = ['--rehydrate'];
            break;
        default:
            return res.status(400).json({ success: false, error: 'Invalid operation' });
    }

    // Windows specific handling (Same logic as deploy.ts to open visible window)
    if (process.platform === 'win32') {
        spawn(
            'cmd.exe',
            ['/c', 'start', 'cmd.exe', '/k', 'node', scriptPath, ...args],
            {
                cwd: backendDir,
                detached: true,
                stdio: 'ignore'
            }
        ).unref();
        
        return res.status(200).json({ 
            success: true, 
            message: `Starting ${action} in a new terminal window.` 
        });
    } else {
        // Unix: background spawn
        const logFile = path.join(backendDir, `${action}.log`);
        const out = fs.openSync(logFile, 'a');
        
        spawn('node', [scriptPath, ...args], {
            cwd: backendDir,
            detached: true,
            stdio: ['ignore', out, out]
        }).unref();

        return res.status(200).json({ 
            success: true, 
            message: `Pipeline operation ${action} started in background. Check ${action}.log for output.` 
        });
    }
}
