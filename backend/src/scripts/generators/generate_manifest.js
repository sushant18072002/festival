const { execSync } = require('child_process');

async function generateManifestMemory() {
    try {
        console.log('📝 Generating Build Manifest in Memory...');

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

        return {
            'manifest.json': JSON.stringify(manifest, null, 2)
        };
    } catch (error) {
        console.error('❌ Failed to generate build manifest:', error);
        return {};
    }
}

module.exports = { generateManifestMemory };
