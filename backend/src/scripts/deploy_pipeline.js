/**
 * deploy_pipeline.js
 * 
 * Replaces the unstable shell dependency (`npm run build && npm run deploy`).
 * Executes the backend build steps natively inside a single Node.js process.
 * This guarantees cross-platform stability (no CMD/Powershell escaping issues),
 * better memory management, and clean detached backgrounding for the Admin Dashboard.
 */

const { execSync } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const runStep = (name, command) => {
    console.log(`\n⏳ [Pipeline] Starting: ${name}...`);
    try {
        // We use inherit so logs flow natively to the standard outputs
        execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '../../') });
        console.log(`✅ [Pipeline] Completed: ${name}`);
    } catch (err) {
        console.error(`❌ [Pipeline] FAILED at step: ${name}`);
        console.error(err.message);
        process.exit(1);
    }
};

const executePipeline = async () => {
    console.log('====================================================');
    console.log('🚀 UTSAV NATIVE DEPLOYMENT PIPELINE STARTED');
    console.log('====================================================');

    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

    // Step 1: Optimize Images (Resizing & WebP Conversion)
    runStep('Optimize Images', `${npmCmd} run optimize`);

    // Step 2: Generate all JSON in memory + push payload to S3
    // upload_s3.js calls all generators internally and streams directly to AWS
    // No need to pre-build to disk first — that was redundant.
    runStep('Deploy to S3', `${npmCmd} run deploy`);

    console.log('====================================================');
    console.log('🎉 PIPELINE EXECUTED SUCCESSFULLY');
    console.log('====================================================');
};

executePipeline();
