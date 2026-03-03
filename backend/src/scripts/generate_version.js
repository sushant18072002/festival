const fs = require('fs');
const path = require('path');

const VERSION_DIR = path.join(__dirname, '../../data/json/version');

if (!fs.existsSync(VERSION_DIR)) {
    fs.mkdirSync(VERSION_DIR, { recursive: true });
}

// Generate a simple timestamp version
// We use a timestamp so the Flutter app knows when data has changed
const versionData = {
    version: Date.now(),
    generatedAt: new Date().toISOString()
};

const filePath = path.join(VERSION_DIR, 'version.json');
fs.writeFileSync(filePath, JSON.stringify(versionData, null, 2));

console.log(`[Version] Generated global data version ${versionData.version} at ${filePath}`);
