const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

async function generateManifest() {
    try {
        console.log('📝 Generating Build Manifest...');

        let commitHash = 'unknown';
        let branch = 'unknown';

        try {
            commitHash = execSync('git rev-parse HEAD').toString().trim();
            branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        } catch (e) {
            console.log('⚠️ Git information not available.');
        }

        const manifest = {
            buildTimestamp: new Date().toISOString(),
            commitHash,
            branch,
            environment: process.env.NODE_ENV || 'development'
        };

        const manifestPath = path.join(__dirname, '../../data/json/manifest.json');
        await fs.ensureDir(path.dirname(manifestPath));
        await fs.writeJson(manifestPath, manifest, { spaces: 2 });

        console.log(`✅ Build manifest generated at ${manifestPath}`);
    } catch (error) {
        console.error('❌ Failed to generate build manifest:', error);
    }
}

generateManifest();
