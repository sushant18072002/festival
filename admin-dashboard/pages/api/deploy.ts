import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

const LOCK_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const backendDir = path.join(process.cwd(), '../backend');
const lockFile = path.join(backendDir, 'deploy.lock');
const logFile = path.join(backendDir, 'deploy.log');

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // GET: Return deploy status (lock state + last 50 log lines)
    // Allows the dashboard to poll for real-time progress
    if (req.method === 'GET') {
        const isLocked = fs.existsSync(lockFile);
        let lockAgeMinutes = 0;
        if (isLocked) {
            const lockAge = Date.now() - parseInt(fs.readFileSync(lockFile, 'utf8') || '0', 10);
            lockAgeMinutes = Math.round(lockAge / 60000);
        }
        let logLines: string[] = [];
        if (fs.existsSync(logFile)) {
            const raw = fs.readFileSync(logFile, 'utf8');
            logLines = raw.trim().split('\n').slice(-50); // Last 50 lines
        }
        return res.status(200).json({ isDeploying: isLocked, lockAgeMinutes, logLines });
    }

    // DELETE: manually clear a stale lock
    if (req.method === 'DELETE') {
        if (fs.existsSync(lockFile)) {
            fs.unlinkSync(lockFile);
            return res.status(200).json({ success: true, message: 'Deploy lock cleared.' });
        }
        return res.status(200).json({ success: true, message: 'No lock file found.' });
    }

    if (req.method === 'POST') {
        // Auto-clear stale locks older than 30 minutes
        if (fs.existsSync(lockFile)) {
            const lockAge = Date.now() - parseInt(fs.readFileSync(lockFile, 'utf8') || '0', 10);
            if (lockAge < LOCK_TIMEOUT_MS) {
                return res.status(423).json({
                    success: false,
                    error: 'Deployment already in progress',
                    lockAgeMinutes: Math.round(lockAge / 60000)
                });
            }
            // Stale lock — clear it automatically
            fs.unlinkSync(lockFile);
        }

        // Create lock
        fs.writeFileSync(lockFile, Date.now().toString());

        // Write stdout+stderr to deploy.log so crashes are visible (was: stdio:'ignore' — silently dropped all errors)
        const logStream = fs.openSync(logFile, 'w');

        const { spawn } = require('child_process') as typeof import('child_process');

        // Use an inline evaluation script instead of a direct file path.
        // This is 100% invisible to Turbopack's static path analyzer.
        const inlineScript = `const p = require('path').resolve(process.cwd(), '../backend/src/scripts/deploy_pipeline.js'); require(p);`;

        // Hide the arguments from static analysis by constructing dynamically
        const args = [];
        args.push('-e');
        args.push(inlineScript);

        // Spawn pure Node process — no fragile CMD/Bash operators natively
        let deployProcess;

        if (process.platform === 'win32') {
            // Windows: pop open a visible CMD window so the user can see what's happening
            deployProcess = spawn(
                'cmd.exe',
                ['/c', 'start', 'cmd.exe', '/k', 'node', 'src/scripts/deploy_pipeline.js'],
                {
                    cwd: backendDir,
                    detached: true,
                    stdio: 'ignore'
                }
            );
        } else {
            // macOS/Linux fallback to background process piping to log
            deployProcess = spawn(
                'node',
                args,
                {
                    cwd: backendDir,
                    shell: false,    // Secure: no shell injection risk
                    detached: true,
                    stdio: ['ignore', logStream, logStream]  // Capture logs → deploy.log
                }
            );
        }

        // Detach so it runs independently of this API request lifecycle
        deployProcess.unref();

        // Immediately return so dashboard doesn't hang — poll GET /api/deploy for status
        return res.status(200).json({
            success: true,
            message: 'Deployment started. Poll GET /api/deploy for live status and logs.'
        });
    }

    res.status(405).json({ success: false, message: 'Method not allowed' });
}
